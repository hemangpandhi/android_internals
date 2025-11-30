# GitHub Actions Workflows Explanation

## Current Situation: Two Pipelines Running

When you push to `master`, you see **two workflows** running:

### 1. **"Deploy Website and Admin Panel to GitHub Pages"** ✅ (Your Custom Workflow)
- **Purpose**: Your custom workflow that builds and deploys the site
- **What it does**:
  - Installs Node.js dependencies
  - Creates `config.js` from GitHub Secrets
  - Builds the website using `node tools/build.js`
  - Builds admin interface
  - Deploys to GitHub Pages using `actions/deploy-pages@v4`
- **Status**: ✅ **This is the one you need!**

### 2. **"pages build and deployment"** ⚠️ (GitHub's Automatic Build)
- **Purpose**: GitHub's automatic Pages build
- **What it does**:
  - Automatically runs when GitHub Pages is enabled
  - Tries to build from the source branch
  - **Problem**: This is redundant since your custom workflow already handles deployment
- **Status**: ⚠️ **This is redundant and can be disabled**

## Why Both Are Running?

GitHub Pages has two deployment methods:
1. **Automatic build** (from source branch) - This is what triggers "pages build and deployment"
2. **GitHub Actions** (custom workflow) - This is your "Deploy Website and Admin Panel to GitHub Pages"

When both are enabled, both run, which is redundant.

## Solution: Disable Automatic Pages Build

Since your custom workflow handles everything (including building and deploying), you should **disable the automatic Pages build** to avoid redundancy.

### How to Disable Automatic Pages Build:

1. Go to your repository: https://github.com/hemangpandhi/android_internals
2. Click **Settings** → **Pages**
3. Under **Build and deployment**:
   - Change **Source** from "Deploy from a branch" to **"GitHub Actions"**
   - OR keep "Deploy from a branch" but make sure it's set to a branch that won't trigger builds (like a non-existent branch)

### Recommended Configuration:

**Source**: `GitHub Actions` (this tells GitHub to only use your custom workflow)

This will:
- ✅ Keep your custom workflow running (the one that builds properly)
- ✅ Disable the automatic "pages build and deployment"
- ✅ Reduce build time and resource usage
- ✅ Avoid confusion about which build is actually deploying

## Current Workflow Details

Your custom workflow (`.github/workflows/deploy.yml`):
- ✅ Builds the site correctly with all dependencies
- ✅ Creates `config.js` from GitHub Secrets
- ✅ Generates all articles and pages
- ✅ Deploys to GitHub Pages properly

The automatic build:
- ⚠️ Doesn't have your build process
- ⚠️ Doesn't create `config.js` from secrets
- ⚠️ May not build correctly
- ⚠️ Is redundant

## Recommendation

**Disable the automatic Pages build** and rely only on your custom GitHub Actions workflow. This is the standard practice for custom-built static sites.

