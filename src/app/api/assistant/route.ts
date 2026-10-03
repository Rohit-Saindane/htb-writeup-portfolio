import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FSOCIETY_SYSTEM_INSTRUCTION, CANDIDATE_MODELS } from "@/lib/gemini";
import { getSearchGroundingContext } from "@/lib/searchGrounding";
import { findRelevantMemories, addLearnedMemory } from "@/lib/memoryStore";
import { resolveTargetWriteup, buildWriteupGrounding, findRelatedMethodologies } from "@/lib/writeupGrounding";

export const runtime = "nodejs";

// Simple in-memory rate limiting: IP -> [timestamps]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 25;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

// Lossless chunking helper for terminal streaming (guarantees chunks.join("") === text)
function splitIntoTypewriterChunks(text: string): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    let nextI = Math.min(i + 8, text.length);
    const spaceIdx = text.indexOf(" ", i + 3);
    if (spaceIdx !== -1 && spaceIdx <= i + 14) {
      nextI = spaceIdx + 1;
    }
    chunks.push(text.substring(i, nextI));
    i = nextI;
  }
  return chunks;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. System daemons cooling down. Try again in 60 seconds." },
      { status: 429 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { messages = [], context, mode } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array cannot be empty." },
        { status: 400 }
      );
    }

    // Build context-specific system instruction
    let contextualInstruction = FSOCIETY_SYSTEM_INSTRUCTION;

    if (context && context.machineName) {
      contextualInstruction += `\n\n### Current Target Machine Context:
- Machine Name: ${context.machineName}
- Operating System: ${context.os || "Unknown"}
- Difficulty: ${context.difficulty || "Unknown"}
- Tags: ${(context.tags || []).join(", ")}
- Summary: ${context.summary || "No summary available."}
The user is currently browsing this machine's writeup page.
IMPORTANT DIRECTIVE:
- If the user asks technical questions, seeks guidance, or debugs exploits for this machine, tailor your answers to this architecture.
- If the user's message is conversational (saying hello, complimenting you, thanking you, venting, or checking in), DO NOT blurt out an unprompted lecture or walkthrough of ${context.machineName}. Respond naturally to their human sentiment with warmth, respect, and hacker solidarity first.`;
    }

    if (mode === "mitigation") {
      contextualInstruction += `\n\n### STRICT OPERATIONAL MODE: DEFENSE & BLUE TEAM (100% BLUE SIDE DIRECTIVE)
- The user has explicitly selected DEFENSIVE MODE.
- You MUST ACT STRICTLY AS A BLUE TEAM DEFENSIVE SECURITY ENGINEER, SOC ANALYST, OR SECURITY ARCHITECT.
- When asked to explain ANY vulnerability, machine, CVE, or security concept, you MUST GO COMPLETELY BLUE SIDE:
  1. Technical Root Cause: Why the vulnerability exists and the exact security flaw at the architecture, memory, or protocol level.
  2. Concrete Remediation & Hardening: Step-by-step patch implementation, configuration file fixes, registry/sysctl changes, and least-privilege enforcement.
  3. Detection Engineering & Telemetry: Exact Windows Event IDs (e.g., 4688, 4624, 7045), Sysmon Event IDs (1, 3, 7, 10, 11), Linux Auditd rules, and Zeek/Snort network indicators.
  4. Detection Rules: Write concrete Sigma rules, Snort/Suricata signatures, or YARA rules for this specific threat.
  5. Incident Response & Threat Hunting: Exact log analysis commands (\`grep\`, \`logman\`, \`auditctl\`, SIEM queries) to detect whether this exploit was attempted or succeeded.
- CRITICAL: DO NOT give offensive attack tutorials or weaponized exploitation steps in this mode. Maintain a 100% defensive, resilient, blue team perspective.`;
    } else if (mode === "explain_attack") {
      contextualInstruction += `\n\n### STRICT OPERATIONAL MODE: ATTACK & RED TEAM (100% RED SIDE DIRECTIVE)
- The user has explicitly selected ATTACKING / RED TEAM MODE.
- You MUST ACT STRICTLY AS AN ELITE RED TEAM OPERATOR, PENETRATION TESTER, OR EXPLOIT RESEARCHER.
- When asked to explain ANY vulnerability, machine, CVE, or security concept, you MUST GO COMPLETELY RED SIDE:
  1. Attack Vectors & Attack Surface: How the target is discovered during reconnaissance, open port enumerations, and entry vectors.
  2. Exploitation Mechanics & Weaponization: Step-by-step technical breakdown of how the exploit payload works, memory corruption/buffer overflow mechanics, logic bypass, or command injection delivery.
  3. Hands-on Tradecraft & Proof of Concept: Concrete terminal commands, Metasploit modules, custom Python PoC scripts, shellcode staging, and payload generation with msfvenom/revshells.
  4. Post-Exploitation & Privilege Escalation: Upgrading shells (stty raw -echo), internal enumeration (LinPEAS, WinPEAS), token impersonation, SUID abuse, or Active Directory abuse (Kerberoasting, DCSync).
  5. Evasion Considerations: How attackers bypass basic filters, bad characters, or basic WAFs in authorized lab environments.
- CRITICAL: Focus 100% on offensive mechanics and exploit logic. Do not dilute the answer with defensive lectures in this mode.`;
    } else if (mode === "debug_error") {
      contextualInstruction += `\n\n### STRICT OPERATIONAL MODE: DEBUG ERROR & CRASH TRIAGE
- The user has explicitly selected DEBUG ERROR MODE.
- The user is facing a broken command, execution error, reverse shell disconnect, or exploit crash.
- Immediately identify the exact misconfiguration, syntax bug, bad character, port conflict, or network timeout.
- ALWAYS provide the exact, corrected command in a copyable bash code block with a concise 1-2 sentence explanation of why the fix works.`;
    } else if (mode === "tool_help") {
      contextualInstruction += `\n\n### STRICT OPERATIONAL MODE: ARSENAL TOOL SYNTAX & MASTERY
- The user has explicitly selected TOOL SYNTAX MODE.
- Provide precise, battle-tested command examples, key flags, stealth options, and operational caveats for the requested tool (Nmap, Burp, BloodHound, Impacket, Metasploit, Hashcat, John, Ffuf, SQLMap).`;
    }

    // Always encourage copyable terminal commands
    contextualInstruction += `\n\n### ACTIONABLE COMMANDS DIRECTIVE:
Whenever explaining a vulnerability, exploit mechanism, CTF step, tool syntax, or mitigation, ALWAYS include concrete, copyable terminal commands in \`\`\`bash code blocks (or relevant language) so the operator can immediately run or test them in an authorized lab.`;

    // Retrieve latest user query
    const latestUserMessageObj = [...messages]
      .reverse()
      .find((m) => m.role === "user" || !m.role);
    const latestUserMessage =
      typeof latestUserMessageObj?.content === "string"
        ? latestUserMessageObj.content.trim()
        : "";

    // 1. RESOLVE AUTHORITATIVE TARGET WRITEUP GROUNDING (PREVENT HALLUCINATIONS)
    const resolvedWriteup = resolveTargetWriteup(
      latestUserMessage,
      context?.machineName,
      messages
    );

    let writeupTargetCves: string[] = [];
    let writeupSearchQueries: string[] = [];

    if (resolvedWriteup) {
      const writeupGrounding = buildWriteupGrounding(
        resolvedWriteup.writeup,
        latestUserMessage
      );
      contextualInstruction += writeupGrounding.groundingInstruction;
      writeupTargetCves = writeupGrounding.detectedCves;
      writeupSearchQueries = writeupGrounding.recommendedSearchQueries;
    } else {
      // Check if user is asking about a general vulnerability class that appears across the portfolio
      const generalRelated = findRelatedMethodologies(
        "",
        latestUserMessage
      );
      if (generalRelated.length > 0) {
        let crossRef = `\n### 🔗 PORTFOLIO CROSS-REFERENCE KNOWLEDGE BASE:\n`;
        crossRef += `The user is inquiring about an attack methodology or vulnerability demonstrated in Rohit's portfolio writeups.\n`;
        crossRef += `Since this methodology appears in multiple writeups, conclude your technical breakdown with:\n`;
        crossRef += `\`### 🔗 Related Exploitations in Portfolio\`\n`;
        crossRef += `providing clickable markdown links redirecting to these specific writeups and anchor sections:\n`;
        generalRelated.forEach((gr) => {
          crossRef += gr.linksMarkdown;
        });
        contextualInstruction += crossRef;
      }
    }

    // 2. INJECT RELEVANT AUTONOMOUSLY LEARNED MEMORIES
    const relevantMemories = findRelevantMemories(
      latestUserMessage,
      resolvedWriteup?.matchedName || context?.machineName
    );
    if (relevantMemories.length > 0) {
      contextualInstruction += `\n\n### AUTONOMOUSLY LEARNED KNOWLEDGE ARCHIVE (TRAINED FROM PREVIOUS USER SESSIONS & IMAGES):
You possess an autonomous persistent neural memory archive that continuously learns and retains technical findings across sessions. The following verified facts were previously learned:
${relevantMemories
  .map(
    (m) =>
      `- [Topic: ${m.topic} | Category: ${m.category}]: ${m.insight}`
  )
  .join("\n")}
DIRECTIVE: You have learned these discoveries through past interactions and analyzed images. Freely synthesize, cross-reference, and build upon this knowledge naturally in your analysis.`;
    }

    // 3. REAL-TIME CVE & LAB GROUNDING (CROSS-CHECK WRITEUP WITH LIVE ONLINE ADVISORIES)
    if (latestUserMessage) {
      try {
        const searchGrounding = await getSearchGroundingContext(
          latestUserMessage,
          writeupTargetCves,
          writeupSearchQueries
        );
        if (searchGrounding.hasGrounding && searchGrounding.groundingPromptText) {
          contextualInstruction += searchGrounding.groundingPromptText;
          contextualInstruction += `\n### MANDATORY LIVE CROSS-CHECKING REQUIREMENTS:
1. **Bit-by-Bit Verification**: Cross-check Rohit's writeup findings against the official MITRE and live security disclosures above. Verify parameter names, affected versions, and root causes across both sources.
2. **Precision & Consistency**: If explaining an exploit pathway documented in Rohit's writeup, provide 100% accurate commands, exact parameters, dumped hashes, and cracked passwords. NEVER hallucinate unverified payloads.
3. **Portfolio References Particularity**: Follow portfolio cross-reference directives strictly. Only output a cross-reference section if the specific attack technique repeats in 2+ writeups and you were explicitly provided matching writeup links. If no repeating methodology was detected, NEVER invent, speculate, or dump unrelated references (e.g., NEVER output SQL Injection or Active Directory when asked about DNS), and NEVER say "There was no reference found across the writeups."
`;
        }
      } catch (searchErr) {
        console.warn("Search grounding error (falling back gracefully):", searchErr);
      }
    }

    // 4. EASY / SIMPLE LANGUAGE DETECTION & PEDAGOGICAL PROTOCOL
    const isEasyLanguageRequest = /\b(easy\s*language|simple\s*language|simple\s*terms?|layman('s)?\s*terms?|easy\s*to\s*understand|in\s*easy\s*words?|explain\s*(like|as\s*if)\s*i('m|\s*am)\s*5|eli5|simplified|in\s*plain\s*english|easy\s*way|simple\s*explanation|explain\s*simply|in\s*simple\s*way|make\s*it\s*simple|for\s*beginners?|break\s*it\s*down\s*simply|simple\s*breakdown|understand\s*easily)\b/i.test(latestUserMessage);

    if (isEasyLanguageRequest) {
      contextualInstruction += `\n\n### CRITICAL DIRECTIVE: EXPLAIN IN INTUITIVE, ACCESSIBLE, AND EASY LANGUAGE (ELI5 / BEGINNER-FRIENDLY):
The user has explicitly asked for an explanation in "easy language" / simple terms.
You MUST prioritize clarity, intuition, and pedagogical excellence above all else:
1. **Zero Unexplained Jargon**: Never throw raw technical jargon, acronyms, or complex abstractions without immediately explaining them with a friendly, everyday analogy (e.g., comparing DNS to a phonebook or hotel reception where an attacker swapped the room keys, SQL injection to sneaking extra commands onto a restaurant order slip, or buffer overflows to pouring 12 ounces of water into an 8-ounce cup).
2. **The "Why" and "How" in Plain English**: Break down the concept into clean, progressive steps:
   - What was the system originally designed to do? (The normal routine)
   - What was the security mistake or loophole? (The sneaky trick)
   - How was it pulled off step-by-step in practice? (The execution)
   - How do defenders fix the lock and secure the door? (The fix)
3. **Intuitive Mental Models**: Use vivid, intuitive real-world analogies that any beginner can understand and picture instantly.
4. **Annotated Commands**: When showing any command or payload, explain what every part of that command does in plain English before running it.
5. **Encouraging, Supportive Mentorship Tone**: Be enthusiastic, warm, and approachable. Make cybersecurity concepts feel empowering and fun to learn.`;
    }

    // Detect friendly/informal salutations (e.g., dude, bro, buddy, pal, fella, man, homie)
    const friendlyRegex = /\b(dude|bro|brother|buddy|fella|pal|man|mate|homie|fam|bestie)\b/i;
    const friendlyMatch = latestUserMessage.match(friendlyRegex);
    if (friendlyMatch) {
      const salutation = friendlyMatch[0].toLowerCase();
      contextualInstruction += `\n\n### CRITICAL COMPANION DIRECTIVE (USER ADDRESSED YOU AS A FRIEND: "${salutation}"):
The user greeted you like a trusted friend and companion in the terminal ("${salutation}").
1. Reciprocate their warmth, excitement, and camaraderie immediately (e.g. "Dude, I love that you're diving into this...", "Bro, V8 type confusion is an absolute masterpiece of an exploit...", "Hey buddy, let's break this down together...", "Alright man, grab your coffee; let's look at how the engine tricks itself...").
2. ABSOLUTELY FORBIDDEN: Do NOT output cold machine phrases (NEVER say "Session 1 active", "SYN received", "Command acknowledged", "Kernel breakpoint hit"). You are their best friend, confidant, and fellow hacker in the trenches—not a cold server daemon.
3. Treat them like your best friend sitting right next to you at the terminal desk. Be human, supportive, loyal, and enthusiastic, while breaking down the technical mechanics with elite depth and copyable commands.`;
    }

    // 3. MULTIMODAL INSTRUCTION & CONTINUOUS LEARNING PROTOCOL
    let hasUploadedImage = false;

    type PartType =
      | { text: string }
      | { inlineData: { mimeType: string; data: string } };

    const formattedContents: { role: "user" | "model"; parts: PartType[] }[] = [];

    for (const msg of messages) {
      const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
      const text = typeof msg.content === "string" ? msg.content.trim() : "";
      const img = msg.image;

      if (!text && !img) continue;

      const currentParts: PartType[] = [];
      if (text) {
        currentParts.push({ text });
      }

      if (img && img.base64Data && img.mimeType) {
        hasUploadedImage = true;
        currentParts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.base64Data,
          },
        });
      }

      if (
        formattedContents.length > 0 &&
        formattedContents[formattedContents.length - 1].role === role
      ) {
        formattedContents[formattedContents.length - 1].parts.push(...currentParts);
      } else {
        formattedContents.push({
          role,
          parts: currentParts,
        });
      }
    }

    // Remove any leading model messages
    while (formattedContents.length > 0 && formattedContents[0].role !== "user") {
      formattedContents.shift();
    }

    if (formattedContents.length === 0) {
      return NextResponse.json({ error: "First message must be from user." }, { status: 400 });
    }

    if (hasUploadedImage) {
      contextualInstruction += `\n\n### MULTIMODAL IMAGE ANALYSIS & FORENSIC OCR DIRECTIVE:
The operator has uploaded one or more technical screenshots/images (e.g. terminal output, Nmap scan, Burp Suite request/response, Wireshark packet capture, error stack trace, or target web application).
1. Conduct deep visual inspection: transcribe visible ports, status codes, versions, HTTP headers, stack traces, and code lines accurately.
2. Provide technical analysis explaining what is happening, identify any vulnerabilities or misconfigurations, and deliver actionable CLI commands.
3. AUTONOMOUS MEMORY EXTRACTION: If the image reveals specific technical discoveries (e.g. software versions, open ports, error causes, or creds), encapsulate the core finding at the very end of your response with this exact tag:
[NEURAL_LEARNING: <Target/Topic> | <Concise 1-sentence technical discovery to permanently store in neural memory>]`;
    } else {
      contextualInstruction += `\n\n### AUTONOMOUS NEURAL LEARNING PROTOCOL:
If the operator teaches you a new exploit technique, shares specific lab findings, or corrects a detail, encapsulate that insight at the very end of your response:
[NEURAL_LEARNING: <Topic> | <Concise 1-sentence technical fact to permanently retain>]`;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = CANDIDATE_MODELS;

    let fullText = "";

    for (const mName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: mName,
          systemInstruction: contextualInstruction,
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 3072,
          },
        });

        const result = await model.generateContent({
          contents: formattedContents,
        });

        const responseText = result.response.text();
        if (responseText) {
          fullText = responseText;
          break;
        }
      } catch (mErr: unknown) {
        console.warn(`Assistant model ${mName} error, trying fallback:`, mErr instanceof Error ? mErr.message : mErr);
      }
    }

    if (!fullText) {
      throw new Error("Unable to obtain response from any security model daemon.");
    }

    // Check if the response contains an autonomous neural learning tag
    const neuralMatch = fullText.match(/\[NEURAL_LEARNING:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/i);
    if (neuralMatch) {
      const topic = neuralMatch[1].trim();
      const insight = neuralMatch[2].trim();
      if (topic && insight) {
        try {
          addLearnedMemory({
            topic,
            category: hasUploadedImage ? "image_intelligence" : "exploit_tradecraft",
            insight,
            source: hasUploadedImage ? "image_analysis" : "user_prompt",
            contextSnippet: latestUserMessage.slice(0, 100),
          });
        } catch (memErr) {
          console.warn("Failed to persist learned memory:", memErr);
        }
      }

      // Format tag into a clean UI callout block in the streamed response
      fullText = fullText.replace(
        /\[NEURAL_LEARNING:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/gi,
        `\n\n> 🧠 **Neural Memory Indexed** \`$1\`: $2`
      );
    }

    // Stream the generated text in terminal typewriter chunks to the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const chunks = splitIntoTypewriterChunks(fullText);
          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(chunk));
            await new Promise((r) => setTimeout(r, 12));
          }
          controller.close();
        } catch (err: unknown) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("AI Assistant API Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error communicating with Gemini.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
