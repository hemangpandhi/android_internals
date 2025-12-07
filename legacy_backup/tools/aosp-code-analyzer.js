#!/usr/bin/env node

/**
 * AOSP Code Analyzer
 * 
 * Fetches and analyzes Android Open Source Project (AOSP) code to generate:
 * - Class diagrams
 * - Sequence diagrams
 * - Code blocks with context
 * - Method signatures and parameters
 * 
 * Usage:
 *   node tools/aosp-code-analyzer.js <command> [options]
 * 
 * Commands:
 *   fetch <filePath>          - Fetch source code from AOSP
 *   parse <filePath>          - Parse Java file and extract structure
 *   class-diagram <filePath>  - Generate class diagram
 *   sequence-diagram <filePath> <methodName> - Generate sequence diagram
 *   code-block <filePath> <startLine> <endLine> - Extract code block
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ANDROID_SOURCE_BASE = 'https://android.googlesource.com/platform';
const ANDROID_VERSION_TAG = 'refs/tags/android-16.0.0_r3';
const CACHE_DIR = path.join(__dirname, '..', '.aosp-cache');
const AOSP_REPO_BASE_DIR = path.join(__dirname, '..', '.aosp-repo');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Check if local AOSP repository exists and is valid
 */
function hasLocalRepository() {
  // Check if any repository exists
  const frameworksBase = path.join(__dirname, '..', '.aosp-repo', 'frameworks-base');
  const frameworksNative = path.join(__dirname, '..', '.aosp-repo', 'frameworks-native');
  const packagesCar = path.join(__dirname, '..', '.aosp-repo', 'packages-services-car');
  
  return (fs.existsSync(frameworksBase) && fs.existsSync(path.join(frameworksBase, '.git'))) ||
         (fs.existsSync(frameworksNative) && fs.existsSync(path.join(frameworksNative, '.git'))) ||
         (fs.existsSync(packagesCar) && fs.existsSync(path.join(packagesCar, '.git')));
}

/**
 * Get file path in local repository
 */
function getLocalFilePath(filePath) {
  let normalized = filePath.trim();
  if (normalized.startsWith('/')) {
    normalized = normalized.substring(1);
  }
  
  const parts = normalized.split('/');
  
  // frameworks/base -> .aosp-repo/frameworks-base/
  if (parts[0] === 'frameworks' && parts[1] === 'base') {
    const frameworksBaseDir = path.join(__dirname, '..', '.aosp-repo', 'frameworks-base');
    if (fs.existsSync(frameworksBaseDir)) {
      const rest = parts.slice(2).join('/');
      return path.join(frameworksBaseDir, rest);
    }
  }
  
  // frameworks/native -> .aosp-repo/frameworks-native/
  if (parts[0] === 'frameworks' && parts[1] === 'native') {
    const frameworksNativeDir = path.join(__dirname, '..', '.aosp-repo', 'frameworks-native');
    if (fs.existsSync(frameworksNativeDir)) {
      const rest = parts.slice(2).join('/');
      return path.join(frameworksNativeDir, rest);
    }
  }
  
  // packages/services/Car -> .aosp-repo/packages-services-car/
  if (parts[0] === 'packages' && parts[1] === 'services' && parts[2] === 'Car') {
    const packagesCarDir = path.join(__dirname, '..', '.aosp-repo', 'packages-services-car');
    if (fs.existsSync(packagesCarDir)) {
      const rest = parts.slice(3).join('/');
      return path.join(packagesCarDir, rest);
    }
  }
  
  return null;
}

/**
 * Convert AOSP file path to raw source URL
 */
function pathToRawSourceUrl(filePath) {
  let normalized = filePath.trim();
  if (normalized.startsWith('/')) {
    normalized = normalized.substring(1);
  }
  
  const parts = normalized.split('/');
  if (parts.length < 2) {
    return null;
  }
  
  const topLevel = parts[0];
  let subdir = '';
  let rest = '';
  
  if (topLevel === 'frameworks' && parts.length >= 2) {
    subdir = parts[1];
    rest = parts.slice(2).join('/');
    // Raw source URL format: https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r3/path/to/file?format=TEXT
    return `${ANDROID_SOURCE_BASE}/${topLevel}/${subdir}/+/${ANDROID_VERSION_TAG}/${rest}?format=TEXT`;
  } else if (topLevel === 'packages' && parts.length >= 2) {
    subdir = parts[1];
    rest = parts.slice(2).join('/');
    return `${ANDROID_SOURCE_BASE}/${topLevel}/${subdir}/+/${ANDROID_VERSION_TAG}/${rest}?format=TEXT`;
  } else if (topLevel === 'system' && parts.length >= 2) {
    rest = parts.slice(1).join('/');
    return `${ANDROID_SOURCE_BASE}/${topLevel}/+/${ANDROID_VERSION_TAG}/${rest}?format=TEXT`;
  } else if (topLevel === 'native' && parts.length >= 2) {
    subdir = parts[1];
    rest = parts.slice(2).join('/');
    return `${ANDROID_SOURCE_BASE}/${topLevel}/${subdir}/+/${ANDROID_VERSION_TAG}/${rest}?format=TEXT`;
  } else {
    rest = parts.slice(1).join('/');
    return `${ANDROID_SOURCE_BASE}/${topLevel}/+/${ANDROID_VERSION_TAG}/${rest}?format=TEXT`;
  }
}

/**
 * Fetch source code from AOSP (local repository or web)
 */
function fetchSourceCode(filePath) {
  return new Promise((resolve, reject) => {
    // First, try local repository
    const localPath = getLocalFilePath(filePath);
    if (localPath && fs.existsSync(localPath)) {
      try {
        const code = fs.readFileSync(localPath, 'utf8');
        console.log(`📁 Using local repository: ${filePath}`);
        resolve(code);
        return;
      } catch (error) {
        console.log(`⚠️  Failed to read local file, falling back to web: ${error.message}`);
      }
    }
    
    // Check cache
    const cacheKey = filePath.replace(/\//g, '_').replace(/\./g, '_');
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.java`);
    
    if (fs.existsSync(cacheFile)) {
      const cached = fs.readFileSync(cacheFile, 'utf8');
      const cacheTime = fs.statSync(cacheFile).mtime;
      const cacheAge = Date.now() - cacheTime.getTime();
      
      // Use cache if less than 24 hours old
      if (cacheAge < 24 * 60 * 60 * 1000) {
        console.log(`📦 Using cached source: ${filePath}`);
        resolve(cached);
        return;
      }
    }
    
    // Fall back to web fetching
    const url = pathToRawSourceUrl(filePath);
    if (!url) {
      reject(new Error(`Invalid file path: ${filePath}`));
      return;
    }
    
    console.log(`🌐 Fetching from web: ${url}`);
    
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // AOSP returns base64-encoded content when format=TEXT
          const decoded = Buffer.from(data.trim(), 'base64').toString('utf8');
          
          // Cache the result
          fs.writeFileSync(cacheFile, decoded, 'utf8');
          console.log(`✅ Fetched and cached: ${filePath}`);
          resolve(decoded);
        } catch (error) {
          reject(new Error(`Failed to decode source: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Parse Java class structure
 */
function parseJavaClass(sourceCode) {
  const lines = sourceCode.split('\n');
  const result = {
    package: null,
    imports: [],
    classes: [],
    interfaces: [],
    enums: []
  };
  
  let currentClass = null;
  let braceDepth = 0;
  let inClass = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Extract package
    if (line.startsWith('package ')) {
      result.package = line.replace(/package\s+([^;]+);?/, '$1').trim();
      continue;
    }
    
    // Extract imports
    if (line.startsWith('import ')) {
      const importPath = line.replace(/import\s+(?:static\s+)?([^;]+);?/, '$1').trim();
      result.imports.push(importPath);
      continue;
    }
    
    // Detect class declaration
    const classMatch = line.match(/(?:public\s+|private\s+|protected\s+)?(?:abstract\s+|final\s+)?(class|interface|enum)\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^\{]+))?/);
    if (classMatch && !inClass) {
      const type = classMatch[1];
      const name = classMatch[2];
      const extendsClass = classMatch[3];
      const implementsList = classMatch[4] ? classMatch[4].split(',').map(i => i.trim()) : [];
      
      currentClass = {
        type: type,
        name: name,
        extends: extendsClass || null,
        implements: implementsList,
        methods: [],
        fields: [],
        innerClasses: [],
        startLine: i + 1,
        endLine: null,
        modifiers: []
      };
      
      // Extract modifiers
      if (line.includes('public')) currentClass.modifiers.push('public');
      if (line.includes('private')) currentClass.modifiers.push('private');
      if (line.includes('protected')) currentClass.modifiers.push('protected');
      if (line.includes('abstract')) currentClass.modifiers.push('abstract');
      if (line.includes('final')) currentClass.modifiers.push('final');
      if (line.includes('static')) currentClass.modifiers.push('static');
      
      if (type === 'class') {
        result.classes.push(currentClass);
      } else if (type === 'interface') {
        result.interfaces.push(currentClass);
      } else if (type === 'enum') {
        result.enums.push(currentClass);
      }
      
      inClass = true;
      braceDepth = 0;
      continue;
    }
    
    if (inClass && currentClass) {
      // Count braces to track class boundaries
      for (const char of line) {
        if (char === '{') braceDepth++;
        if (char === '}') {
          braceDepth--;
          if (braceDepth === 0) {
            currentClass.endLine = i + 1;
            inClass = false;
            currentClass = null;
            break;
          }
        }
      }
      
      // Extract fields
      const fieldMatch = line.match(/(?:public|private|protected|static|final)\s+(?:transient|volatile)?\s*([\w<>,\[\]]+)\s+(\w+)(?:\s*=\s*[^;]+)?\s*;/);
      if (fieldMatch && braceDepth === 1) {
        currentClass.fields.push({
          type: fieldMatch[1].trim(),
          name: fieldMatch[2].trim(),
          line: i + 1,
          modifiers: []
        });
      }
      
      // Extract methods
      const methodMatch = line.match(/(?:public|private|protected|static|final|abstract|synchronized|native)\s+(?:[\w<>,\[\]]+\s+)?(\w+)\s*\(([^)]*)\)/);
      if (methodMatch && braceDepth === 1) {
        const methodName = methodMatch[1];
        const params = methodMatch[2] ? methodMatch[2].split(',').map(p => {
          const parts = p.trim().split(/\s+/);
          return {
            type: parts[0] || 'void',
            name: parts[1] || ''
          };
        }) : [];
        
        currentClass.methods.push({
          name: methodName,
          parameters: params,
          line: i + 1,
          modifiers: []
        });
      }
    }
  }
  
  return result;
}

/**
 * Generate Mermaid class diagram
 */
function generateClassDiagram(parsedCode, className = null) {
  const classes = parsedCode.classes;
  const interfaces = parsedCode.interfaces;
  const allTypes = [...classes, ...interfaces];
  
  if (allTypes.length === 0) {
    return null;
  }
  
  // Filter to specific class if provided
  const targetTypes = className 
    ? allTypes.filter(c => c.name === className || c.name.includes(className))
    : allTypes;
  
  if (targetTypes.length === 0) {
    return null;
  }
  
  let diagram = '```mermaid\nclassDiagram\n';
  
  for (const type of targetTypes) {
    const typeSymbol = type.type === 'interface' ? '<<interface>>' : '';
    diagram += `    class ${type.name}${typeSymbol} {\n`;
    
    // Add fields
    for (const field of type.fields.slice(0, 10)) { // Limit to 10 fields
      const visibility = type.modifiers.includes('private') ? '-' : 
                        type.modifiers.includes('protected') ? '#' : '+';
      diagram += `        ${visibility}${field.type} ${field.name}\n`;
    }
    
    // Add methods
    for (const method of type.methods.slice(0, 10)) { // Limit to 10 methods
      const visibility = type.modifiers.includes('private') ? '-' : 
                        type.modifiers.includes('protected') ? '#' : '+';
      const params = method.parameters.map(p => `${p.type} ${p.name}`).join(', ');
      diagram += `        ${visibility}${method.name}(${params})\n`;
    }
    
    diagram += `    }\n`;
    
    // Add inheritance relationships
    if (type.extends) {
      diagram += `    ${type.extends} <|-- ${type.name}\n`;
    }
    
    // Add implementation relationships
    for (const impl of type.implements) {
      diagram += `    ${impl} <|.. ${type.name}\n`;
    }
  }
  
  diagram += '```\n';
  return diagram;
}

/**
 * Generate sequence diagram for a method
 */
function generateSequenceDiagram(sourceCode, methodName, parsedCode) {
  const lines = sourceCode.split('\n');
  const targetClass = parsedCode.classes.find(c => 
    c.methods.some(m => m.name === methodName)
  );
  
  if (!targetClass) {
    return null;
  }
  
  const method = targetClass.methods.find(m => m.name === methodName);
  if (!method) {
    return null;
  }
  
  // Extract method body
  const methodStartLine = method.line - 1;
  let methodBody = [];
  let braceCount = 0;
  let inMethod = false;
  
  for (let i = methodStartLine; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('{')) {
      inMethod = true;
      braceCount++;
    }
    if (line.includes('}')) {
      braceCount--;
      if (braceCount === 0 && inMethod) {
        break;
      }
    }
    
    if (inMethod) {
      methodBody.push(line);
    }
  }
  
  // Simple heuristic to find method calls
  const methodCalls = [];
  const callPattern = /(\w+)\.(\w+)\s*\(/g;
  
  for (const line of methodBody) {
    let match;
    while ((match = callPattern.exec(line)) !== null) {
      const object = match[1];
      const method = match[2];
      methodCalls.push({ object, method, line });
    }
  }
  
  if (methodCalls.length === 0) {
    return null;
  }
  
  let diagram = '```mermaid\nsequenceDiagram\n';
  diagram += `    participant Caller\n`;
  diagram += `    participant ${targetClass.name}\n`;
  
  // Add unique participants
  const participants = new Set();
  for (const call of methodCalls) {
    if (call.object !== targetClass.name.toLowerCase()) {
      participants.add(call.object);
    }
  }
  
  for (const participant of participants) {
    diagram += `    participant ${participant}\n`;
  }
  
  diagram += `\n    Caller->>${targetClass.name}: ${methodName}()\n`;
  
  for (const call of methodCalls.slice(0, 20)) { // Limit to 20 calls
    const target = call.object === targetClass.name.toLowerCase() 
      ? targetClass.name 
      : call.object;
    diagram += `    ${targetClass.name}->>${target}: ${call.method}()\n`;
  }
  
  diagram += '```\n';
  return diagram;
}

/**
 * Extract code block with context
 */
function extractCodeBlock(sourceCode, startLine, endLine, contextLines = 5) {
  const lines = sourceCode.split('\n');
  const start = Math.max(0, startLine - contextLines - 1);
  const end = Math.min(lines.length, endLine + contextLines);
  
  const block = lines.slice(start, end);
  const lineNumbers = [];
  for (let i = start + 1; i <= end; i++) {
    lineNumbers.push(i);
  }
  
  return {
    code: block.join('\n'),
    startLine: start + 1,
    endLine: end,
    highlightedStart: startLine,
    highlightedEnd: endLine
  };
}

/**
 * Main CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Usage:
  node tools/aosp-code-analyzer.js <command> [options]

Commands:
  fetch <filePath>                    - Fetch source code from AOSP
  parse <filePath>                    - Parse Java file and extract structure
  class-diagram <filePath> [className] - Generate class diagram
  sequence-diagram <filePath> <method> - Generate sequence diagram
  code-block <filePath> <start> <end>  - Extract code block with context
  clear-cache                         - Clear AOSP source cache

Examples:
  node tools/aosp-code-analyzer.js fetch frameworks/base/services/java/com/android/server/SystemServer.java
  node tools/aosp-code-analyzer.js parse frameworks/base/services/java/com/android/server/SystemServer.java
  node tools/aosp-code-analyzer.js class-diagram frameworks/base/services/java/com/android/server/SystemServer.java SystemServer
  node tools/aosp-code-analyzer.js sequence-diagram frameworks/base/services/java/com/android/server/SystemServer.java run
  node tools/aosp-code-analyzer.js code-block frameworks/base/services/java/com/android/server/SystemServer.java 100 150
`);
    process.exit(1);
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'fetch': {
        const filePath = args[1];
        const code = await fetchSourceCode(filePath);
        console.log('\n' + '='.repeat(80));
        console.log(code);
        console.log('='.repeat(80));
        break;
      }
      
      case 'parse': {
        const filePath = args[1];
        const code = await fetchSourceCode(filePath);
        const parsed = parseJavaClass(code);
        console.log('\n📋 Parsed Structure:');
        console.log(JSON.stringify(parsed, null, 2));
        break;
      }
      
      case 'class-diagram': {
        const filePath = args[1];
        const className = args[2] || null;
        const code = await fetchSourceCode(filePath);
        const parsed = parseJavaClass(code);
        const diagram = generateClassDiagram(parsed, className);
        if (diagram) {
          console.log('\n📊 Class Diagram:');
          console.log(diagram);
        } else {
          console.log('❌ No class diagram could be generated');
        }
        break;
      }
      
      case 'sequence-diagram': {
        const filePath = args[1];
        const methodName = args[2];
        if (!methodName) {
          console.error('❌ Method name required');
          process.exit(1);
        }
        const code = await fetchSourceCode(filePath);
        const parsed = parseJavaClass(code);
        const diagram = generateSequenceDiagram(code, methodName, parsed);
        if (diagram) {
          console.log('\n📊 Sequence Diagram:');
          console.log(diagram);
        } else {
          console.log('❌ No sequence diagram could be generated');
        }
        break;
      }
      
      case 'code-block': {
        const filePath = args[1];
        const startLine = parseInt(args[2]);
        const endLine = parseInt(args[3]);
        const contextLines = parseInt(args[4]) || 5;
        
        if (isNaN(startLine) || isNaN(endLine)) {
          console.error('❌ Invalid line numbers');
          process.exit(1);
        }
        
        const code = await fetchSourceCode(filePath);
        const block = extractCodeBlock(code, startLine, endLine, contextLines);
        console.log(`\n📄 Code Block (lines ${block.startLine}-${block.endLine}):`);
        console.log('='.repeat(80));
        console.log(block.code);
        console.log('='.repeat(80));
        break;
      }
      
      case 'clear-cache': {
        const files = fs.readdirSync(CACHE_DIR);
        for (const file of files) {
          fs.unlinkSync(path.join(CACHE_DIR, file));
        }
        console.log(`✅ Cleared ${files.length} cached files`);
        break;
      }
      
      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Export functions for use in other modules
module.exports = {
  fetchSourceCode,
  parseJavaClass,
  generateClassDiagram,
  generateSequenceDiagram,
  extractCodeBlock,
  pathToRawSourceUrl,
  hasLocalRepository,
  getLocalFilePath,
  AOSP_REPO_BASE_DIR
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}

