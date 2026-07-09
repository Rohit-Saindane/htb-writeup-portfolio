const fs = require('fs');
const path = require('path');
const https = require('https');
const matter = require('gray-matter');

// Helper to manually parse .env.local or process environment for token
function getToken() {
  let token = process.env.HTB_APP_TOKEN;
  if (!token) {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/HTB_APP_TOKEN\s*=\s*["']?([^"'\r\n#]+)["']?/);
      if (match) {
        token = match[1].trim();
      }
    }
  }
  return token;
}

const token = getToken();
if (!token) {
  console.error('ERROR: HTB_APP_TOKEN not found. Please set it in your .env.local file or system environment variables.');
  process.exit(1);
}

const workspaceDir = process.cwd();
const contentDir = path.join(workspaceDir, 'content', 'writeups');
const localImageDir = path.join(workspaceDir, 'public', 'images', 'machines');
const dDriveImageDir = 'D:\\htb-logos';

// Helper to recursively find all writeup.mdx files
function getMdxFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMdxFiles(filePath));
    } else if (file === 'writeup.mdx') {
      results.push(filePath);
    }
  }
  return results;
}

// Ensure target directories exist
[localImageDir, dDriveImageDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper to make an authenticated HTTPS request
function getJson(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'Mozilla/5.0'
      }
    };
    https.get(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(body));
          } catch(e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`Status Code: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Helper to download an image file
function downloadFile(url, destPaths) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download image: status ${res.statusCode}`));
        return;
      }
      
      const streams = destPaths.map(p => fs.createWriteStream(p));
      res.on('data', (chunk) => {
        streams.forEach(stream => stream.write(chunk));
      });
      res.on('end', () => {
        streams.forEach(stream => stream.end());
        resolve();
      });
    }).on('error', reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const mdxFiles = getMdxFiles(contentDir);
  console.log(`Found ${mdxFiles.length} writeups.`);

  for (const filePath of mdxFiles) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    const title = data.title || data.machineName;
    const slug = path.basename(path.dirname(filePath)).toLowerCase();

    // Destination paths
    const destLocal = path.join(localImageDir, `${slug}.png`);
    const destDDrive = path.join(dDriveImageDir, `${slug}.png`);

    // Check if the logo is already present in both directories
    if (fs.existsSync(destLocal) && fs.existsSync(destDDrive)) {
      continue;
    }

    console.log(`\nProcessing: ${title} (${slug})`);

    // Try name variations for the HTB API lookup
    const variations = [
      title, // Exact title (e.g. "DevArea", "cctv")
      title.toUpperCase(), // Uppercase (e.g. "CCTV")
      slug, // Lowercase slug
      slug.charAt(0).toUpperCase() + slug.slice(1) // Capitalized slug (e.g. "Devarea")
    ];

    const uniqueQueries = [...new Set(variations)];
    let avatarUrl = null;

    for (const query of uniqueQueries) {
      console.log(`-> Querying HTB API for machine: "${query}"`);
      try {
        const url = `https://labs.hackthebox.com/api/v4/machine/profile/${encodeURIComponent(query)}`;
        const profile = await getJson(url);
        if (profile && profile.info && profile.info.avatar) {
          avatarUrl = profile.info.avatar;
          console.log(`-> Found avatar URL: ${avatarUrl}`);
          break;
        }
      } catch (err) {
        console.log(`   (Failed query "${query}": ${err.message})`);
      }
      await sleep(100);
    }

    if (avatarUrl) {
      try {
        console.log(`-> Downloading avatar to:\n   - ${destLocal}\n   - ${destDDrive}`);
        await downloadFile(avatarUrl, [destLocal, destDDrive]);
        console.log(`-> Download successful!`);
      } catch (err) {
        console.error(`-> Error downloading avatar: ${err.message}`);
      }
    } else {
      console.error(`-> COULD NOT FIND avatar URL for ${title} after trying all variations!`);
    }

    await sleep(250);
  }

  console.log('\nAll processing completed!');
}

run().catch(console.error);
