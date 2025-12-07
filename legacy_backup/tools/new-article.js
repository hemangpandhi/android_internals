#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get article title from command line
const articleTitle = process.argv[2];

if (!articleTitle) {
  console.error('Usage: node new-article.js "Article Title"');
  process.exit(1);
}

// Create slug from title
const slug = articleTitle
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim();

// Get current date
const today = new Date();
const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

// Create filename
const filename = `${dateString}-${slug}.md`;
const filepath = path.join(__dirname, '..', 'content', 'articles', filename);

// Article template
const articleTemplate = `---
title: "${articleTitle}"
description: "Add a compelling description for this article here."
author: "Android Internals Team"
date: "${dateString}"
category: "System Architecture"
tags: ["android", "internals", "development"]
image: ""
featured: false
---

# ${articleTitle}

## Introduction

Start your article with an engaging introduction that explains what readers will learn...

## Main Content

### Section 1

Add your main content here...

### Section 2

Continue with more sections...

## Code Examples

\`\`\`bash
# Add relevant code examples
adb shell command
\`\`\`

## Conclusion

Wrap up your article with key takeaways...

---
*Published on ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}*
`;

// Create content directory if it doesn't exist
const contentDir = path.join(__dirname, '..', 'content', 'articles');
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
}

// Write the article file
fs.writeFileSync(filepath, articleTemplate);

console.log(`✅ Created new article: ${filename}`);
console.log(`📝 Edit the file at: ${filepath}`);
console.log(`🌐 Article will be available at: /articles/${slug}.html`);

// Update articles index
updateArticlesIndex();

function updateArticlesIndex() {
  const articlesDir = path.join(__dirname, '..', 'content', 'articles');
  const articles = fs.readdirSync(articlesDir)
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const content = fs.readFileSync(path.join(articlesDir, file), 'utf8');
      const frontMatter = parseFrontMatter(content);
      return {
        ...frontMatter,
        slug: file.replace('.md', ''),
        filename: file
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Create articles index
  const articlesIndex = {
    articles: articles,
    lastUpdated: new Date().toISOString()
  };

  const indexPath = path.join(__dirname, '..', 'content', 'data', 'articles.json');
  const dataDir = path.dirname(indexPath);
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(indexPath, JSON.stringify(articlesIndex, null, 2));
  console.log(`📊 Updated articles index: ${articles.length} articles total`);
}

function parseFrontMatter(content) {
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontMatterMatch) return {};

  const frontMatter = frontMatterMatch[1];
  const result = {};

  frontMatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      result[key.trim()] = value;
    }
  });

  return result;
} 