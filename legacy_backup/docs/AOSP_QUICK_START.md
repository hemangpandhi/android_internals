# AOSP Code Analyzer - Quick Start Guide

## Setup Local Repository (Recommended)

For faster, offline-capable analysis, clone the AOSP repository locally:

```bash
# One-time setup (clones frameworks/base)
node tools/setup-aosp-repo.js setup

# Check status
node tools/setup-aosp-repo.js status
```

**Benefits:**
- ⚡ Instant access (no network delays)
- 📴 Offline capability
- 🔍 Better for cross-file analysis
- 📚 Access to Git history

The analyzer automatically uses the local repository when available. See [AOSP_LOCAL_REPO.md](./AOSP_LOCAL_REPO.md) for details.

## Quick Examples

### 1. Fetch and View Source Code

```bash
node tools/aosp-code-analyzer.js fetch frameworks/base/core/java/android/os/Binder.java
```

### 2. Parse Java File Structure

```bash
node tools/aosp-code-analyzer.js parse frameworks/base/services/java/com/android/server/SystemServer.java
```

### 3. Generate Class Diagram

```bash
# All classes
node tools/aosp-code-analyzer.js class-diagram frameworks/base/services/java/com/android/server/SystemServer.java

# Specific class
node tools/aosp-code-analyzer.js class-diagram frameworks/base/services/java/com/android/server/SystemServer.java SystemServer
```

### 4. Generate Sequence Diagram

```bash
node tools/aosp-code-analyzer.js sequence-diagram frameworks/base/services/java/com/android/server/SystemServer.java run
```

### 5. Extract Code Block

```bash
node tools/aosp-code-analyzer.js code-block frameworks/base/services/java/com/android/server/SystemServer.java 100 150 5
```

## Using in Articles

### Step 1: Add Directives to Your Markdown

```markdown
## SystemServer Architecture

<!-- AOSP_CLASS_DIAGRAM: frameworks/base/services/java/com/android/server/SystemServer.java SystemServer -->

The SystemServer class manages all system services...

<!-- AOSP_CODE_BLOCK: frameworks/base/services/java/com/android/server/SystemServer.java 100 150 5 -->
```

### Step 2: Process Articles

```bash
node tools/aosp-integration.js process
```

This will:
- Fetch source code from AOSP
- Generate diagrams
- Extract code blocks
- Replace directives with actual content
- Add source links automatically

### Step 3: Build Site

```bash
node tools/build.js
```

## Common File Paths

```
frameworks/base/services/java/com/android/server/SystemServer.java
frameworks/base/core/java/android/os/Binder.java
frameworks/base/core/java/android/os/Parcel.java
frameworks/base/services/core/java/com/android/server/ActivityManagerService.java
frameworks/base/services/core/java/com/android/server/Watchdog.java
```

## Tips

1. **Cache**: Source code is cached for 24 hours. Clear cache if you need fresh data:
   ```bash
   node tools/aosp-code-analyzer.js clear-cache
   ```

2. **Large Files**: Very large files may take time. Be patient.

3. **Network**: Requires internet connection to fetch from AOSP.

4. **Version**: All code is fetched from `android-16.0.0_r3` tag.

## Troubleshooting

**"HTTP 404"**: Check file path format (no leading slash, no `platform/` prefix)

**"Failed to decode"**: Try clearing cache and fetching again

**"No diagram generated"**: Check if class/method exists in the file

For more details, see [AOSP_CODE_ANALYZER.md](./AOSP_CODE_ANALYZER.md)

