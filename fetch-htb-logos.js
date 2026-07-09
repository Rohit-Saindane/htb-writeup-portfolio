/**
 * fetch-htb-logos.js
 *
 * Downloads the official machine avatar/logo for each of your HTB writeups
 * and saves them locally so your Next.js app can serve them as static assets
 * (no live API calls needed from the browser — fast, no token exposure, no
 * rate-limit risk on page load).
 *
 * SETUP:
 *   1. Get your App Token: HTB account -> Settings -> Profile Settings -> App Tokens -> Create Token
 *   2. Run:  HTB_APP_TOKEN="your_token_here" node fetch-htb-logos.js
 *   3. Logos land in ./machine-logos/<slug>.png
 *      Copy that folder into your Next.js project's /public/machine-logos/
 *
 * Requires Node.js 18+ (built-in fetch).
 */

const fs = require("fs");
const path = require("path");

const TOKEN = process.env.HTB_APP_TOKEN;
if (!TOKEN) {
  console.error("Missing HTB_APP_TOKEN. Run: HTB_APP_TOKEN=xxxx node fetch-htb-logos.js");
  process.exit(1);
}

// slug: what your writeup/URL uses. htbName: exact name to query the HTB API with.
// Double-check "Elouia" below — the source file was oddly named, confirm the real machine name.
const MACHINES = [
  { slug: "devarea", htbName: "DevArea" },
  { slug: "facts", htbName: "Facts" },
  { slug: "garfield", htbName: "Garfield" },
  { slug: "interpreter", htbName: "Interpreter" },
  { slug: "kobold", htbName: "Kobold" },
  { slug: "logging", htbName: "Logging" },
  { slug: "pirate", htbName: "Pirate" },
  { slug: "silentium", htbName: "Silentium" },
  { slug: "variatype", htbName: "VariaType" },
  { slug: "wingdata", htbName: "WingData" },
  { slug: "cctv", htbName: "cctv" },
  { slug: "airtouch", htbName: "AirTouch" },
  { slug: "browsed", htbName: "Browsed" },
  { slug: "overwatch", htbName: "Overwatch" },
  { slug: "elouia", htbName: "Elouia" }, // <-- verify this name manually
];

const API_BASE = "https://labs.hackthebox.com/api/v4";
const OUT_DIR = path.join(__dirname, "machine-logos");

const COMMON_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
};

// Wraps fetch with a couple of retries and surfaces the *real* underlying
// error (Node's generic "fetch failed" hides the actual cause: DNS failure,
// TLS error, connection reset, etc).
async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      const cause = err.cause ? ` (cause: ${err.cause.code || err.cause.message || err.cause})` : "";
      if (attempt > retries) {
        throw new Error(`${err.message}${cause}`);
      }
      console.log(`  retrying (${attempt}/${retries})...${cause}`);
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
}

async function fetchMachineAvatar(name) {
  const res = await fetchWithRetry(`${API_BASE}/machine/profile/${encodeURIComponent(name)}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, ...COMMON_HEADERS },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for "${name}"`);
  }
  const data = await res.json();
  const avatarPath = data?.info?.avatar;
  if (!avatarPath) throw new Error(`No avatar field for "${name}"`);
  return avatarPath; // e.g. "/storage/avatars/4aee57cc02f0181b22f4ccd43775f7ac.png"
}

async function downloadImage(avatarPath, destFile) {
  const url = `https://labs.hackthebox.com${avatarPath}`;
  const res = await fetchWithRetry(url, { headers: COMMON_HEADERS });
  if (!res.ok) throw new Error(`Failed to download image: HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destFile, buffer);
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest = {};
  const failures = [];

  for (const { slug, htbName } of MACHINES) {
    try {
      const avatarPath = await fetchMachineAvatar(htbName);
      const ext = path.extname(avatarPath) || ".png";
      const destFile = path.join(OUT_DIR, `${slug}${ext}`);
      await downloadImage(avatarPath, destFile);
      manifest[slug] = `/machine-logos/${slug}${ext}`;
      console.log(`✓ ${htbName} -> ${slug}${ext}`);
    } catch (err) {
      failures.push({ htbName, slug, error: err.message });
      console.error(`✗ ${htbName}: ${err.message}`);
    }
    // small delay to be polite to the API / avoid tripping bot-detection
    await new Promise((r) => setTimeout(r, 700));
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\nDone. ${Object.keys(manifest).length}/${MACHINES.length} logos saved.`);
  if (failures.length) {
    console.log("\nFailed lookups (check the name spelling against the HTB machine page URL):");
    failures.forEach((f) => console.log(`  - ${f.htbName}`));
  }
  console.log(`\nCopy the "machine-logos" folder into your Next.js project's /public/ directory.`);
  console.log(`Then reference logos in your writeup metadata via manifest.json, e.g.:`);
  console.log(`  <Image src="/machine-logos/garfield.png" alt="Garfield machine icon" width={48} height={48} />`);
}

main();