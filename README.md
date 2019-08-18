# mydyn: Dynamic DNS for Route53

## Description

This repository provides a **dynamic DNS (dyndns)** solution for users of a **domain**  registered with **Route53 in Amazon Cloud**. 

### DynDNS: Problem and Solution ###
The IP address of a small office or home office (SOHO) Internet connection does not always stay the same.
Some providers regularly disconnect your IP connection for a short moment and then reconnect you with a different IP address. Similarly, if for whatever reason your connection goes down
and is reestablished, it might end up with a different IP address. Thus, your SOHO network is not reachable under the same IP address. After a change you will not know the new IP address
and cannot contact you SOHO network from the Internet or operate a server under a well-known address. There are solutions where after an IP address refresh the new address is sent to your
email inbox, but this solution is not really convenient.

DynDNS is a solution for this problem, where a DNS hostname name is used as permanent, stable address for your network. The hostname may be part of your own domain (such as: mymachine.myname.com)
or may be offered by a DynDNS service provider (such as: mymachine.ddnss.de). Whenever your SOHO network gets a fresh address is contacts the server of this DynDNS service. The server 
determines the IP address of your SOHO network and binds the DNS hostname to the correct new IP address.

This solution has a nunber of disadvantages. The DynDNS service has to be paid for or offers freemium solutions which require you to refresh your registration frequently. Your hostname is part
of the domain name of the DynDNS service and not part of your own domain - or you have to give the DynDNS service the capability to write name server records for your domain. Therefore
it is nice to control such a DynDNS service on your own. This is particularly easy when you have your domain registered with Route53, a service available in the Amazon Web Service cloud.

### Requirements ###
You have a box running inside of your SOHO network which is able to run node.js. 


## Other Solutions ###

There are already several dynDNS solutions available for AWS Route53:

 seem unnecessarily complex. Some require the API gateway to map calls to Lambda functions, the use Lambda functions, they employ DynamoDB to store state, 
they use cloud formation techniques and templates for deploying all this. While this is state of the art in AWS, it is disproportionately complex for updating your DNS A-record.
gets you tightly locked-in to Amazon cloud. Other solutions employ PHP (oldish), perl (unreadable) or python (tab-indented). I could not make myself enjoy them. 

## Solution

I provide a node based application. It sets the DNS A-record in Route53 using the aws Javascript API. It can be deployed in to ways, (1) as webservice, (2) as cron job or (3) manually.

If deployed as webservice it provides a URL which, when called, initiates an update of the A-record.

If deployed as cron job it regularly initiates an update of the A-record.

If deployed manually you use it for updating the A-record on the command line.

#### What do we do upon a check?

1. Obtain the current IP we are running on.
1. Obtain the IP registered in our A-record.
1. Compare.
1. If different, change the A-record.


#### How do we initiate a check?


## Installation

Requirements: A local installation of node.js and npm.

1. Download this repository into /tmp
1. Install the software
1. Configure the system by editing /etc/mydyn/conf.js

```
  cd tmp
  git clone https://github.com/clecap/mydyn.git
  cd mydyn
  sudo install
  sudo vi /etc/mydyn/conf.js
``` 


### Use it as a Web Service


### Use it as self-controlled Cron Job


### Use it as a system-contolled Cron Job

### Use it Manually

```
  node setip.js manual
``` 



## Security Aspects


#### Fake current IP ####
An attacker could manage to fake the information we get on the current IP we are running on. In this case our domain gets bound to an incorrect IP
and a user of our domain is directed to a diferent site. This should be detected by certificates confirming the correct identity of the partner. The risc can be reduced by:
* Using only trustworthy sources for determining the current IP
* Using https when accessing the respective service
* Using our own service for determining the current IP



## Service

For starting, checking and stopping the service, use the following commands:
```
  service mydyn start
  service mydyn status
  service mydyn stop
```


## Log, Bugs and Hints

The system logs into /var/log/









