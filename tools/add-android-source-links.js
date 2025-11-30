#!/usr/bin/env node

/**
 * Add Android Source Code Links to Articles
 * Converts file path references to clickable Android source links
 */

const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '..', 'content', 'articles');

// Android source base URL
const ANDROID_SOURCE_BASE = 'https://android.googlesource.com/platform';

// Convert AOSP file path to Android source URL
function pathToUrl(filePath) {
  // Remove leading slashes and normalize
  let normalized = filePath.trim();
  if (normalized.startsWith('/')) {
    normalized = normalized.substring(1);
  }
  
  // Handle different path formats
  // frameworks/base/services/java/com/android/server/SystemServer.java
  // -> https://android.googlesource.com/platform/frameworks/base/+/main/services/java/com/android/server/SystemServer.java
  
  // Split path into components
  const parts = normalized.split('/');
  
  if (parts.length < 2) {
    return null; // Invalid path
  }
  
  // For frameworks/base, packages/apps, etc., we need to handle the structure:
  // frameworks/base/path -> platform/frameworks/base/+/main/path
  // packages/apps/Settings -> platform/packages/apps/+/main/Settings
  // system/core -> platform/system/+/main/core
  
  const topLevel = parts[0]; // frameworks, packages, system, etc.
  let subdir = '';
  let rest = '';
  
  // Special handling for common patterns
  // Correct format: platform/frameworks/base/+/main/services/java/com/android/server/SystemServer.java
  if (topLevel === 'frameworks' && parts.length >= 2) {
    // frameworks/base/path/to/file -> platform/frameworks/base/+/main/path/to/file
    subdir = parts[1]; // base
    rest = parts.slice(2).join('/'); // path/to/file
    return `${ANDROID_SOURCE_BASE}/${topLevel}/${subdir}/+/main/${rest}`;
  } else if (topLevel === 'packages' && parts.length >= 2) {
    // packages/apps/Settings/path/to/file -> platform/packages/apps/+/main/Settings/path/to/file
    subdir = parts[1]; // apps
    rest = parts.slice(2).join('/'); // Settings/path/to/file
    return `${ANDROID_SOURCE_BASE}/${topLevel}/${subdir}/+/main/${rest}`;
  } else if (topLevel === 'system' && parts.length >= 2) {
    // system/sepolicy/path -> platform/system/+/main/sepolicy/path
    rest = parts.slice(1).join('/');
    return `${ANDROID_SOURCE_BASE}/${topLevel}/+/main/${rest}`;
  } else {
    // For other paths, assume structure: topLevel/rest
    rest = parts.slice(1).join('/');
    return `${ANDROID_SOURCE_BASE}/${topLevel}/+/main/${rest}`;
  }
}

// Process a single article file
function processArticle(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern 1: Code block comments with file paths
  // // frameworks/base/services/java/com/android/server/SystemServer.java
  const codeCommentPattern = /^(\s*\/\/\s*)(frameworks\/|packages\/|system\/|device\/|hardware\/|vendor\/)([^\n]+)$/gm;
  content = content.replace(codeCommentPattern, (match, indent, prefix, rest) => {
    const fullPath = prefix + rest.trim();
    const url = pathToUrl(fullPath);
    if (url) {
      modified = true;
      // Create clickable link in comment
      return `${indent}[${fullPath}](${url})`;
    }
    return match;
  });
  
  // Pattern 2: Inline code references with file paths
  // `frameworks/base/services/java/com/android/server/SystemServer.java`
  // `frameworks/base/services/java/com/android/server/SystemServer.java#startBootstrapServices()`
  const inlineCodePattern = /`(frameworks\/|packages\/|system\/|device\/|hardware\/|vendor\/)([^`]+)`/g;
  content = content.replace(inlineCodePattern, (match, prefix, rest) => {
    // Check if it's already a link
    if (match.includes('](')) {
      return match; // Already processed
    }
    
    // Handle method references (#methodName)
    const methodMatch = rest.match(/^([^#]+)(#.+)?$/);
    if (methodMatch) {
      const filePath = prefix + methodMatch[1];
      const methodRef = methodMatch[2] || '';
      const url = pathToUrl(filePath);
      if (url) {
        modified = true;
        // Create clickable link
        return `[\`${filePath}${methodRef}\`](${url}${methodRef})`;
      }
    }
    return match;
  });
  
  // Pattern 3: Bullet points with file paths
  // - `frameworks/base/services/java/com/android/server/SystemServer.java`
  // - **Location**: `frameworks/base/services/java/com/android/server/SystemServer.java`
  const bulletPattern = /^(\s*[-*]\s*(?:\*\*[^*]+\*\*:\s*)?)`(frameworks\/|packages\/|system\/|device\/|hardware\/|vendor\/)([^`]+)`/gm;
  content = content.replace(bulletPattern, (match, prefix, pathPrefix, rest) => {
    // Check if it's already a link
    if (match.includes('](')) {
      return match; // Already processed
    }
    
    const fullPath = pathPrefix + rest.trim();
    const url = pathToUrl(fullPath);
    if (url) {
      modified = true;
      return `${prefix}[\`${fullPath}\`](${url})`;
    }
    return match;
  });
  
  // Pattern 4: Standalone file path references (not in code blocks)
  // frameworks/base/services/java/com/android/server/SystemServer.java
  // But only if they're on their own line or after certain patterns
  const standalonePattern = /^(\s*)(frameworks\/|packages\/|system\/|device\/|hardware\/|vendor\/)([^\n]+)$/gm;
  content = content.replace(standalonePattern, (match, indent, prefix, rest) => {
    // Skip if it's already a link or in a code block context
    if (match.includes('](') || match.includes('`') || match.includes('```')) {
      return match;
    }
    
    // Only process if it looks like a file path (has .java, .cpp, .h, etc.)
    if (!/\.(java|cpp|h|hpp|c|cc|xml|mk|bp|aidl|kt)$/.test(rest.trim())) {
      return match;
    }
    
    const fullPath = prefix + rest.trim();
    const url = pathToUrl(fullPath);
    if (url) {
      modified = true;
      return `${indent}[${fullPath}](${url})`;
    }
    return match;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Main execution
console.log('\n🔗 Adding Android Source Code Links to Articles\n');
console.log('='.repeat(80));

const articleFiles = fs.readdirSync(articlesDir)
  .filter(file => file.endsWith('.md'))
  .sort();

let processedCount = 0;
let modifiedCount = 0;

articleFiles.forEach((file, index) => {
  const filePath = path.join(articlesDir, file);
  console.log(`[${index + 1}/${articleFiles.length}] Processing: ${file}`);
  
  try {
    const modified = processArticle(filePath);
    if (modified) {
      modifiedCount++;
      console.log(`  ✅ Added source links`);
    } else {
      console.log(`  ℹ️  No changes needed`);
    }
    processedCount++;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n✅ Processed ${processedCount} articles`);
console.log(`📝 Modified ${modifiedCount} articles with source links\n`);

