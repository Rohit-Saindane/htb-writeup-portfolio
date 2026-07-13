const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Source and Destination paths
const SOURCE_DIR = 'C:\\Users\\Admin\\OneDrive\\Documents\\Writeups\\Mine\\Season-10-Formatted';
const DEST_DIR = path.join(__dirname, '..', 'content', 'writeups');

// Helper to slugify names
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

// Helper to normalize difficulty
function normalizeDifficulty(difficulty) {
  if (!difficulty) return 'easy';
  const diff = difficulty.toLowerCase().trim();
  if (diff.includes('easy')) return 'easy';
  if (diff.includes('medium')) return 'medium';
  if (diff.includes('hard')) return 'hard';
  if (diff.includes('insane')) return 'insane';
  return 'easy';
}

// Helper to normalize OS
function normalizeOS(os) {
  if (!os) return 'linux';
  const system = os.toLowerCase().trim();
  if (system.includes('windows')) return 'windows';
  return 'linux';
}

// Helper to get default points based on difficulty
function getDefaultPoints(difficulty) {
  const diff = normalizeDifficulty(difficulty);
  switch (diff) {
    case 'easy': return 20;
    case 'medium': return 30;
    case 'hard': return 40;
    case 'insane': return 50;
    default: return 20;
  }
}

// Helper to generate a brief summary from MD content if missing
function generateSummary(content, title) {
  // Remove markdown headers, links, and HTML to get clean text
  const cleanText = content
    .replace(/#+\s+.+/g, '') // remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // replace links with text
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .trim();

  if (!cleanText) {
    return `HTB ${title} machine walkthrough and writeup.`;
  }

  // Get the first paragraph or first 150 characters
  const paragraphs = cleanText.split('\n').map(p => p.trim()).filter(Boolean);
  const firstPara = paragraphs[0] || '';
  if (firstPara.length > 150) {
    return firstPara.substring(0, 147) + '...';
  }
  return firstPara || `HTB ${title} machine walkthrough and writeup.`;
}

// Main import function
function importWriteups() {
  console.log('--- Starting Writeup Import ---');
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Destination: ${DEST_DIR}`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Error: Source directory ${SOURCE_DIR} does not exist.`);
    process.exit(1);
  }

  // Find all .md files in the source directory recursively, excluding readme.md
  const files = getFilesRecursive(SOURCE_DIR).filter(file => file.endsWith('.md') && !file.toLowerCase().endsWith('readme.md'));
  console.log(`Found ${files.length} writeup files to import.\n`);

  let importedCount = 0;

  files.forEach(filePath => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      // Determine Season from directory path
      let season = 'Season 10';
      if (filePath.includes('Season-9')) {
        season = 'Season 9 & Release Arena';
      } else if (filePath.includes('Season-11')) {
        season = 'Season 11';
      }

      const seasonSlug = slugify(season);

      // Normalize metadata
      const rawTitle = data.title || path.basename(filePath, '.md');
      const title = rawTitle.replace('ELOUIA NOTES FROM-admin-panel', 'Elouia');
      const machineName = data.machineName || title;
      const machineSlug = slugify(machineName);
      
      const os = normalizeOS(data.os || '');
      const difficulty = normalizeDifficulty(data.difficulty || '');
      const tags = Array.isArray(data.tags) ? data.tags : [];
      const date = data.date ? new Date(data.date).toISOString().split('T')[0] : '2026-03-22';
      const pointsAwarded = data.pointsAwarded || data.points || getDefaultPoints(difficulty);
      const machineIP = data.machineIP || data.ip || '';
      const rawSummary = data.summary ? data.summary.trim() : '';
      const summary = (rawSummary === '---' || !rawSummary) ? generateSummary(content, title) : rawSummary;

      // Formulate clean frontmatter
      const normalizedFrontmatter = {
        title,
        machineName,
        os,
        difficulty,
        season,
        tags,
        date,
        pointsAwarded,
        machineIP,
        summary
      };

      // Create target directory
      const targetDir = path.join(DEST_DIR, seasonSlug, machineSlug);
      fs.mkdirSync(targetDir, { recursive: true });

      // Generate the new MDX file with gray-matter stringify
      // Ensure we preserve the body content exactly as is
      const outputContent = matter.stringify(content, normalizedFrontmatter);
      const targetPath = path.join(targetDir, 'writeup.mdx');

      fs.writeFileSync(targetPath, outputContent, 'utf8');
      console.log(`[Imported] ${title} (${os} - ${difficulty}) -> ${seasonSlug}/${machineSlug}`);
      importedCount++;
    } catch (err) {
      console.error(`Error processing file ${filePath}:`, err);
    }
  });

  console.log(`\nSuccessfully imported ${importedCount} writeups.`);
  console.log('--- Writeup Import Finished ---');
}

// Helper to recursively list files
function getFilesRecursive(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      // Recurse, but ignore .git
      if (file !== '.git') {
        results = results.concat(getFilesRecursive(fullPath));
      }
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

importWriteups();
