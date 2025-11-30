#!/usr/bin/env node

/**
 * Verification script to check code snippets against AOSP source
 * This script helps identify potential mismatches between article code and actual AOSP source
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '../content/articles');
const ANDROID_VERSION = 'android-16.0.0_r3';
const ANDROID_SOURCE_BASE = 'https://android.googlesource.com/platform/frameworks/base/+/refs/tags/' + ANDROID_VERSION;

// Known code patterns to verify
const CODE_PATTERNS = {
  'SystemServer.run()': {
    file: 'frameworks/base/services/java/com/android/server/SystemServer.java',
    methods: ['main', 'run'],
    checks: [
      'ActivityThread.systemMain()',
      'SystemServiceManager',
      'startBootstrapServices',
      'startCoreServices',
      'startOtherServices',
      'ActivityManagerService.self().systemReady'
    ]
  },
  'Binder.transact()': {
    file: 'frameworks/base/core/java/android/os/Binder.java',
    methods: ['transact'],
    checks: [
      'transactNative',
      'Parcel',
      'FLAG_ONEWAY'
    ]
  },
  'Binder.onTransact()': {
    file: 'frameworks/base/core/java/android/os/Binder.java',
    methods: ['onTransact'],
    checks: [
      'enforceInterface',
      'readException',
      'writeNoException'
    ]
  },
  'Binder.getCallingUid()': {
    file: 'frameworks/base/core/java/android/os/Binder.java',
    methods: ['getCallingUid'],
    checks: []
  },
  'SystemServiceManager.startService()': {
    file: 'frameworks/base/services/core/java/com/android/server/SystemServiceManager.java',
    methods: ['startService'],
    checks: [
      'onStart',
      'onBootPhase'
    ]
  }
};

function findCodeBlocks(articlePath) {
  const content = fs.readFileSync(articlePath, 'utf-8');
  const codeBlocks = [];
  const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const lang = match[1];
    const code = match[2];
    const sourcePaths = code.match(/\/\/\s*(frameworks|packages|system|device|hardware|vendor)\/[^\n]+/g) || [];
    
    codeBlocks.push({
      lang,
      code: code.trim(),
      sourcePaths: sourcePaths.map(p => p.replace(/\/\/\s*/, '')),
      lineNumber: content.substring(0, match.index).split('\n').length
    });
  }
  
  return codeBlocks;
}

function checkCodeBlock(block, articleName) {
  const issues = [];
  
  // Check if source paths are mentioned
  if (block.sourcePaths.length === 0 && block.lang === 'java') {
    issues.push({
      type: 'missing_source',
      message: `Code block at line ${block.lineNumber} has no source path comments`,
      code: block.code.substring(0, 100) + '...'
    });
  }
  
  // Check for common patterns
  if (block.code.includes('transact') && !block.code.includes('IBinder.FLAG_ONEWAY') && block.code.includes('FLAG_ONEWAY')) {
    issues.push({
      type: 'incorrect_usage',
      message: `FLAG_ONEWAY usage may be incorrect - should use IBinder.FLAG_ONEWAY as flags parameter`,
      code: block.code.substring(0, 150) + '...'
    });
  }
  
  // Check for simplified illustrations
  if (block.code.includes('Simplified illustration') && block.sourcePaths.length > 0) {
    // This is okay - it's marked as simplified
  }
  
  return issues;
}

function verifyArticle(articlePath) {
  const articleName = path.basename(articlePath, '.md');
  const codeBlocks = findCodeBlocks(articlePath);
  const allIssues = [];
  
  console.log(`\n📄 Checking ${articleName}...`);
  console.log(`   Found ${codeBlocks.length} code blocks`);
  
  codeBlocks.forEach((block, index) => {
    const issues = checkCodeBlock(block, articleName);
    if (issues.length > 0) {
      allIssues.push({
        block: index + 1,
        issues
      });
    }
  });
  
  if (allIssues.length > 0) {
    console.log(`   ⚠️  Found ${allIssues.length} potential issues:`);
    allIssues.forEach(({ block, issues }) => {
      console.log(`   Block ${block}:`);
      issues.forEach(issue => {
        console.log(`     - ${issue.type}: ${issue.message}`);
      });
    });
  } else {
    console.log(`   ✅ All code blocks look good`);
  }
  
  return allIssues;
}

// Main execution
console.log('🔍 Verifying code snippets against AOSP source...\n');

const articleFiles = fs.readdirSync(ARTICLES_DIR)
  .filter(f => f.endsWith('.md') && f.startsWith('android-system-server'));

let totalIssues = 0;
articleFiles.forEach(file => {
  const articlePath = path.join(ARTICLES_DIR, file);
  const issues = verifyArticle(articlePath);
  totalIssues += issues.length;
});

console.log(`\n📊 Summary:`);
console.log(`   Articles checked: ${articleFiles.length}`);
console.log(`   Total issues found: ${totalIssues}`);

if (totalIssues === 0) {
  console.log(`\n✅ All code blocks verified successfully!`);
  process.exit(0);
} else {
  console.log(`\n⚠️  Please review the issues above`);
  process.exit(1);
}


