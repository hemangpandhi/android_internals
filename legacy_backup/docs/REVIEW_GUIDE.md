# Article Review Guide

## Quick Start

### Review All Articles
```bash
node tools/review-all-articles.js
```

This will:
- Review all 9 articles
- Generate statistics
- Identify issues and warnings
- Create a detailed report in `docs/COMPREHENSIVE_REVIEW_REPORT.md`

### Review Single Article
```bash
node tools/review-article.js content/articles/android-system-server-binder-ipc.md
```

## Review Process

### 1. Automated Review (Start Here)
Run the comprehensive review tool:
```bash
node tools/review-all-articles.js
```

This checks for:
- ✅ Missing frontmatter (title, description, tags, date)
- ✅ Description length (SEO optimization)
- ✅ TODO/FIXME comments
- ✅ Placeholder text
- ✅ Unclosed code blocks
- ✅ Malformed Mermaid diagrams
- ✅ Broken internal links
- ✅ Missing images
- ✅ Duplicate headings
- ✅ Very long lines

### 2. Manual Review Checklist

After automated review, manually verify:

#### Content Quality
- [ ] **Technical Accuracy**: All technical claims are correct
- [ ] **Code Examples**: Code snippets are accurate and tested
- [ ] **ADB Commands**: All commands are correct and tested
- [ ] **File Paths**: AOSP file paths are accurate
- [ ] **API References**: Android API versions and methods are correct
- [ ] **Diagrams**: Mermaid diagrams are accurate and render correctly

#### Content Structure
- [ ] **Headings**: Proper hierarchy (H1 → H2 → H3)
- [ ] **Code Blocks**: Proper language tags (bash, java, cpp, xml)
- [ ] **Links**: All internal and external links work
- [ ] **Images**: All images load correctly
- [ ] **Formatting**: Consistent formatting throughout

#### SEO & Metadata
- [ ] **Title**: Clear, descriptive, SEO-friendly
- [ ] **Description**: 50-160 characters, summarizes content
- [ ] **Tags**: Relevant tags for discoverability
- [ ] **Category**: Appropriate category assigned

#### Grammar & Style
- [ ] **Grammar**: No grammatical errors
- [ ] **Spelling**: No spelling mistakes
- [ ] **Consistency**: Consistent terminology
- [ ] **Clarity**: Content is clear and understandable

### 3. Browser Preview

After fixing issues, preview in browser:
```bash
cd build && python3 -m http.server 8080
```

Then check:
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Diagrams render properly
- [ ] Code blocks are formatted correctly
- [ ] Links work (internal and external)
- [ ] Mobile responsiveness
- [ ] No console errors

### 4. Final Build Check

```bash
node tools/build.js
```

Verify:
- [ ] Build completes without errors
- [ ] All HTML files generated
- [ ] Sitemap includes all pages
- [ ] No broken references

## Understanding Review Output

### Status Indicators
- ✅ **Green checkmark**: Article has no issues
- ⚠️ **Warning**: Article has warnings (non-critical)
- 🔴 **Critical**: Article has critical issues (must fix)

### Issue Types

#### Critical Issues (Must Fix)
- Missing title or description
- TODO/FIXME comments
- Placeholder text
- Unclosed code blocks

#### Warnings (Should Fix)
- Description too long/short
- Missing tags or category
- Possible broken links
- Long lines (>200 chars)
- Duplicate headings

### False Positives

**"Possible broken link" warnings** for `.html` files are usually **false positives**:
- Articles link to `.html` files (generated during build)
- Tool checks for `.md` source files
- If the corresponding `.md` file exists, the link is valid
- These warnings can be ignored if the source `.md` file exists

## Review Tools Comparison

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `review-all-articles.js` | Review all articles at once | **Start here** - Get overview of all articles |
| `review-article.js` | Review single article in detail | Focus on specific article |
| Manual checklist | Verify content quality | After automated review |

## Recommended Review Workflow

1. **Run comprehensive review**:
   ```bash
   node tools/review-all-articles.js
   ```

2. **Review the generated report**:
   - Open `docs/COMPREHENSIVE_REVIEW_REPORT.md`
   - Focus on critical issues first
   - Then address warnings

3. **Fix critical issues**:
   - Missing frontmatter
   - TODO/FIXME comments
   - Placeholder text

4. **Address warnings**:
   - Description length
   - Missing tags
   - Long lines

5. **Manual content review**:
   - Technical accuracy
   - Code examples
   - ADB commands
   - Grammar and spelling

6. **Browser preview**:
   - Test all pages
   - Verify diagrams
   - Check links

7. **Final build**:
   - Run build
   - Verify no errors
   - Check generated files

## Tips for Efficient Review

### For Large Content
- Review one article at a time
- Use the single-article review tool for detailed analysis
- Focus on critical issues first
- Use browser preview to catch visual issues

### For Technical Content
- Test ADB commands in actual Android environment
- Verify code examples compile/run
- Check AOSP file paths against actual source
- Verify API versions and methods

### For SEO
- Ensure all articles have descriptions (50-160 chars)
- Add relevant tags
- Use descriptive titles
- Check meta descriptions in generated HTML

## Common Issues and Fixes

### Issue: "Description too long"
**Fix**: Shorten description to 150-160 characters for optimal SEO

### Issue: "Missing tags"
**Fix**: Add relevant tags in frontmatter:
```yaml
tags: ["system_server", "binder", "android", "architecture"]
```

### Issue: "Possible broken link"
**Fix**: 
- If linking to `.html`, ensure corresponding `.md` file exists
- If linking to `.md`, change to `.html` (links should point to generated files)
- Verify the file path is correct

### Issue: "Contains TODO or FIXME"
**Fix**: Remove or complete TODO/FIXME comments before publishing

### Issue: "Unclosed code block"
**Fix**: Ensure every ` ``` ` has a matching closing ` ``` `

## Next Steps After Review

1. Fix all critical issues
2. Address important warnings
3. Run build: `node tools/build.js`
4. Preview in browser
5. Final manual check
6. Commit and push

---

**Need help?** Check `docs/REVIEW_CHECKLIST.md` for detailed manual review steps.


