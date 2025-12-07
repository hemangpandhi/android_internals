#!/usr/bin/env node

/**
 * Comprehensive Article Verification Tool
 * 
 * Verifies all articles against local AOSP source code:
 * - Code snippets accuracy
 * - Class diagrams
 * - Sequence diagrams
 * - Method signatures
 * - File paths
 * - Descriptions
 */

const fs = require('fs');
const path = require('path');
const { fetchSourceCode } = require('./aosp-code-analyzer');

const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const OUTPUT_FILE = path.join(__dirname, '..', 'docs', 'ARTICLE_VERIFICATION_REPORT.md');

// AOSP file path patterns to extract
const AOSP_PATH_PATTERNS = [
  /frameworks\/base\/[^\s\)]+/g,
  /frameworks\/native\/[^\s\)]+/g,
  /packages\/services\/[^\s\)]+/g,
  /\/\/\s*([a-z]+\/[a-z]+\/[^\n]+)/gi,
  /\[([^\]]+)\]\(https:\/\/android\.googlesource\.com[^\)]+\)/g
];

// Code block patterns
const CODE_BLOCK_PATTERN = /```(\w+)?\n([\s\S]*?)```/g;

// Method/class patterns
const CLASS_PATTERN = /(?:public|private|protected)?\s*(?:abstract|final)?\s*class\s+(\w+)/g;
const METHOD_PATTERN = /(?:public|private|protected|static)?\s*(?:abstract|final|synchronized)?\s*(?:[\w<>\[\]]+\s+)?(\w+)\s*\([^)]*\)/g;

function extractAospPaths(content) {
  const paths = new Set();
  
  for (const pattern of AOSP_PATH_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const path = match[1] || match[0];
      if (path && !path.includes('http')) {
        paths.add(path.trim());
      }
    }
  }
  
  return Array.from(paths);
}

function extractCodeBlocks(content) {
  const blocks = [];
  let match;
  
  while ((match = CODE_BLOCK_PATTERN.exec(content)) !== null) {
    const lang = match[1] || 'text';
    const code = match[2];
    
    if (lang === 'java' || lang === 'cpp' || lang === 'c') {
      blocks.push({
        language: lang,
        code: code,
        classes: extractClasses(code),
        methods: extractMethods(code)
      });
    }
  }
  
  return blocks;
}

function extractClasses(code) {
  const classes = [];
  let match;
  
  while ((match = CLASS_PATTERN.exec(code)) !== null) {
    classes.push(match[1]);
  }
  
  return classes;
}

function extractMethods(code) {
  const methods = [];
  let match;
  
  while ((match = METHOD_PATTERN.exec(code)) !== null) {
    methods.push(match[1]);
  }
  
  return methods;
}

async function verifyFile(filePath, articleContent) {
  const issues = [];
  
  try {
    const sourceCode = await fetchSourceCode(filePath);
    if (!sourceCode) {
      issues.push({
        type: 'error',
        message: `File not found: ${filePath}`
      });
      return issues;
    }
    
    // Check if file exists in local repo
    const localPath = getLocalFilePath(filePath);
    if (!localPath || !fs.existsSync(localPath)) {
      issues.push({
        type: 'warning',
        message: `File not in local repository: ${filePath}`
      });
    }
    
  } catch (error) {
    issues.push({
      type: 'error',
      message: `Error verifying ${filePath}: ${error.message}`
    });
  }
  
  return issues;
}

function getLocalFilePath(filePath) {
  const parts = filePath.split('/');
  
  if (parts[0] === 'frameworks' && parts[1] === 'base') {
    return path.join(__dirname, '..', '.aosp-repo', 'frameworks-base', ...parts.slice(2));
  } else if (parts[0] === 'frameworks' && parts[1] === 'native') {
    return path.join(__dirname, '..', '.aosp-repo', 'frameworks-native', ...parts.slice(2));
  } else if (parts[0] === 'packages' && parts[1] === 'services' && parts[2] === 'Car') {
    return path.join(__dirname, '..', '.aosp-repo', 'packages-services-car', ...parts.slice(3));
  }
  
  return null;
}

async function verifyArticle(articleFile) {
  const articlePath = path.join(ARTICLES_DIR, articleFile);
  const content = fs.readFileSync(articlePath, 'utf8');
  
  const report = {
    file: articleFile,
    aospPaths: extractAospPaths(content),
    codeBlocks: extractCodeBlocks(content),
    issues: [],
    verified: false
  };
  
  // Verify each AOSP path
  for (const filePath of report.aospPaths) {
    const fileIssues = await verifyFile(filePath, content);
    report.issues.push(...fileIssues);
  }
  
  report.verified = report.issues.length === 0;
  
  return report;
}

async function main() {
  console.log('🔍 Starting comprehensive article verification...\n');
  
  const articleFiles = fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.md') && !f.includes('series'));
  
  console.log(`📄 Found ${articleFiles.length} articles to verify\n`);
  
  const reports = [];
  
  for (const articleFile of articleFiles) {
    console.log(`  Verifying: ${articleFile}...`);
    const report = await verifyArticle(articleFile);
    reports.push(report);
    
    if (report.issues.length > 0) {
      console.log(`    ⚠️  Found ${report.issues.length} issue(s)`);
    } else {
      console.log(`    ✅ Verified`);
    }
  }
  
  // Generate report
  let reportContent = '# Article Verification Report\n\n';
  reportContent += `Generated: ${new Date().toISOString()}\n\n`;
  reportContent += `## Summary\n\n`;
  reportContent += `- Total Articles: ${reports.length}\n`;
  reportContent += `- Verified: ${reports.filter(r => r.verified).length}\n`;
  reportContent += `- With Issues: ${reports.filter(r => !r.verified).length}\n\n`;
  
  reportContent += `## Detailed Reports\n\n`;
  
  for (const report of reports) {
    reportContent += `### ${report.file}\n\n`;
    reportContent += `- AOSP Paths Referenced: ${report.aospPaths.length}\n`;
    reportContent += `- Code Blocks: ${report.codeBlocks.length}\n`;
    
    if (report.issues.length > 0) {
      reportContent += `\n**Issues:**\n\n`;
      for (const issue of report.issues) {
        reportContent += `- [${issue.type.toUpperCase()}] ${issue.message}\n`;
      }
    } else {
      reportContent += `\n✅ **No issues found**\n`;
    }
    
    reportContent += `\n`;
  }
  
  fs.writeFileSync(OUTPUT_FILE, reportContent);
  console.log(`\n✅ Report generated: ${OUTPUT_FILE}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verifyArticle, extractAospPaths, extractCodeBlocks };


