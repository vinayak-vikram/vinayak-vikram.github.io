#!/usr/bin/env node
// Run after adding posts or notes: node build.js
// Scans posts/*.html and notes/*.pdf, writes posts.json and notes.json.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// === Posts ===
const postsDir = path.join(__dirname, 'posts');

const postFiles = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.html') && f !== 'post-template.html' && f !== 'viewer.html')
  .sort();

const posts = postFiles.map(file => {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf8');

  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
  const synopsisMatch = content.match(/<meta\s+name="synopsis"\s+content="([\s\S]*?)"/);

  const rawTitle = titleMatch ? titleMatch[1].trim() : file;
  const title = rawTitle.replace(/\s*—\s*Vinayak Vikram$/, '');
  const synopsis = synopsisMatch ? synopsisMatch[1].trim() : '';
  const date = gitFirstCommitDate('posts/' + file);

  return { title, date, synopsis, href: '/posts/' + file };
});

posts.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(path.join(__dirname, 'posts.json'), JSON.stringify(posts, null, 2) + '\n');
console.log(`Wrote ${posts.length} post(s) to posts.json`);

// === Notes ===
const notesDir = path.join(__dirname, 'notes');

const noteFiles = fs.existsSync(notesDir)
  ? fs.readdirSync(notesDir).filter(f => f.toLowerCase().endsWith('.pdf')).sort()
  : [];

function gitFirstCommitDate(relPath) {
  try {
    const out = execSync(
      `git log --follow --format=%aI --diff-filter=A -- "${relPath}"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();
    if (!out) return '';
    const d = new Date(out.split('\n')[0]);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return '';
  }
}

const notes = noteFiles.map(file => {
  const name = file.replace(/\.pdf$/i, '');
  const date = gitFirstCommitDate('notes/' + file);
  return { name, date, href: '/notes/' + file };
});

notes.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(path.join(__dirname, 'notes.json'), JSON.stringify(notes, null, 2) + '\n');
console.log(`Wrote ${notes.length} note(s) to notes.json`);
