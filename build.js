#!/usr/bin/env node
// Run this after writing a new post: node build.js
// It scans posts/*.html, reads metadata, and writes posts.json.

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'posts');

const files = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.html') && f !== 'post-template.html')
  .sort();

const posts = files.map(file => {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf8');

  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
  const synopsisMatch = content.match(/<meta\s+name="synopsis"\s+content="([\s\S]*?)"/);
  const dateMatch = content.match(/<p\s+class="post-date">([\s\S]*?)<\/p>/);

  const rawTitle = titleMatch ? titleMatch[1].trim() : file;
  const title = rawTitle.replace(/\s*—\s*Vinayak Vikram$/, '');
  const synopsis = synopsisMatch ? synopsisMatch[1].trim() : '';
  const date = dateMatch ? dateMatch[1].trim() : '';

  return { title, date, synopsis, href: '/posts/' + file };
});

// Sort newest first. Dates like "March 30, 2026" parse fine with new Date().
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

const out = path.join(__dirname, 'posts.json');
fs.writeFileSync(out, JSON.stringify(posts, null, 2) + '\n');
console.log(`Wrote ${posts.length} post(s) to posts.json`);
