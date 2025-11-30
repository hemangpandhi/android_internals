# AOSP Local Repository Setup

## Overview

Instead of fetching source code from the web every time, you can clone the AOSP `frameworks/base` repository locally. This provides:

- ✅ **Faster access** - No network requests
- ✅ **Offline capability** - Work without internet
- ✅ **Better analysis** - Access to full repository structure
- ✅ **Cross-file references** - Analyze relationships between files
- ✅ **Git history** - Access to commit history and diffs

## Quick Setup

```bash
# Clone the repository (one-time setup)
node tools/setup-aosp-repo.js setup

# Check status
node tools/setup-aosp-repo.js status

# Update to latest tag
node tools/setup-aosp-repo.js update
```

## Commands

### Setup/Clone

```bash
# Shallow clone (fast, no history)
node tools/setup-aosp-repo.js setup

# Full clone with complete history
node tools/setup-aosp-repo.js setup --full-history
```

Clones the `frameworks/base` repository from AOSP tag `android-16.0.0_r3` to `.aosp-repo/frameworks-base/`.

**Repository Structure:**
```
.aosp-repo/
  └── frameworks-base/    # AOSP frameworks/base repository
      ├── .git/
      ├── services/
      ├── core/
      └── ...
```

**Options:**
- `--force` or `-f`: Force re-clone (removes existing repository)
- `--full-history` or `--full`: Clone with complete Git history (slower, larger ~9-10 GB)

**Example:**
```bash
node tools/setup-aosp-repo.js setup --force
```

### Status

```bash
node tools/setup-aosp-repo.js status
```

Shows repository status, current tag, and statistics (number of Java files, commit hash, etc.).

**Output:**
```
✅ Repository found
   Location: /path/to/.aosp-repo
   Current: android-16.0.0_r3
   Branch: android-16.0.0_r3
   ✅ Tag matches: android-16.0.0_r3

📊 Repository Statistics:
   Java files: 12345
   Commit: 33b96ce8a122
   Date: 2025-07-31 18:44:37 -0700
```

### Update

```bash
node tools/setup-aosp-repo.js update
```

Updates the repository to the latest `android-16.0.0_r3` tag (fetches and checks out).

### Info

```bash
node tools/setup-aosp-repo.js info
```

Shows detailed repository information in JSON format.

### Remove

```bash
node tools/setup-aosp-repo.js remove
```

Removes the local repository directory.

## How It Works

### Automatic Detection

The AOSP Code Analyzer automatically detects and uses the local repository:

1. **First**: Checks for local repository (`.aosp-repo/`)
2. **Second**: Checks cache (`.aosp-cache/`)
3. **Last**: Falls back to web fetching

### File Path Mapping

For `frameworks/base` files, the analyzer automatically maps paths:

```
frameworks/base/services/java/com/android/server/SystemServer.java
  ↓
.aosp-repo/services/java/com/android/server/SystemServer.java
```

### Supported Paths

Currently, the local repository supports:
- ✅ `frameworks/base/*` - Fully supported

For other paths (packages, system, etc.), the analyzer falls back to web fetching.

## Benefits

### 1. Faster Analysis

**Before (Web):**
```
🌐 Fetching: https://android.googlesource.com/...
⏳ Waiting for network...
✅ Fetched and cached: SystemServer.java
```

**After (Local):**
```
📁 Using local repository: SystemServer.java
⚡ Instant access!
```

### 2. Offline Work

Once cloned, you can:
- Generate diagrams without internet
- Analyze code structure offline
- Extract code blocks locally

### 3. Better Analysis

With local repository, you can:
- Analyze cross-file dependencies
- Find all usages of a class/method
- Generate comprehensive class hierarchies
- Access Git history for changes

### 4. Repository Statistics

```bash
$ node tools/setup-aosp-repo.js status
📊 Repository Statistics:
   Java files: 12,345
   Total size: ~500 MB
```

## Integration with Analyzer

The analyzer automatically uses the local repository when available:

```bash
# This will use local repo if available
node tools/aosp-code-analyzer.js fetch frameworks/base/services/java/com/android/server/SystemServer.java

# This will also use local repo
node tools/aosp-code-analyzer.js class-diagram frameworks/base/services/java/com/android/server/SystemServer.java
```

## Repository Structure

The repository is organized as follows:

```
.aosp-repo/
  └── frameworks-base/    # AOSP frameworks/base repository
      ├── .git/            # Git metadata and history
      ├── services/        # System services
      ├── core/            # Core framework
      └── ...              # Other AOSP components
```

This structure allows for future expansion (e.g., adding `packages`, `system`, etc.).

## Repository Size

The `frameworks/base` repository size depends on clone type:
- **Shallow clone** (`--depth 1`): ~200-300 MB, no history
- **Full clone with history** (`--full-history`): ~9-10 GB, complete Git history

**Full History Includes:**
- Over 1 million commits
- Complete change history
- All branches and tags
- Full Git metadata

## Maintenance

### Update Repository

If AOSP releases updates to the tag:

```bash
node tools/setup-aosp-repo.js update
```

### Re-clone Repository

If you encounter issues:

```bash
node tools/setup-aosp-repo.js remove
node tools/setup-aosp-repo.js setup
```

### Check Repository Health

```bash
node tools/setup-aosp-repo.js status
```

## Troubleshooting

### "Git is not installed"

Install Git:
- **macOS**: `brew install git`
- **Linux**: `sudo apt-get install git` or `sudo yum install git`
- **Windows**: Download from [git-scm.com](https://git-scm.com/)

### "Failed to clone repository"

**Possible causes:**
1. Network issues - Check internet connection
2. Firewall blocking - Allow Git/HTTPS connections
3. Disk space - Ensure sufficient space (~1 GB free)

**Solutions:**
- Try again later (AOSP servers may be busy)
- Use `--force` to re-clone
- Check disk space: `df -h`

### "Repository not found"

If the analyzer says "Repository not found":
1. Check if repository exists: `ls -la .aosp-repo/`
2. Verify setup: `node tools/setup-aosp-repo.js status`
3. Re-clone if needed: `node tools/setup-aosp-repo.js setup --force`

### "Tag mismatch"

If status shows tag mismatch:
```bash
node tools/setup-aosp-repo.js update
```

## Advanced Usage

### Access Git History

Once cloned with `--full-history`, you can use Git directly:

```bash
cd .aosp-repo

# View commit history
git log --oneline -20

# View changes to a file
git log -p services/java/com/android/server/SystemServer.java

# Find when a method was added
git log -S "methodName" --source --all

# View commit statistics
git log --oneline | wc -l  # Total commits

# View changes between versions
git diff android-16.0.0_r2..android-16.0.0_r3

# Find commits by author
git log --author="YourName"

# View file history with blame
git blame services/java/com/android/server/SystemServer.java

# Search commit messages
git log --grep="SystemServer" --oneline
```

**Note:** Git history is only available if you cloned with `--full-history` flag.

### Custom Analysis Scripts

You can write custom scripts that use the local repository:

```javascript
const fs = require('fs');
const path = require('path');

const AOSP_REPO = path.join(__dirname, '..', '.aosp-repo');
const filePath = path.join(AOSP_REPO, 'services/java/com/android/server/SystemServer.java');

const code = fs.readFileSync(filePath, 'utf8');
// Your custom analysis here
```

## Best Practices

1. **Use shallow clone** - Faster and uses less space
2. **Keep repository updated** - Run `update` periodically
3. **Don't commit `.aosp-repo/`** - It's in `.gitignore`
4. **Use for frameworks/base** - Other repos need separate setup

## Next Steps

1. **Setup repository**: `node tools/setup-aosp-repo.js setup`
2. **Verify**: `node tools/setup-aosp-repo.js status`
3. **Use analyzer**: All commands automatically use local repo
4. **Generate content**: Add directives to articles and process

## References

- [AOSP Source Browser](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r3)
- [Git Documentation](https://git-scm.com/doc)
- [AOSP Code Analyzer Documentation](./AOSP_CODE_ANALYZER.md)

