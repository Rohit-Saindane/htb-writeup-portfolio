import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface WriteupMetadata {
  title: string;
  machineName: string;
  os: 'linux' | 'windows';
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  season: string;
  tags: string[];
  date: string;
  pointsAwarded: number;
  machineIP?: string;
  summary: string;
  slug: string;       // e.g. 'garfield'
  seasonSlug: string; // e.g. 'season-10'
  filePath: string;
  readingTime: number;
}

export interface Writeup {
  metadata: WriteupMetadata;
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'writeups');

// Helper to recursively find all writeup.mdx files
function getMdxFiles(dir: string): string[] {
  let results: string[] = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

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

// Get all writeups with metadata, sorted by date descending
export function getAllWriteups(): WriteupMetadata[] {
  const files = getMdxFiles(CONTENT_DIR);
  
  const writeups: WriteupMetadata[] = files.map(filePath => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Extract machine slug and season slug from folder structure
    // Path structure: content/writeups/[seasonSlug]/[machineSlug]/writeup.mdx
    const parts = path.relative(CONTENT_DIR, filePath).split(path.sep);
    const seasonSlug = parts[0];
    const machineSlug = parts[1];

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return {
      title: data.title || machineSlug,
      machineName: data.machineName || data.title || machineSlug,
      os: (data.os || 'linux').toLowerCase() as 'linux' | 'windows',
      difficulty: (data.difficulty || 'easy').toLowerCase() as 'easy' | 'medium' | 'hard' | 'insane',
      season: data.season || 'Season 10',
      tags: Array.isArray(data.tags) ? data.tags : [],
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : '2026-03-22',
      pointsAwarded: Number(data.pointsAwarded || 20),
      machineIP: data.machineIP || '',
      summary: data.summary || '',
      slug: machineSlug,
      seasonSlug,
      filePath: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
      readingTime,
    };
  });

  // Sort by date descending, then title ascending
  return writeups.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    return a.title.localeCompare(b.title);
  });
}

// Get a single writeup by its machine slug
export function getWriteupBySlug(slug: string): Writeup | null {
  const files = getMdxFiles(CONTENT_DIR);
  
  for (const filePath of files) {
    const parts = path.relative(CONTENT_DIR, filePath).split(path.sep);
    const machineSlug = parts[1];

    if (machineSlug === slug) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      
      const seasonSlug = parts[0];

      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      const metadata: WriteupMetadata = {
        title: data.title || machineSlug,
        machineName: data.machineName || data.title || machineSlug,
        os: (data.os || 'linux').toLowerCase() as 'linux' | 'windows',
        difficulty: (data.difficulty || 'easy').toLowerCase() as 'easy' | 'medium' | 'hard' | 'insane',
        season: data.season || 'Season 10',
        tags: Array.isArray(data.tags) ? data.tags : [],
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : '2026-03-22',
        pointsAwarded: Number(data.pointsAwarded || 20),
        machineIP: data.machineIP || '',
        summary: data.summary || '',
        slug: machineSlug,
        seasonSlug,
        filePath: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
        readingTime,
      };

      return {
        metadata,
        content
      };
    }
  }

  return null;
}

// Get filter configurations dynamically based on existing content
export interface FilterOptions {
  seasons: { label: string; slug: string }[];
  tags: string[];
  os: ('linux' | 'windows')[];
  difficulties: ('easy' | 'medium' | 'hard' | 'insane')[];
}

export function getFilterOptions(): FilterOptions {
  const writeups = getAllWriteups();
  
  const seasonsMap = new Map<string, string>();
  const tagsSet = new Set<string>();
  const osSet = new Set<'linux' | 'windows'>();
  const difficultiesSet = new Set<'easy' | 'medium' | 'hard' | 'insane'>();

  writeups.forEach(w => {
    seasonsMap.set(w.seasonSlug, w.season);
    w.tags.forEach(t => tagsSet.add(t));
    osSet.add(w.os);
    difficultiesSet.add(w.difficulty);
  });

  const seasons = Array.from(seasonsMap.entries()).map(([slug, label]) => ({
    label,
    slug
  })).sort((a, b) => a.label.localeCompare(b.label));

  const tags = Array.from(tagsSet).sort();
  const os = Array.from(osSet).sort();
  
  // Sort difficulties standard order
  const difficultyOrder = { easy: 1, medium: 2, hard: 3, insane: 4 };
  const difficulties = Array.from(difficultiesSet).sort((a, b) => {
    return (difficultyOrder[a] || 0) - (difficultyOrder[b] || 0);
  });

  return {
    seasons,
    tags,
    os,
    difficulties
  };
}
