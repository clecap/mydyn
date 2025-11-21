




/** IMPORT required functionality **/
const fetch      = require ('node-fetch');
const dns        = require ('dns');
const AWS        = require ('aws-sdk');
const express    = require ('express');
const nodemailer = require ('nodemailer');
const log4js     = require('log4js');

const C = require ("/etc/mydyn/conf.js");     // load configuration - MAKE ADJUSTMENTS, see README.md

/** LOGGING is done using the function  LOG.info (<string>)
 *  Calling logToFile has us log to /var/log/mydyn.log, else we log to console
 */

var LOG = {info: console.log};

function logToFile () {  // configures system so as to log to a file using log4js
  log4js.configure({
    appenders:  {everything: { type: 'file', filename: '/var/log/mydyn.log' } },
    categories: { default: { appenders: [ 'everything' ], level: 'info'} }
  });
  LOG = log4js.getLogger();
  LOG.info('Started logging');
}



// implement methods to get current IP; must return a promise resolving to the current IP
function getCurrentIP_mi () { return fetch('https://api.myip.com').then(res => res.json().then ( js => js.ip ) ) }

// select the one we want to use; use one version implemented here as fallback
const getCurrentIP = (C.GET_IP ? C.GET_IP : getCurrentIP_mi);


AWS.config.update({accessKeyId: C.ACCESS_KEY, secretAccessKey: C.SECRET_KEY});
const route53 = new AWS.Route53();
  

function listHostedZones () {
  route53.listHostedZones({}, function(err,data) {if(!err) {LOG.info (data);} else {LOG.info ("ERROR: " , err);} });
}  


function setIPNow () {
  getCurrentIP(fetch).then ( ip => { 
    LOG.info ("Found current IP: " + ip);
    setTo (ip); 
  });
}


function setIPNowIfDifferent () {
  var currentPromise    = C.GET_IP();
  var registeredPromise = getRegisteredIP();
  Promise.all ([currentPromise, registeredPromise]).then( ( [cur, reg] ) => {
    if (cur == reg) { LOG.info ("Current and registered IPs are both equal to " + cur + "  doing nothing"); }
    else            { LOG.info ("Current IP=" + cur + " is different from registered IP=" + reg + " initiating an update"); setTo (cur);}
  })
  .catch ( (x) => LOG.info ("One of the promises failed: " + JSON.stringify (x) ) );
}
  

function setTo (ip) {  
  var params = {
    "HostedZoneId": '/hostedzone/' + C.HOSTED_ZONE,
    "ChangeBatch": {
      "Changes": [ 
        {"Action": "UPSERT", "ResourceRecordSet": {"Name": C.DOMAIN, "Type": "A", "TTL": C.TTL, "ResourceRecords": [{"Value": ip}] }  },
        {"Action": "UPSERT", "ResourceRecordSet": {"Name": C.DOMAIN2, "Type": "A", "TTL": C.TTL, "ResourceRecords": [{"Value": ip}] }  }      
        ]
    }  };

  route53.changeResourceRecordSets(params, function(err,data) {
    LOG.info ("asking Route53 to change record set to: " + JSON.stringify (params));
    LOG.info ("Route53 replied:  \n", "  Error: " + JSON.stringify(err) + "\n  Data: " + JSON.stringify(data) );
    if (!err) {  // if there was no error, check and log the propagation status throughtou the DNS system
      LOG.info ("will now schedule checks");
      setTimeout ( ()=>checkChange (data.ChangeInfo.Id,   5000) ,   5000);    // after 5 seconds
      setTimeout ( ()=>checkChange (data.ChangeInfo.Id,  10000) ,  10000);    // after 10 seconds
      setTimeout ( ()=>checkChange (data.ChangeInfo.Id,  60000) ,  60000);    // after 1 minute
      setTimeout ( ()=>checkChange (data.ChangeInfo.Id, 120000) , 120000);    // after 2 minutes
      LOG.info ("Scheduled checks");
    }
    sendMail ("set to ip", JSON.stringify(err) + "\n" + JSON.stringify(data));  
  });   
}
  
 
function checkChange (Id, atDelay) { 
  LOG.info ("Will now check back with Route53");
  route53.getChange( {Id:Id}, function(err, data) {
    LOG.info ("Checked back with Route53 after " + atDelay + "[ms] for" + Id + " and received " + JSON.stringify (data) + " and error=" + JSON.stringify (err));    
  });
}


// return promise resolving to the IP address registered for DOMAIN
function getRegisteredIP () {return new Promise ( (resolve, reject) => { dns.lookup ( C.DOMAIN, 4, (err, address) => {if (err) reject(err); else resolve (address);} ) } );  }
  


// method to send an email
function sendMail (subject, body) {
  LOG.info ("sending mail...");
  try {
    const transporter = nodemailer.createTransport( {
      host: C.SMTP_SERVER,
      port: C.SMTP_PORT,
      secure: true,
      auth: { user: C.SMTP_USER, pass: C.SMTP_PASSWORD},
      tls:{ciphers:'SSLv3'}
    } );

    var mailOptions = {from: C.SMTP_FROM, to: C.SMTP_TO, subject: subject, text: body };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {LOG.info("Error sending mail: " + JSON.stringify(error) );} else { LOG.info ('Email sent: ' + info.response);}
    });
  } catch (x) {LOG.info ("Exception while trying to send mail...");  LOG.info ( JSON.stringify(x) );}
}


function setupServer () {
  const app  = express();
  app.listen(C.PORT, C.HOST, function() {LOG.info ("Starting to listen");});
  
  app.get('/mydyn/send-test-mail', (req, res) => {
    sendMail ("Testmail", "Das ist eine testmail von send-test-mail");
    res.send('Hello World!');
  });

  app.get('/mydyn/set-ip', (req, res) => {
    LOG.info ("server was called at /mydyn/set-ip");
    setIPNow();
    res.send('Did set IP'); 
  });

  app.get('/mydyn/shutdown', (req, res) => {
    LOG.info ("server was called at /mydyn/shutdown");    // TODO: attacksurface: attacker shuts down the system ??
    process.exit(0);
  });
}


function setupCron () { setInterval ( setIPNowIfDifferent, 10000); }


function init () {
  LOG.info ("Service mydyn initialized");
  // LOG.info ("Called with arguments: " + JSON.stringify(process.argv) );
  if (process.argv.length == 2)      {logToFile ();  setupServer (); }             // no arguments given:   log to file and start server  used in service definition of systemd
  else if (process.argv.length == 3) {
    switch (process.argv[2]) {
      case "manual":  setIPNow();      break;      // set it once and exit
      case "web":     setupServer();   break;      // start server
      case "cron":    setupCron();     break;
      default: console.log ("Call as node setip.js <opt>      where <opt> is missing or one of manual  web  cron");
    }
  }
  else {}
}

init();

//setIPNow();

// setupServer ();


