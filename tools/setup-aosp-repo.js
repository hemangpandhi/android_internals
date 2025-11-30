#!/usr/bin/env node

/**
 * Setup AOSP Local Repository
 * 
 * Clones the frameworks/base repository from AOSP for local analysis.
 * This provides faster access and enables more sophisticated code analysis.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const AOSP_REPO_BASE_DIR = path.join(__dirname, '..', '.aosp-repo');
const AOSP_VERSION_TAG = 'android-16.0.0_r3';

// Repository configurations
const AOSP_REPOS = {
  'frameworks-base': {
    name: 'frameworks-base',
    url: 'https://android.googlesource.com/platform/frameworks/base',
    dir: path.join(AOSP_REPO_BASE_DIR, 'frameworks-base'),
    description: 'AOSP frameworks/base (Java framework, system services)'
  },
  'frameworks-native': {
    name: 'frameworks-native',
    url: 'https://android.googlesource.com/platform/frameworks/native',
    dir: path.join(AOSP_REPO_BASE_DIR, 'frameworks-native'),
    description: 'AOSP frameworks/native (Native libraries, Binder, SurfaceFlinger)'
  },
  'packages-services-car': {
    name: 'packages-services-car',
    url: 'https://android.googlesource.com/platform/packages/services/Car',
    dir: path.join(AOSP_REPO_BASE_DIR, 'packages-services-car'),
    description: 'AOSP packages/services/Car (Android Automotive OS)'
  }
};

// Default repository (for backward compatibility)
const AOSP_REPO_DIR = AOSP_REPOS['frameworks-base'].dir;
const AOSP_REPO_URL = AOSP_REPOS['frameworks-base'].url;

function checkGitInstalled() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function cloneRepository(repoKey, fullHistory = false) {
  const repo = AOSP_REPOS[repoKey];
  if (!repo) {
    console.error(`❌ Unknown repository: ${repoKey}`);
    console.error(`   Available repositories: ${Object.keys(AOSP_REPOS).join(', ')}`);
    return false;
  }
  
  // Ensure base directory exists
  if (!fs.existsSync(AOSP_REPO_BASE_DIR)) {
    fs.mkdirSync(AOSP_REPO_BASE_DIR, { recursive: true });
  }
  
  console.log(`📦 Cloning ${repo.description}...`);
  console.log(`   URL: ${repo.url}`);
  console.log(`   Tag: ${AOSP_VERSION_TAG}`);
  console.log(`   Destination: ${repo.dir}`);
  console.log(`   Full History: ${fullHistory ? 'Yes (complete Git history)' : 'No (shallow clone)'}`);
  console.log('');
  
  if (fullHistory) {
    console.log('⏳ Cloning with full history - this will take longer (10-30 minutes)...');
    console.log('   Repository size: ~9-10 GB with full history');
  } else {
    console.log('⏳ Cloning shallow (depth=1) - faster but no history...');
    console.log('   Repository size: ~200-300 MB');
  }
  console.log('');
  
  try {
    if (fullHistory) {
      // Full clone with complete history
      console.log('📥 Cloning full repository with history...');
      execSync(`git clone ${repo.url} "${repo.dir}"`, { stdio: 'inherit' });
      
      // Checkout the specific tag
      console.log(`\n📌 Checking out tag: ${AOSP_VERSION_TAG}...`);
      process.chdir(repo.dir);
      execSync(`git checkout ${AOSP_VERSION_TAG}`, { stdio: 'inherit' });
      process.chdir(__dirname);
      
      console.log('');
      console.log(`✅ ${repo.name} cloned successfully with full history!`);
      console.log('   You can now access commit history, diffs, and Git operations.');
      return true;
    } else {
      // Shallow clone for faster setup
      execSync(
        `git clone --depth 1 --branch ${AOSP_VERSION_TAG} ${repo.url} "${repo.dir}"`,
        { stdio: 'inherit' }
      );
      console.log('');
      console.log(`✅ ${repo.name} cloned successfully (shallow clone)!`);
      console.log('   Note: No commit history available. Use --full-history for complete history.');
      return true;
    }
  } catch (error) {
    console.error('');
    console.error(`❌ Failed to clone ${repo.name}`);
    
    if (fullHistory) {
      console.error('   Error:', error.message);
      console.error('');
      console.error('💡 Suggestions:');
      console.error('   - Check internet connection');
      console.error('   - Ensure sufficient disk space (~1 GB free)');
      console.error('   - Try again later (AOSP servers may be busy)');
      return false;
    } else {
      console.error('   Trying alternative method (full clone)...');
      
      try {
        // Fallback: full clone then checkout tag
        execSync(`git clone ${repo.url} "${repo.dir}"`, { stdio: 'inherit' });
        process.chdir(repo.dir);
        execSync(`git checkout ${AOSP_VERSION_TAG}`, { stdio: 'inherit' });
        process.chdir(__dirname);
        console.log('');
        console.log(`✅ ${repo.name} cloned successfully (full clone)!`);
        return true;
      } catch (error2) {
        console.error('');
        console.error(`❌ Failed to clone ${repo.name}`);
        console.error('   Error:', error2.message);
        return false;
      }
    }
  }
}

function cloneAllRepositories(fullHistory = false) {
  console.log('📦 Cloning all AOSP repositories...\n');
  const results = {};
  
  for (const [key, repo] of Object.entries(AOSP_REPOS)) {
    if (fs.existsSync(repo.dir) && fs.existsSync(path.join(repo.dir, '.git'))) {
      console.log(`⏭️  Skipping ${repo.name} (already exists)`);
      results[key] = 'exists';
      continue;
    }
    
    console.log(`\n${'='.repeat(60)}`);
    const success = cloneRepository(key, fullHistory);
    results[key] = success ? 'success' : 'failed';
    console.log(`${'='.repeat(60)}\n`);
  }
  
  console.log('\n📊 Summary:');
  for (const [key, status] of Object.entries(results)) {
    const icon = status === 'success' ? '✅' : status === 'exists' ? '⏭️' : '❌';
    console.log(`   ${icon} ${AOSP_REPOS[key].name}: ${status}`);
  }
  
  return Object.values(results).every(s => s === 'success' || s === 'exists');
}

function updateRepository() {
  if (!fs.existsSync(AOSP_REPO_DIR)) {
    console.error('❌ Repository not found. Run setup first.');
    return false;
  }
  
  console.log('🔄 Updating AOSP repository...');
  
  try {
    process.chdir(AOSP_REPO_DIR);
    execSync('git fetch origin', { stdio: 'inherit' });
    execSync(`git checkout ${AOSP_VERSION_TAG}`, { stdio: 'inherit' });
    process.chdir(__dirname);
    console.log('✅ Repository updated!');
    return true;
  } catch (error) {
    console.error('❌ Failed to update repository:', error.message);
    return false;
  }
}

function checkRepositoryStatus(repoKey = null) {
  const reposToCheck = repoKey ? [repoKey] : Object.keys(AOSP_REPOS);
  let foundAny = false;
  
  for (const key of reposToCheck) {
    const repo = AOSP_REPOS[key];
    if (!repo) continue;
    
    if (!fs.existsSync(repo.dir)) {
      if (repoKey) {
        console.log(`❌ Repository not found: ${repo.name}`);
        return false;
      }
      continue;
    }
    
    if (!fs.existsSync(path.join(repo.dir, '.git'))) {
      if (repoKey) {
        console.log(`❌ Invalid repository (missing .git directory): ${repo.name}`);
        return false;
      }
      continue;
    }
    
    try {
      process.chdir(repo.dir);
      const currentTag = execSync('git describe --tags --exact-match HEAD 2>/dev/null || git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      const commitCount = execSync('git rev-list --count HEAD 2>/dev/null || echo "0"', { encoding: 'utf8' }).trim();
      process.chdir(__dirname);
      
      console.log(`✅ ${repo.name} found`);
      console.log(`   Location: ${repo.dir}`);
      console.log(`   Current: ${currentTag}`);
      console.log(`   Branch: ${branch}`);
      if (commitCount !== '0') {
        console.log(`   Commits: ${parseInt(commitCount).toLocaleString()}`);
      }
      
      if (currentTag.includes(AOSP_VERSION_TAG) || branch === AOSP_VERSION_TAG) {
        console.log(`   ✅ Tag matches: ${AOSP_VERSION_TAG}`);
      } else {
        console.log(`   ⚠️  Tag mismatch (expected: ${AOSP_VERSION_TAG})`);
      }
      
      foundAny = true;
      console.log('');
    } catch (error) {
      console.error(`❌ Error checking ${repo.name}:`, error.message);
    }
  }
  
  return foundAny;
}

function getRepositoryInfo(repoKey = 'frameworks-base') {
  const repo = AOSP_REPOS[repoKey];
  if (!repo || !fs.existsSync(repo.dir)) {
    return null;
  }
  
  try {
    process.chdir(repo.dir);
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const commitDate = execSync('git log -1 --format=%ci', { encoding: 'utf8' }).trim();
    
    // Count files based on repository type
    let fileCount = 0;
    try {
      if (repoKey === 'frameworks-base') {
        fileCount = parseInt(execSync('find . -type f -name "*.java" | wc -l', { encoding: 'utf8' }).trim()) || 0;
      } else if (repoKey === 'frameworks-native') {
        fileCount = parseInt(execSync('find . -type f \\( -name "*.cpp" -o -name "*.c" -o -name "*.h" \\) | wc -l', { encoding: 'utf8' }).trim()) || 0;
      } else {
        fileCount = parseInt(execSync('find . -type f | wc -l', { encoding: 'utf8' }).trim()) || 0;
      }
    } catch (e) {
      // Ignore file count errors
    }
    
    process.chdir(__dirname);
    
    return {
      exists: true,
      name: repo.name,
      commitHash,
      commitDate,
      fileCount,
      path: repo.dir
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

function getAllRepositoriesInfo() {
  const info = {};
  for (const key of Object.keys(AOSP_REPOS)) {
    info[key] = getRepositoryInfo(key);
  }
  return info;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';
  
  if (!checkGitInstalled()) {
    console.error('❌ Git is not installed. Please install Git first.');
    process.exit(1);
  }
  
  switch (command) {
    case 'setup':
    case 'clone':
      const repoKey = args[1] || 'frameworks-base';
      const fullHistory = args.includes('--full-history') || args.includes('--full');
      
      // Check if cloning all repositories
      if (repoKey === 'all' || repoKey === '*') {
        cloneAllRepositories(fullHistory);
        break;
      }
      
      // Clone specific repository
      const repo = AOSP_REPOS[repoKey];
      if (!repo) {
        console.error(`❌ Unknown repository: ${repoKey}`);
        console.error(`\nAvailable repositories:`);
        for (const [key, r] of Object.entries(AOSP_REPOS)) {
          console.error(`   ${key}: ${r.description}`);
        }
        console.error(`\nOr use 'all' to clone all repositories`);
        process.exit(1);
      }
      
      if (fs.existsSync(repo.dir)) {
        const overwrite = args.includes('--force') || args.includes('-f');
        if (!overwrite) {
          console.log(`⚠️  Repository ${repo.name} already exists`);
          console.log('   Use --force to re-clone');
          process.exit(0);
        }
        console.log(`🗑️  Removing existing repository: ${repo.name}...`);
        fs.rmSync(repo.dir, { recursive: true, force: true });
      }
      
      cloneRepository(repoKey, fullHistory);
      break;
      
    case 'update':
      updateRepository();
      break;
      
    case 'status':
      const statusRepo = args[1];
      checkRepositoryStatus(statusRepo);
      const allInfo = getAllRepositoriesInfo();
      
      console.log('📊 Repository Statistics:');
      for (const [key, info] of Object.entries(allInfo)) {
        if (info && info.exists) {
          const repo = AOSP_REPOS[key];
          console.log(`\n${repo.name}:`);
          console.log(`   Files: ${info.fileCount.toLocaleString()}`);
          console.log(`   Commit: ${info.commitHash.substring(0, 12)}`);
          console.log(`   Date: ${info.commitDate}`);
        }
      }
      break;
      
    case 'info':
      const infoRepo = args[1] || 'frameworks-base';
      const repoInfo = getRepositoryInfo(infoRepo);
      if (repoInfo && repoInfo.exists) {
        console.log(JSON.stringify(repoInfo, null, 2));
      } else {
        console.log(`Repository ${infoRepo} not found`);
      }
      break;
      
    case 'remove':
      const removeRepo = args[1] || 'frameworks-base';
      
      if (removeRepo === 'all' || removeRepo === '*') {
        // Remove all repositories
        let removed = 0;
        for (const [key, repo] of Object.entries(AOSP_REPOS)) {
          if (fs.existsSync(repo.dir)) {
            console.log(`🗑️  Removing ${repo.name}...`);
            fs.rmSync(repo.dir, { recursive: true, force: true });
            removed++;
          }
        }
        console.log(`✅ Removed ${removed} repository(ies)`);
        
        // Remove base directory if empty
        try {
          if (fs.existsSync(AOSP_REPO_BASE_DIR)) {
            const remaining = fs.readdirSync(AOSP_REPO_BASE_DIR);
            if (remaining.length === 0) {
              fs.rmdirSync(AOSP_REPO_BASE_DIR);
              console.log('✅ Base directory removed (was empty)');
            }
          }
        } catch (e) {
          // Ignore errors
        }
      } else {
        // Remove specific repository
        const repo = AOSP_REPOS[removeRepo];
        if (!repo) {
          console.error(`❌ Unknown repository: ${removeRepo}`);
          console.error(`   Available: ${Object.keys(AOSP_REPOS).join(', ')}`);
          process.exit(1);
        }
        
        if (fs.existsSync(repo.dir)) {
          console.log(`🗑️  Removing ${repo.name}...`);
          fs.rmSync(repo.dir, { recursive: true, force: true });
          console.log(`✅ ${repo.name} removed`);
        } else {
          console.log(`❌ Repository ${repo.name} not found`);
        }
      }
      break;
      
    default:
      console.log(`
Usage: node tools/setup-aosp-repo.js <command> [repository] [options]

Commands:
  setup, clone [repo]    Clone AOSP repository(ies)
  update [repo]          Update existing repository to latest tag
  status [repo]          Check repository status and statistics
  info [repo]            Show detailed repository information (JSON)
  remove [repo]          Remove the local repository(ies)

Repositories:
  frameworks-base        AOSP frameworks/base (Java framework, system services)
  frameworks-native     AOSP frameworks/native (Native libraries, Binder, SurfaceFlinger)
  packages-services-car  AOSP packages/services/Car (Android Automotive OS)
  all                   All repositories (for setup/remove commands)

Options:
  --force, -f           Force re-clone (removes existing repository)
  --full-history, --full  Clone with complete Git history (slower, larger)

Examples:
  # Clone frameworks/base (default)
  node tools/setup-aosp-repo.js setup
  
  # Clone specific repository with full history
  node tools/setup-aosp-repo.js setup frameworks-native --full-history
  
  # Clone all repositories
  node tools/setup-aosp-repo.js setup all --full-history
  
  # Check status of all repositories
  node tools/setup-aosp-repo.js status
  
  # Check status of specific repository
  node tools/setup-aosp-repo.js status frameworks-native
  
  # Remove specific repository
  node tools/setup-aosp-repo.js remove frameworks-native
  
  # Remove all repositories
  node tools/setup-aosp-repo.js remove all
`);
  }
}

// Export for use in other modules
module.exports = {
  AOSP_REPO_BASE_DIR,
  AOSP_REPO_DIR,
  AOSP_REPOS,
  checkRepositoryStatus,
  getRepositoryInfo,
  getAllRepositoriesInfo
};

if (require.main === module) {
  main();
}

