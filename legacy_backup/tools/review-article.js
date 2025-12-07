#!/usr/bin/env node

/**
 * Article Review Tool
 * Helps review articles by checking various aspects
 */

const fs = require('fs');
const path = require('path');

const articlePath = process.argv[2] || 'content/articles/android-system-server-deep-dive.md';

if (!fs.existsSync(articlePath)) {
  console.error(`❌ Article not found: ${articlePath}`);
  process.exit(1);
}

console.log(`\n📝 Reviewing: ${articlePath}\n`);
console.log('='.repeat(60));

const content = fs.readFileSync(articlePath, 'utf8');
const lines = content.split('\n');

// Extract frontmatter
const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
let frontmatter = {};
if (frontmatterMatch) {
  const fmContent = frontmatterMatch[1];
  frontmatter.title = fmContent.match(/title:\s*"([^"]+)"/)?.[1] || 'N/A';
  frontmatter.description = fmContent.match(/description:\s*"([^"]+)"/)?.[1] || 'N/A';
  frontmatter.author = fmContent.match(/author:\s*"([^"]+)"/)?.[1] || 'N/A';
  frontmatter.date = fmContent.match(/date:\s*"([^"]+)"/)?.[1] || 'N/A';
  frontmatter.category = fmContent.match(/category:\s*"([^"]+)"/)?.[1] || 'N/A';
  frontmatter.tags = fmContent.match(/tags:\s*\[([^\]]+)\]/)?.[1] || 'N/A';
}

// Statistics
const stats = {
  totalLines: lines.length,
  headings: {
    h1: (content.match(/^# /gm) || []).length,
    h2: (content.match(/^## /gm) || []).length,
    h3: (content.match(/^### /gm) || []).length,
    h4: (content.match(/^#### /gm) || []).length,
  },
  codeBlocks: (content.match(/^```/gm) || []).length / 2, // Each block has opening and closing
  links: (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length,
  images: (content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []).length,
  mermaidDiagrams: (content.match(/```mermaid/g) || []).length,
  adbCommands: (content.match(/adb\s+shell/g) || []).length,
  bashCommands: (content.match(/```bash/g) || []).length,
  javaCode: (content.match(/```java/g) || []).length,
};

// Check for common issues
const issues = [];

// Check frontmatter
if (!frontmatter.title || frontmatter.title === 'N/A') {
  issues.push('⚠️  Missing or invalid title in frontmatter');
}
if (!frontmatter.description || frontmatter.description === 'N/A') {
  issues.push('⚠️  Missing or invalid description in frontmatter');
}
if (frontmatter.description && frontmatter.description.length > 160) {
  issues.push(`⚠️  Description too long (${frontmatter.description.length} chars, recommended: 150-160)`);
}

// Check for common markdown issues
if (content.includes('```\n') && !content.includes('```bash') && !content.includes('```java')) {
  issues.push('⚠️  Some code blocks may be missing language tags');
}

// Check for broken internal links
const internalLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
internalLinks.forEach(link => {
  const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (match && match[2].startsWith('../') && !match[2].includes('http')) {
    // Could check if file exists, but skip for now
  }
});

// Check for TODO/FIXME
if (content.includes('TODO') || content.includes('FIXME')) {
  issues.push('⚠️  Article contains TODO or FIXME comments');
}

// Print results
console.log('\n📊 Article Statistics:');
console.log('─'.repeat(60));
console.log(`Total Lines:        ${stats.totalLines}`);
console.log(`Headings:`);
console.log(`  H1:               ${stats.headings.h1}`);
console.log(`  H2:               ${stats.headings.h2}`);
console.log(`  H3:               ${stats.headings.h3}`);
console.log(`  H4:               ${stats.headings.h4}`);
console.log(`Code Blocks:        ${stats.codeBlocks}`);
console.log(`  - Bash:           ${stats.bashCommands}`);
console.log(`  - Java:           ${stats.javaCode}`);
console.log(`  - Mermaid:        ${stats.mermaidDiagrams}`);
console.log(`Links:              ${stats.links}`);
console.log(`Images:             ${stats.images}`);
console.log(`ADB Commands:       ${stats.adbCommands}`);

console.log('\n📋 Frontmatter:');
console.log('─'.repeat(60));
console.log(`Title:              ${frontmatter.title}`);
console.log(`Author:             ${frontmatter.author}`);
console.log(`Date:               ${frontmatter.date}`);
console.log(`Category:           ${frontmatter.category}`);
console.log(`Tags:               ${frontmatter.tags}`);
console.log(`Description:        ${frontmatter.description?.substring(0, 80)}...`);

if (issues.length > 0) {
  console.log('\n⚠️  Issues Found:');
  console.log('─'.repeat(60));
  issues.forEach(issue => console.log(`  ${issue}`));
} else {
  console.log('\n✅ No obvious issues found!');
}

console.log('\n📝 Review Checklist:');
console.log('─'.repeat(60));
console.log('Please manually verify:');
console.log('  [ ] Technical accuracy of content');
console.log('  [ ] All ADB commands are correct');
console.log('  [ ] Code examples compile/run');
console.log('  [ ] AOSP file paths are accurate');
console.log('  [ ] Mermaid diagrams render correctly');
console.log('  [ ] All links work');
console.log('  [ ] Grammar and spelling');
console.log('  [ ] Consistent terminology');

console.log('\n🔍 Quick Commands:');
console.log('─'.repeat(60));
console.log(`View article:        cat ${articlePath}`);
console.log(`Rebuild:             node tools/build.js`);
console.log(`Preview:             cd build && python3 -m http.server 8080`);
console.log(`Check links:          linkchecker build/articles/${path.basename(articlePath, '.md')}.html`);

console.log('\n' + '='.repeat(60) + '\n');


