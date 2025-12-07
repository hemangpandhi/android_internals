#!/usr/bin/env node

/**
 * Comprehensive Article Review Tool
 * Reviews all articles and generates a comprehensive report
 */

const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '..', 'content', 'articles');

if (!fs.existsSync(articlesDir)) {
  console.error(`❌ Articles directory not found: ${articlesDir}`);
  process.exit(1);
}

console.log('\n📚 Comprehensive Article Review\n');
console.log('='.repeat(80));

// Get all markdown files
const articleFiles = fs.readdirSync(articlesDir)
  .filter(file => file.endsWith('.md'))
  .sort();

console.log(`\n📝 Found ${articleFiles.length} articles to review\n`);

const allResults = [];
const globalStats = {
  totalArticles: articleFiles.length,
  totalLines: 0,
  totalDiagrams: 0,
  totalCodeBlocks: 0,
  totalLinks: 0,
  articlesWithIssues: 0,
  criticalIssues: 0,
  warnings: 0,
};

// Review each article
articleFiles.forEach((file, index) => {
  const filePath = path.join(articlesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log(`[${index + 1}/${articleFiles.length}] Reviewing: ${file}`);
  
  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let frontmatter = {};
  if (frontmatterMatch) {
    const fmContent = frontmatterMatch[1];
    frontmatter.title = fmContent.match(/title:\s*"([^"]+)"/)?.[1] || 
                       fmContent.match(/title:\s*([^\n]+)/)?.[1]?.trim() || 'N/A';
    frontmatter.description = fmContent.match(/description:\s*"([^"]+)"/)?.[1] || 
                              fmContent.match(/description:\s*([^\n]+)/)?.[1]?.trim() || 'N/A';
    frontmatter.author = fmContent.match(/author:\s*"([^"]+)"/)?.[1] || 
                        fmContent.match(/author:\s*([^\n]+)/)?.[1]?.trim() || 'N/A';
    frontmatter.date = fmContent.match(/date:\s*"([^"]+)"/)?.[1] || 
                      fmContent.match(/date:\s*([^\n]+)/)?.[1]?.trim() || 'N/A';
    frontmatter.category = fmContent.match(/category:\s*"([^"]+)"/)?.[1] || 
                           fmContent.match(/category:\s*([^\n]+)/)?.[1]?.trim() || 'N/A';
    frontmatter.tags = fmContent.match(/tags:\s*\[([^\]]+)\]/)?.[1] || 'N/A';
    frontmatter.estimatedTime = fmContent.match(/estimated_time:\s*"([^"]+)"/)?.[1] || 
                                fmContent.match(/estimated_time:\s*([^\n]+)/)?.[1]?.trim() || null;
    frontmatter.series = fmContent.match(/series:\s*"([^"]+)"/)?.[1] || 
                        fmContent.match(/series:\s*([^\n]+)/)?.[1]?.trim() || null;
    frontmatter.series_order = fmContent.match(/series_order:\s*(\d+)/)?.[1] || null;
    frontmatter.featured = fmContent.match(/featured:\s*(true|false)/)?.[1] === 'true';
    frontmatter.redirect = fmContent.match(/redirect:\s*"([^"]+)"/)?.[1] || null;
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
    codeBlocks: (content.match(/^```/gm) || []).length / 2,
    links: (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length,
    images: (content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []).length,
    mermaidDiagrams: (content.match(/```mermaid/g) || []).length,
    adbCommands: (content.match(/adb\s+shell/g) || []).length,
    bashCommands: (content.match(/```bash/g) || []).length,
    javaCode: (content.match(/```java/g) || []).length,
    cppCode: (content.match(/```cpp/g) || []).length,
    xmlCode: (content.match(/```xml/g) || []).length,
  };

  // Check for issues
  const issues = [];
  const warnings = [];
  const critical = [];

  // Frontmatter checks
  if (!frontmatter.title || frontmatter.title === 'N/A') {
    critical.push('Missing title in frontmatter');
  }
  if (!frontmatter.description || frontmatter.description === 'N/A') {
    critical.push('Missing description in frontmatter');
  } else if (frontmatter.description.length > 160) {
    warnings.push(`Description too long (${frontmatter.description.length} chars, recommended: 150-160)`);
  } else if (frontmatter.description.length < 50) {
    warnings.push(`Description too short (${frontmatter.description.length} chars, recommended: 50-160)`);
  }
  if (!frontmatter.date || frontmatter.date === 'N/A') {
    warnings.push('Missing or invalid date in frontmatter');
  }
  if (!frontmatter.category || frontmatter.category === 'N/A') {
    warnings.push('Missing category in frontmatter');
  }
  if (!frontmatter.tags || frontmatter.tags === 'N/A') {
    warnings.push('Missing tags in frontmatter');
  }

  // Content checks
  if (content.includes('TODO') || content.includes('FIXME')) {
    critical.push('Contains TODO or FIXME comments');
  }
  if (content.includes('[Your') || content.includes('[PLACEHOLDER')) {
    critical.push('Contains placeholder text');
  }
  
  // Check for malformed code blocks
  const codeBlockMatches = content.match(/```/g) || [];
  if (codeBlockMatches.length % 2 !== 0) {
    critical.push('Unclosed code block detected');
  }
  
  // Check for malformed Mermaid diagrams
  const mermaidOpen = (content.match(/```mermaid/g) || []).length;
  const mermaidClose = (content.match(/```\s*\n/g) || []).length;
  if (mermaidOpen > 0 && mermaidClose < mermaidOpen) {
    warnings.push('Possible unclosed Mermaid diagram');
  }

  // Check for broken image references
  const imageMatches = content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
  imageMatches.forEach(img => {
    const match = img.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (match && match[2] && !match[2].startsWith('http') && !match[2].startsWith('data:')) {
      const imgPath = path.join(__dirname, '..', match[2]);
      if (!fs.existsSync(imgPath)) {
        warnings.push(`Image not found: ${match[2]}`);
      }
    }
  });

  // Check for very long lines (potential formatting issues)
  const longLines = lines.filter(line => line.length > 200);
  if (longLines.length > 10) {
    warnings.push(`${longLines.length} lines exceed 200 characters (potential formatting issues)`);
  }

  // Check for empty sections
  const emptySections = content.match(/^##\s+[^\n]+\n\n$/gm) || [];
  if (emptySections.length > 0) {
    warnings.push(`${emptySections.length} potentially empty sections found`);
  }

  // Check for duplicate headings
  const headings = content.match(/^##\s+([^\n]+)/gm) || [];
  const headingTexts = headings.map(h => h.replace(/^##\s+/, '').trim().toLowerCase());
  const duplicates = headingTexts.filter((h, i) => headingTexts.indexOf(h) !== i);
  if (duplicates.length > 0) {
    warnings.push(`Duplicate headings found: ${[...new Set(duplicates)].join(', ')}`);
  }

  // Check for links to non-existent internal files
  const internalLinks = content.match(/\[([^\]]+)\]\(([^)]+\.(md|html))/g) || [];
  internalLinks.forEach(link => {
    const match = link.match(/\[([^\]]+)\]\(([^)]+)/);
    if (match && match[2]) {
      const linkPath = match[2];
      if (linkPath.startsWith('./') || linkPath.startsWith('../') || 
          (!linkPath.startsWith('http') && !linkPath.startsWith('#'))) {
        // For .html links, check if corresponding .md file exists
        if (linkPath.endsWith('.html')) {
          const mdPath = linkPath.replace('.html', '.md');
          const fullMdPath = path.join(path.dirname(filePath), mdPath);
          if (!fs.existsSync(fullMdPath) && !linkPath.startsWith('#')) {
            warnings.push(`Possible broken link (no source .md): ${linkPath}`);
          }
        } else if (linkPath.endsWith('.md')) {
          // For .md links, check if file exists
          const fullPath = path.join(path.dirname(filePath), linkPath);
          if (!fs.existsSync(fullPath) && !linkPath.startsWith('#')) {
            warnings.push(`Broken link (file not found): ${linkPath}`);
          }
        }
      }
    }
  });

  // Update global stats
  globalStats.totalLines += stats.totalLines;
  globalStats.totalDiagrams += stats.mermaidDiagrams;
  globalStats.totalCodeBlocks += stats.codeBlocks;
  globalStats.totalLinks += stats.links;
  if (critical.length > 0 || warnings.length > 0) {
    globalStats.articlesWithIssues++;
  }
  globalStats.criticalIssues += critical.length;
  globalStats.warnings += warnings.length;

  // Store results
  allResults.push({
    file,
    frontmatter,
    stats,
    issues: {
      critical,
      warnings,
    },
    hasIssues: critical.length > 0 || warnings.length > 0,
  });
});

// Generate report
console.log('\n' + '='.repeat(80));
console.log('\n📊 COMPREHENSIVE REVIEW REPORT\n');
console.log('='.repeat(80));

// Overall statistics
console.log('\n📈 Overall Statistics:');
console.log('─'.repeat(80));
console.log(`Total Articles:           ${globalStats.totalArticles}`);
console.log(`Total Lines:              ${globalStats.totalLines.toLocaleString()}`);
console.log(`Total Diagrams:           ${globalStats.totalDiagrams}`);
console.log(`Total Code Blocks:        ${globalStats.totalCodeBlocks}`);
console.log(`Total Links:              ${globalStats.totalLinks}`);
console.log(`Articles with Issues:     ${globalStats.articlesWithIssues}`);
console.log(`Critical Issues:          ${globalStats.criticalIssues}`);
console.log(`Warnings:                 ${globalStats.warnings}`);

// Articles summary
console.log('\n📚 Articles Summary:');
console.log('─'.repeat(80));
allResults.forEach((result, index) => {
  const status = result.hasIssues ? '⚠️' : '✅';
  const issuesCount = result.issues.critical.length + result.issues.warnings.length;
  const issuesText = issuesCount > 0 ? ` (${result.issues.critical.length} critical, ${result.issues.warnings.length} warnings)` : '';
  console.log(`${status} ${(index + 1).toString().padStart(2)}. ${result.file.padEnd(50)} ${result.stats.totalLines.toString().padStart(5)} lines${issuesText}`);
});

// Detailed issues
const articlesWithIssues = allResults.filter(r => r.hasIssues);
if (articlesWithIssues.length > 0) {
  console.log('\n⚠️  DETAILED ISSUES BY ARTICLE:');
  console.log('='.repeat(80));
  
  articlesWithIssues.forEach(result => {
    console.log(`\n📄 ${result.file}`);
    console.log('─'.repeat(80));
    console.log(`Title: ${result.frontmatter.title}`);
    console.log(`Lines: ${result.stats.totalLines} | Diagrams: ${result.stats.mermaidDiagrams} | Code Blocks: ${result.stats.codeBlocks}`);
    
    if (result.issues.critical.length > 0) {
      console.log('\n🔴 CRITICAL ISSUES:');
      result.issues.critical.forEach(issue => {
        console.log(`   ❌ ${issue}`);
      });
    }
    
    if (result.issues.warnings.length > 0) {
      console.log('\n🟡 WARNINGS:');
      result.issues.warnings.forEach(warning => {
        console.log(`   ⚠️  ${warning}`);
      });
    }
  });
} else {
  console.log('\n✅ No issues found across all articles!');
}

// Recommendations
console.log('\n💡 RECOMMENDATIONS:');
console.log('─'.repeat(80));

const recommendations = [];

if (globalStats.criticalIssues > 0) {
  recommendations.push('🔴 Fix all critical issues before publishing');
}

if (globalStats.warnings > 0) {
  recommendations.push('🟡 Review and address warnings for better quality');
}

const avgLines = Math.round(globalStats.totalLines / globalStats.totalArticles);
if (avgLines > 2000) {
  recommendations.push(`📏 Average article length is ${avgLines} lines - consider if any articles should be split`);
} else if (avgLines < 300) {
  recommendations.push(`📏 Average article length is ${avgLines} lines - consider expanding content`);
}

const articlesWithoutDescription = allResults.filter(r => !r.frontmatter.description || r.frontmatter.description === 'N/A');
if (articlesWithoutDescription.length > 0) {
  recommendations.push(`📝 ${articlesWithoutDescription.length} article(s) missing descriptions - add SEO-friendly descriptions`);
}

const articlesWithoutTags = allResults.filter(r => !r.frontmatter.tags || r.frontmatter.tags === 'N/A');
if (articlesWithoutTags.length > 0) {
  recommendations.push(`🏷️  ${articlesWithoutTags.length} article(s) missing tags - add relevant tags for SEO`);
}

if (recommendations.length === 0) {
  recommendations.push('✅ All articles look good! Ready for publishing.');
} else {
  recommendations.forEach(rec => console.log(`   ${rec}`));
}

// Pre-publication checklist
console.log('\n📋 PRE-PUBLICATION CHECKLIST:');
console.log('─'.repeat(80));
console.log('   [ ] All critical issues resolved');
console.log('   [ ] All warnings reviewed and addressed');
console.log('   [ ] All articles have proper frontmatter (title, description, tags)');
console.log('   [ ] All Mermaid diagrams render correctly');
console.log('   [ ] All code examples are accurate');
console.log('   [ ] All ADB commands are tested/verified');
console.log('   [ ] All internal links work');
console.log('   [ ] All external links are valid');
console.log('   [ ] Grammar and spelling checked');
console.log('   [ ] Technical accuracy verified');
console.log('   [ ] Build completes without errors');
console.log('   [ ] Preview in browser looks good');

// Export detailed report
const reportPath = path.join(__dirname, '..', 'docs', 'COMPREHENSIVE_REVIEW_REPORT.md');
const reportContent = `# Comprehensive Article Review Report

Generated: ${new Date().toISOString()}

## Overall Statistics

- **Total Articles**: ${globalStats.totalArticles}
- **Total Lines**: ${globalStats.totalLines.toLocaleString()}
- **Total Diagrams**: ${globalStats.totalDiagrams}
- **Total Code Blocks**: ${globalStats.totalCodeBlocks}
- **Total Links**: ${globalStats.totalLinks}
- **Articles with Issues**: ${globalStats.articlesWithIssues}
- **Critical Issues**: ${globalStats.criticalIssues}
- **Warnings**: ${globalStats.warnings}

## Articles Summary

${allResults.map((r, i) => {
  const status = r.hasIssues ? '⚠️' : '✅';
  const issues = r.issues.critical.length + r.issues.warnings.length;
  return `${i + 1}. ${status} **${r.file}** - ${r.stats.totalLines} lines, ${r.stats.mermaidDiagrams} diagrams, ${r.stats.codeBlocks} code blocks${issues > 0 ? ` (${r.issues.critical.length} critical, ${r.issues.warnings.length} warnings)` : ''}`;
}).join('\n')}

## Detailed Issues

${articlesWithIssues.map(r => {
  return `### ${r.file}

**Title**: ${r.frontmatter.title}
**Lines**: ${r.stats.totalLines} | **Diagrams**: ${r.stats.mermaidDiagrams} | **Code Blocks**: ${r.stats.codeBlocks}

${r.issues.critical.length > 0 ? `#### Critical Issues\n${r.issues.critical.map(i => `- ❌ ${i}`).join('\n')}\n` : ''}
${r.issues.warnings.length > 0 ? `#### Warnings\n${r.issues.warnings.map(w => `- ⚠️  ${w}`).join('\n')}\n` : ''}
`;
}).join('\n---\n\n')}

## Recommendations

${recommendations.map(r => `- ${r}`).join('\n')}

## Next Steps

1. Fix all critical issues
2. Review and address warnings
3. Test all articles in browser
4. Verify all links work
5. Check grammar and spelling
6. Verify technical accuracy
7. Run final build and preview
`;

fs.writeFileSync(reportPath, reportContent, 'utf8');
console.log(`\n📄 Detailed report saved to: ${reportPath}`);

console.log('\n' + '='.repeat(80));
console.log('\n✅ Review complete!\n');

