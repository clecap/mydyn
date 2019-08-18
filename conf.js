


/*** CONFIGURE AMAZON ACCESS ***/
const ACCESS_KEY  = "enter-the-access-key-for-your-aws-role";
const SECRET_KEY  = "enter-the-secret-key-for-your-aws-role";
const HOSTED_ZONE = "enter-the-id-for-your-hosted-route53-zone";

/*** CONFIGURE SYSTEM PARAMETERS ***/
const DOMAIN      = "www.yourdomain.com";        // enter your domain name
const TTL         = 30;

/*** CONFIGURE EMAIL (OPTIONAL) ***/
const SMTP_SERVER    = "hostname-of-smtp-server";
const SMTP_PORT      = 465;   // port of smtp server to be used
const SMTP_USER      = "smtp-user-which-sends-email";
const SMTP_PASSWORD  = "password-of-this-smtp-user";
const SMTP_FROM      = "from-email-address-showing-up-in-mail-envelope";
const SMTP_TO        = "email-address-to-which-info-is-sent";


const PORT           = 8080;  // port under which express server is run
const HOST          = "localhost";   // or IP address

// implement some methods for getting current IP address
function getCurrentIP_mi (fetcher) { return fetcher ('https://api.myip.com').then(res => res.json().then ( js => js.ip ) ) }

// function getCurrentIP_he (fetcher) { return fetcher('https://SOMEDOMAINNAME/getip.php', {headers: {"X-Pragma-Header": "Some-header-value"} } ).then(res => res.text().then ( js => js ) ) }

// select a method
const GET_IP = getCurrentIP_mi;   

module.exports = {
  ACCESS_KEY,
  SECRET_KEY,
  HOSTED_ZONE,
  DOMAIN,
  TTL,
  SMTP_SERVER,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
  SMTP_TO,
  PORT,
  HOST,
  GET_IP
};



