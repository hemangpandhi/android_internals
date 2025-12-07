#!/usr/bin/env node

/**
 * AOSP Integration for Article Generation
 * 
 * Integrates AOSP code analysis with the article build process.
 * Provides helper functions to generate diagrams and code blocks
 * directly from AOSP source code.
 */

const aospAnalyzer = require('./aosp-code-analyzer');
const fs = require('fs');
const path = require('path');

/**
 * Generate class diagram from AOSP source and embed in Markdown
 */
async function generateClassDiagramFromAOSP(filePath, className = null, options = {}) {
  try {
    const code = await aospAnalyzer.fetchSourceCode(filePath);
    const parsed = aospAnalyzer.parseJavaClass(code);
    const diagram = aospAnalyzer.generateClassDiagram(parsed, className);
    
    if (!diagram) {
      return null;
    }
    
    // Add source link if requested
    if (options.includeSourceLink) {
      const url = aospAnalyzer.pathToRawSourceUrl(filePath);
      return `${diagram}\n\n> **Source:** [${filePath}](${url.replace('?format=TEXT', '')})\n`;
    }
    
    return diagram;
  } catch (error) {
    console.error(`Failed to generate class diagram: ${error.message}`);
    return null;
  }
}

/**
 * Generate sequence diagram for a method from AOSP source
 */
async function generateSequenceDiagramFromAOSP(filePath, methodName, options = {}) {
  try {
    const code = await aospAnalyzer.fetchSourceCode(filePath);
    const parsed = aospAnalyzer.parseJavaClass(code);
    const diagram = aospAnalyzer.generateSequenceDiagram(code, methodName, parsed);
    
    if (!diagram) {
      return null;
    }
    
    // Add source link if requested
    if (options.includeSourceLink) {
      const url = aospAnalyzer.pathToRawSourceUrl(filePath);
      return `${diagram}\n\n> **Source:** [${filePath}::${methodName}()](${url.replace('?format=TEXT', '')}#${methodName})\n`;
    }
    
    return diagram;
  } catch (error) {
    console.error(`Failed to generate sequence diagram: ${error.message}`);
    return null;
  }
}

/**
 * Extract code block from AOSP source with context
 */
async function extractCodeBlockFromAOSP(filePath, startLine, endLine, contextLines = 5, options = {}) {
  try {
    const code = await aospAnalyzer.fetchSourceCode(filePath);
    const block = aospAnalyzer.extractCodeBlock(code, startLine, endLine, contextLines);
    
    let result = `\`\`\`java\n${block.code}\n\`\`\`\n`;
    
    // Add source link if requested
    if (options.includeSourceLink) {
      const url = aospAnalyzer.pathToRawSourceUrl(filePath);
      result += `\n> **Source:** [${filePath} (lines ${startLine}-${endLine})](${url.replace('?format=TEXT', '')}#${startLine})\n`;
    }
    
    return result;
  } catch (error) {
    console.error(`Failed to extract code block: ${error.message}`);
    return null;
  }
}

/**
 * Process Markdown file and replace AOSP directives with generated content
 * 
 * Directives:
 *   <!-- AOSP_CLASS_DIAGRAM: filePath [className] -->
 *   <!-- AOSP_SEQUENCE_DIAGRAM: filePath methodName -->
 *   <!-- AOSP_CODE_BLOCK: filePath startLine endLine [contextLines] -->
 */
async function processAOSPDirectives(markdownContent) {
  const lines = markdownContent.split('\n');
  const processedLines = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Class diagram directive
    const classDiagramMatch = line.match(/<!--\s*AOSP_CLASS_DIAGRAM:\s*([^\s]+)(?:\s+(\w+))?\s*-->/);
    if (classDiagramMatch) {
      const filePath = classDiagramMatch[1];
      const className = classDiagramMatch[2] || null;
      
      console.log(`📊 Generating class diagram for: ${filePath}${className ? ` (${className})` : ''}`);
      const diagram = await generateClassDiagramFromAOSP(filePath, className, { includeSourceLink: true });
      
      if (diagram) {
        processedLines.push(diagram);
      } else {
        processedLines.push(`<!-- Failed to generate class diagram for ${filePath} -->`);
      }
      
      i++;
      continue;
    }
    
    // Sequence diagram directive
    const sequenceDiagramMatch = line.match(/<!--\s*AOSP_SEQUENCE_DIAGRAM:\s*([^\s]+)\s+(\w+)\s*-->/);
    if (sequenceDiagramMatch) {
      const filePath = sequenceDiagramMatch[1];
      const methodName = sequenceDiagramMatch[2];
      
      console.log(`📊 Generating sequence diagram for: ${filePath}::${methodName}()`);
      const diagram = await generateSequenceDiagramFromAOSP(filePath, methodName, { includeSourceLink: true });
      
      if (diagram) {
        processedLines.push(diagram);
      } else {
        processedLines.push(`<!-- Failed to generate sequence diagram for ${filePath}::${methodName}() -->`);
      }
      
      i++;
      continue;
    }
    
    // Code block directive
    const codeBlockMatch = line.match(/<!--\s*AOSP_CODE_BLOCK:\s*([^\s]+)\s+(\d+)\s+(\d+)(?:\s+(\d+))?\s*-->/);
    if (codeBlockMatch) {
      const filePath = codeBlockMatch[1];
      const startLine = parseInt(codeBlockMatch[2]);
      const endLine = parseInt(codeBlockMatch[3]);
      const contextLines = codeBlockMatch[4] ? parseInt(codeBlockMatch[4]) : 5;
      
      console.log(`📄 Extracting code block: ${filePath} (lines ${startLine}-${endLine})`);
      const codeBlock = await extractCodeBlockFromAOSP(filePath, startLine, endLine, contextLines, { includeSourceLink: true });
      
      if (codeBlock) {
        processedLines.push(codeBlock);
      } else {
        processedLines.push(`<!-- Failed to extract code block from ${filePath} -->`);
      }
      
      i++;
      continue;
    }
    
    // Regular line - keep as is
    processedLines.push(line);
    i++;
  }
  
  return processedLines.join('\n');
}

/**
 * Process all article files and replace AOSP directives
 */
async function processAllArticles() {
  const articlesDir = path.join(__dirname, '..', 'content', 'articles');
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));
  
  console.log(`📚 Processing ${files.length} articles...\n`);
  
  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains AOSP directives
    if (content.includes('AOSP_CLASS_DIAGRAM') || 
        content.includes('AOSP_SEQUENCE_DIAGRAM') || 
        content.includes('AOSP_CODE_BLOCK')) {
      console.log(`\n📝 Processing: ${file}`);
      const processed = await processAOSPDirectives(content);
      fs.writeFileSync(filePath, processed, 'utf8');
      console.log(`✅ Updated: ${file}`);
    }
  }
  
  console.log(`\n✅ All articles processed!`);
}

// Export functions
module.exports = {
  generateClassDiagramFromAOSP,
  generateSequenceDiagramFromAOSP,
  extractCodeBlockFromAOSP,
  processAOSPDirectives,
  processAllArticles
};

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'process') {
    processAllArticles().catch(error => {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    });
  } else {
    console.log(`
Usage:
  node tools/aosp-integration.js process

This will process all article Markdown files and replace AOSP directives with
generated diagrams and code blocks from actual AOSP source code.

Directives:
  <!-- AOSP_CLASS_DIAGRAM: filePath [className] -->
  <!-- AOSP_SEQUENCE_DIAGRAM: filePath methodName -->
  <!-- AOSP_CODE_BLOCK: filePath startLine endLine [contextLines] -->
`);
  }
}


