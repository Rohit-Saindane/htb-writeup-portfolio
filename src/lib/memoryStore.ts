import fs from "fs";
import path from "path";

export interface LearnedMemory {
  id: string;
  timestamp: string;
  topic: string;
  category: "image_intelligence" | "exploit_tradecraft" | "machine_target" | "system_troubleshooting" | "tool_syntax";
  insight: string;
  source: "image_analysis" | "user_prompt" | "system";
  contextSnippet?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const MEMORY_FILE = path.join(DATA_DIR, "learned_memories.json");

// Initial baseline memory seeds so the model demonstrates learned recall immediately
const BASELINE_MEMORIES: LearnedMemory[] = [
  {
    id: "mem-seed-1",
    timestamp: "2026-04-10T12:00:00.000Z",
    topic: "CCTV",
    category: "machine_target",
    insight: "CCTV machine features authenticated ZoneMinder SQLi (CVE-2024-51428) in the 'tid' parameter of the removetag action to dump user hashes and SSH in as mark, followed by motionEye command injection (CVE-2025-60787) via unauthenticated local API for root privesc.",
    source: "system",
  },
  {
    id: "mem-seed-2",
    timestamp: "2026-04-12T14:30:00.000Z",
    topic: "Pirate",
    category: "machine_target",
    insight: "Pirate is a Windows Server 2019 Active Directory machine vulnerable to PetitPotam NTLM relay and Resource-Based Constrained Delegation (RBCD) to compromise the domain controller.",
    source: "system",
  },
  {
    id: "mem-seed-3",
    timestamp: "2026-04-15T09:15:00.000Z",
    topic: "VariaType",
    category: "machine_target",
    insight: "VariaType exploits an exposed Git repo, fontTools CDATA XML Injection (CVE-2025-66034) for foothold, and setuptools PackageIndex path traversal (CVE-2025-47273) for root.",
    source: "system",
  },
  {
    id: "mem-seed-4",
    timestamp: "2026-04-18T18:45:00.000Z",
    topic: "Burp Suite",
    category: "tool_syntax",
    insight: "When analyzing multipart form file uploads, tampering the Content-Type header or injecting trailing null bytes/alternate extensions can bypass simple mime checking.",
    source: "system",
  },
];

// In-memory cache
let memoryCache: LearnedMemory[] | null = null;

function ensureStorage(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(MEMORY_FILE)) {
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(BASELINE_MEMORIES, null, 2), "utf-8");
      memoryCache = [...BASELINE_MEMORIES];
    }
  } catch (err) {
    console.warn("Could not ensure memory store directory:", err);
  }
}

export function getAllMemories(): LearnedMemory[] {
  if (memoryCache) {
    return memoryCache;
  }

  ensureStorage();

  try {
    if (fs.existsSync(MEMORY_FILE)) {
      const data = fs.readFileSync(MEMORY_FILE, "utf-8");
      memoryCache = JSON.parse(data);
      return memoryCache || [];
    }
  } catch (err) {
    console.error("Error reading learned_memories.json:", err);
  }

  return BASELINE_MEMORIES;
}

export function addLearnedMemory(
  item: Omit<LearnedMemory, "id" | "timestamp">
): LearnedMemory {
  const current = getAllMemories();

  // Deduplicate if identical insight already exists
  const existing = current.find(
    (m) =>
      m.topic.toLowerCase() === item.topic.toLowerCase() &&
      m.insight.toLowerCase() === item.insight.toLowerCase()
  );

  if (existing) {
    return existing;
  }

  const newMemory: LearnedMemory = {
    ...item,
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  const updated = [newMemory, ...current];
  memoryCache = updated;

  ensureStorage();

  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to learned_memories.json:", err);
  }

  return newMemory;
}

export function deleteMemory(id: string): boolean {
  const current = getAllMemories();
  const filtered = current.filter((m) => m.id !== id);

  if (filtered.length === current.length) {
    return false;
  }

  memoryCache = filtered;
  ensureStorage();

  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error deleting from learned_memories.json:", err);
    return false;
  }
}

export function clearMemories(): void {
  memoryCache = [];
  ensureStorage();

  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify([], null, 2), "utf-8");
  } catch (err) {
    console.error("Error clearing learned_memories.json:", err);
  }
}

export function findRelevantMemories(
  query: string,
  targetMachine?: string
): LearnedMemory[] {
  const all = getAllMemories();
  if (all.length === 0) return [];

  const lowerQuery = query.toLowerCase();
  const lowerMachine = targetMachine?.toLowerCase() || "";

  // Rank memories by relevance
  const scored = all.map((mem) => {
    let score = 0;
    const lowerTopic = mem.topic.toLowerCase();
    const lowerInsight = mem.insight.toLowerCase();

    // Direct machine match
    if (lowerMachine && (lowerTopic.includes(lowerMachine) || lowerMachine.includes(lowerTopic))) {
      score += 50;
    }

    // Direct topic in query match
    if (lowerQuery.includes(lowerTopic)) {
      score += 40;
    }

    // Word matches in query
    const words = lowerQuery.split(/\s+/).filter((w) => w.length > 3);
    for (const w of words) {
      if (lowerTopic.includes(w)) score += 15;
      if (lowerInsight.includes(w)) score += 8;
    }

    // Boost recent learnings
    const ageDays = (Date.now() - new Date(mem.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays < 7) score += 5;

    return { mem, score };
  });

  const relevant = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((s) => s.mem);

  // If no specific match but total memories exist, provide up to 3 most recent learnings
  if (relevant.length === 0) {
    return all.slice(0, 3);
  }

  return relevant;
}
