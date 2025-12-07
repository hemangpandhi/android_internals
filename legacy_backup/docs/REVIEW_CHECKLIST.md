# Article Review Checklist

## How to Review and Confirm Article Content

This guide helps you systematically review articles to ensure accuracy, correctness, and quality.

## Quick Review Process

### 1. **Source File Review** (Primary)
Always review the **source Markdown file** first:
- Location: `content/articles/android-system-server-deep-dive.md`
- This is the source of truth - all HTML is generated from this file

### 2. **Generated HTML Review** (Secondary)
Check the generated HTML for:
- Proper rendering
- Formatting issues
- Broken links
- Diagram display

## Comprehensive Review Checklist

### ✅ Content Accuracy

#### Technical Content
- [ ] **Technical accuracy**: Verify all technical claims are correct
- [ ] **Code examples**: Test all code snippets if possible
- [ ] **Command syntax**: Verify all ADB/Shell commands are correct
- [ ] **File paths**: Check all AOSP file paths are accurate
- [ ] **API references**: Verify Android API versions and methods
- [ ] **Architecture diagrams**: Confirm Mermaid diagrams are accurate

#### Commands Review
- [ ] **ADB commands**: Test each `adb shell` command
- [ ] **Shell commands**: Verify bash/shell syntax
- [ ] **File operations**: Check file paths and permissions
- [ ] **Output examples**: Ensure command outputs match expected results

### ✅ Content Structure

#### Markdown Structure
- [ ] **Frontmatter**: Check title, description, author, date, tags
- [ ] **Headings hierarchy**: Verify H1 → H2 → H3 structure
- [ ] **Code blocks**: Ensure proper language tags (bash, java, etc.)
- [ ] **Links**: Verify all internal and external links work
- [ ] **Images**: Check image paths and alt text

#### Formatting
- [ ] **Code blocks**: Proper syntax highlighting
- [ ] **Lists**: Consistent bullet/numbered list formatting
- [ ] **Tables**: Properly formatted and readable
- [ ] **Blockquotes**: Used appropriately for notes/warnings

### ✅ Technical Verification

#### Code Examples
```bash
# Example: Test ADB commands
adb shell dumpsys activity activities
adb shell ps -A | grep system_server
```

#### AOSP References
- [ ] **File paths**: Verify paths match actual AOSP structure
- [ ] **Class names**: Check Java/Kotlin class names are correct
- [ ] **Method signatures**: Verify method names and parameters

#### Diagrams
- [ ] **Mermaid syntax**: Check diagram syntax is valid
- [ ] **Content accuracy**: Verify diagram represents correct architecture
- [ ] **Rendering**: Confirm diagrams render correctly in HTML

### ✅ SEO and Metadata

- [ ] **Title**: Clear, descriptive, includes keywords
- [ ] **Description**: Accurate summary (150-160 chars)
- [ ] **Tags**: Relevant and comprehensive
- [ ] **Category**: Correctly categorized
- [ ] **Date**: Current and accurate

### ✅ Readability

- [ ] **Grammar and spelling**: No typos or errors
- [ ] **Clarity**: Technical concepts explained clearly
- [ ] **Flow**: Logical progression of topics
- [ ] **Examples**: Sufficient examples for complex concepts
- [ ] **Consistency**: Consistent terminology throughout

## Automated Review Tools

### 1. **Markdown Linting**
```bash
# Install markdownlint (if not installed)
npm install -g markdownlint-cli

# Check markdown file
markdownlint content/articles/android-system-server-deep-dive.md
```

### 2. **Spell Checking**
```bash
# Install aspell (macOS)
brew install aspell

# Check spelling
aspell check content/articles/android-system-server-deep-dive.md
```

### 3. **Link Checking**
```bash
# Check for broken links (requires linkchecker)
linkchecker build/articles/android-system-server-deep-dive.html
```

### 4. **Build Verification**
```bash
# Rebuild and check for errors
node tools/build.js

# Check for build warnings/errors
node tools/build.js 2>&1 | grep -i "error\|warning"
```

## Manual Review Steps

### Step 1: Review Source Markdown
```bash
# Open source file
code content/articles/android-system-server-deep-dive.md

# Or view in terminal
cat content/articles/android-system-server-deep-dive.md | less
```

### Step 2: Check Generated HTML
1. Open `http://localhost:8080/articles/android-system-server-deep-dive.html`
2. Review each section systematically
3. Test all interactive elements (diagrams, code blocks)
4. Check responsive design on mobile/tablet

### Step 3: Verify Commands
For each command in the article:
1. Copy the command
2. Test in terminal/ADB shell
3. Verify output matches article
4. Check for typos or syntax errors

### Step 4: Cross-Reference
- [ ] **AOSP Source**: Verify file paths exist in AOSP
- [ ] **Android Docs**: Check API references against official docs
- [ ] **Related Articles**: Ensure consistency with other articles

## Review Workflow

### Initial Review
1. ✅ Read entire article for flow and coherence
2. ✅ Check all headings and structure
3. ✅ Verify frontmatter metadata
4. ✅ Test all commands (if possible)

### Technical Review
1. ✅ Verify code examples compile/run
2. ✅ Check AOSP file paths
3. ✅ Validate architecture diagrams
4. ✅ Test ADB commands on real device/emulator

### Final Review
1. ✅ Spell check
2. ✅ Grammar review
3. ✅ Link verification
4. ✅ Formatting consistency
5. ✅ SEO optimization

## Common Issues to Watch For

### ❌ Common Mistakes
- **Incorrect file paths**: AOSP paths change between versions
- **Outdated commands**: ADB commands may change
- **Broken code blocks**: Missing language tags
- **Invalid Mermaid syntax**: Diagrams won't render
- **Dead links**: External links may break
- **Inconsistent terminology**: Use same terms throughout

### ✅ Quick Fixes
- **Code blocks**: Always include language tag (```bash, ```java)
- **Commands**: Test before publishing
- **Links**: Use relative paths for internal links
- **Diagrams**: Test Mermaid syntax online first

## Review Checklist Template

Copy this for each article review:

```
Article: [Article Title]
Date: [Review Date]
Reviewer: [Your Name]

Content Accuracy: [ ] Pass [ ] Fail
Commands: [ ] Pass [ ] Fail
Code Examples: [ ] Pass [ ] Fail
Diagrams: [ ] Pass [ ] Fail
Links: [ ] Pass [ ] Fail
Formatting: [ ] Pass [ ] Fail
SEO: [ ] Pass [ ] Fail
Readability: [ ] Pass [ ] Fail

Issues Found:
1. 
2. 
3. 

Notes:
```

## Quick Commands Reference

```bash
# View source markdown
cat content/articles/android-system-server-deep-dive.md

# Rebuild article
node tools/build.js

# Start local server
cd build && python3 -m http.server 8080

# Check for broken links (if linkchecker installed)
linkchecker build/articles/android-system-server-deep-dive.html

# Count code blocks
grep -c "```" content/articles/android-system-server-deep-dive.md

# Count commands
grep -c "adb\|shell\|bash" content/articles/android-system-server-deep-dive.md
```

## Next Steps After Review

1. **Fix Issues**: Update source markdown file
2. **Rebuild**: Run `node tools/build.js`
3. **Verify**: Check generated HTML
4. **Test**: Test on different devices/browsers
5. **Deploy**: Push to production when ready

---

**Remember**: Always review the source Markdown file (`content/articles/*.md`) as the primary source. The HTML is generated automatically and will reflect any changes you make to the Markdown.


