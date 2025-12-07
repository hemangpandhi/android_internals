#!/usr/bin/env python3
"""
Android Internals - Build System
Python-based static site generator for daily article publishing
"""

import os
import sys
import json
import re
import shutil
from datetime import datetime
from pathlib import Path

class MarkdownConverter:
    """Convert Markdown to HTML"""
    
    @staticmethod
    def convert(markdown_text):
        """Convert markdown to HTML"""
        html = markdown_text
        
        # Headers
        html = re.sub(r'^### (.*$)', r'<h3>\1</h3>', html, flags=re.MULTILINE)
        html = re.sub(r'^## (.*$)', r'<h2>\1</h2>', html, flags=re.MULTILINE)
        html = re.sub(r'^# (.*$)', r'<h1>\1</h1>', html, flags=re.MULTILINE)
        
        # Bold and italic
        html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
        html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
        
        # Code blocks
        html = re.sub(r'```(\w+)?\n(.*?)```', r'<div class="code-example"><pre><code>\2</code></pre></div>', html, flags=re.DOTALL)
        html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)
        
        # Links
        html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html)
        
        # Lists
        html = re.sub(r'^\* (.*$)', r'<li>\1</li>', html, flags=re.MULTILINE)
        html = re.sub(r'^- (.*$)', r'<li>\1</li>', html, flags=re.MULTILINE)
        
        # Wrap lists in ul tags
        html = re.sub(r'(<li>.*</li>)', r'<ul>\1</ul>', html, flags=re.DOTALL)
        
        # Paragraphs
        html = re.sub(r'\n\n', '</p><p>', html)
        html = re.sub(r'^(.+)$', r'<p>\1</p>', html, flags=re.MULTILINE)
        
        # Clean up empty paragraphs
        html = re.sub(r'<p></p>', '', html)
        html = re.sub(r'<p>(<h[1-6]>.*</h[1-6]>)</p>', r'\1', html)
        html = re.sub(r'<p>(<div.*</div>)</p>', r'\1', html)
        
        return html

class FrontMatterParser:
    """Parse front matter from markdown files"""
    
    @staticmethod
    def parse(content):
        """Parse front matter and return metadata"""
        front_matter_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
        if not front_matter_match:
            return {}
        
        front_matter = front_matter_match.group(1)
        result = {}
        
        for line in front_matter.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()
                
                # Remove quotes if present
                if (value.startswith('"') and value.endswith('"')) or \
                   (value.startswith("'") and value.endswith("'")):
                    value = value[1:-1]
                
                # Parse arrays
                if value.startswith('[') and value.endswith(']'):
                    value = [v.strip().replace('"', '') for v in value[1:-1].split(',')]
                
                result[key] = value
        
        return result

class BuildSystem:
    """Main build system"""
    
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.content_dir = self.base_dir / 'content'
        self.build_dir = self.base_dir / 'build'
        self.templates_dir = self.base_dir / 'templates'
        
    def build_articles(self):
        """Build all articles from markdown"""
        print('📚 Building articles...')
        
        articles_dir = self.content_dir / 'articles'
        build_articles_dir = self.build_dir / 'articles'
        
        # Create build directory
        build_articles_dir.mkdir(parents=True, exist_ok=True)
        
        if not articles_dir.exists():
            print('⚠️  No articles directory found. Creating...')
            articles_dir.mkdir(parents=True, exist_ok=True)
            return []
        
        articles = []
        
        for md_file in articles_dir.glob('*.md'):
            content = md_file.read_text(encoding='utf-8')
            front_matter = FrontMatterParser.parse(content)
            markdown_content = re.sub(r'---[\s\S]*?---', '', content).strip()
            html = MarkdownConverter.convert(markdown_content)
            
            article = {
                **front_matter,
                'html': html,
                'slug': md_file.stem,
                'filename': md_file.name
            }
            articles.append(article)
        
        # Sort by date
        articles.sort(key=lambda x: x.get('date', ''), reverse=True)
        
        print(f'✅ Found {len(articles)} articles')
        return articles
    
    def generate_article_pages(self, articles):
        """Generate HTML pages for articles"""
        print('📄 Generating article pages...')
        
        template_path = self.templates_dir / 'article.html'
        if not template_path.exists():
            print('⚠️  Article template not found. Creating basic template...')
            self.create_basic_template()
            template_path = self.templates_dir / 'article.html'
        
        template = template_path.read_text(encoding='utf-8')
        
        for article in articles:
            article_html = template
            article_html = article_html.replace('{{title}}', article.get('title', ''))
            article_html = article_html.replace('{{description}}', article.get('description', ''))
            article_html = article_html.replace('{{author}}', article.get('author', 'Android Internals Team'))
            article_html = article_html.replace('{{date}}', article.get('date', ''))
            article_html = article_html.replace('{{category}}', article.get('category', 'Android Internals'))
            article_html = article_html.replace('{{content}}', article.get('html', ''))
            article_html = article_html.replace('{{slug}}', article.get('slug', ''))
            
            output_path = self.build_dir / 'articles' / f"{article['slug']}.html"
            output_path.write_text(article_html, encoding='utf-8')
            print(f'  ✅ Generated: {article["slug"]}.html')
    
    def update_index_page(self, articles):
        """Update the main index page with latest articles"""
        print('🏠 Updating index page...')
        
        index_path = self.base_dir / 'index.html'
        if not index_path.exists():
            print('⚠️  index.html not found')
            return
        
        index_template = index_path.read_text(encoding='utf-8')
        
        # Generate articles list for homepage
        articles_list = []
        for article in articles[:6]:  # Show latest 6 articles
            article_html = f'''
      <div class="blog-card">
        <div class="blog-image">
          <div class="blog-placeholder">📱</div>
        </div>
        <div class="blog-content">
          <h3><a href="/articles/{article["slug"]}.html">{article.get("title", "")}</a></h3>
          <p>{article.get("description", "Read more about Android internals...")}</p>
          <div class="blog-meta">
            <span class="blog-date">{article.get("date", "")}</span>
            <span class="blog-category">{article.get("category", "Android Internals")}</span>
          </div>
        </div>
      </div>'''
            articles_list.append(article_html)
        
        articles_html = '\n'.join(articles_list)
        
        # Replace the blogs grid section
        pattern = r'<div class="blogs-grid">[\s\S]*?</div>'
        replacement = f'<div class="blogs-grid">{articles_html}\n    </div>'
        
        updated_index = re.sub(pattern, replacement, index_template)
        
        output_path = self.build_dir / 'index.html'
        output_path.write_text(updated_index, encoding='utf-8')
        print('  ✅ Updated index.html')
    
    def copy_assets(self):
        """Copy static assets to build directory"""
        print('📁 Copying assets...')
        
        # Files to copy
        files_to_copy = [
            'styles.css',
            'scripts.js',
            'android_logo.PNG',
            'manifest.json',
            'sw.js',
            'robots.txt',
            'sitemap.xml'
        ]
        
        for file_name in files_to_copy:
            source = self.base_dir / file_name
            dest = self.build_dir / file_name
            
            if source.exists():
                shutil.copy2(source, dest)
                print(f'  ✅ Copied: {file_name}')
        
        # Copy subpages
        subpages = [
            'hal.html', 'framework.html', 'adb.html', 'emulator.html',
            'os-internals.html', 'android-app.html', 'system-app.html',
            'best-practices.html', 'system-performance.html',
            'android-commands.html', 'other-internals.html', 'books.html'
        ]
        
        for file_name in subpages:
            source = self.base_dir / file_name
            dest = self.build_dir / file_name
            
            if source.exists():
                shutil.copy2(source, dest)
                print(f'  ✅ Copied: {file_name}')
    
    def generate_sitemap(self, articles):
        """Generate sitemap.xml"""
        print('🗺️  Generating sitemap...')
        
        base_url = 'https://www.hemangpandhi.com'
        today = datetime.now().strftime('%Y-%m-%d')
        
        sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{base_url}/</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>{base_url}/books.html</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>'''
        
        # Add article URLs
        for article in articles:
            sitemap += f'''
  <url>
    <loc>{base_url}/articles/{article["slug"]}.html</loc>
    <lastmod>{article.get("date", today)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>'''
        
        sitemap += '''
</urlset>'''
        
        sitemap_path = self.build_dir / 'sitemap.xml'
        sitemap_path.write_text(sitemap, encoding='utf-8')
        print('  ✅ Generated sitemap.xml')
    
    def create_basic_template(self):
        """Create a basic article template if none exists"""
        template = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - Android Internals</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <nav class="main-nav">
    <div class="nav-container">
      <a href="../index.html" class="nav-logo-link">
        <img src="../android_logo.PNG" alt="Android Internals Logo" class="nav-logo" />
      </a>
      <div class="nav-links">
        <a href="../index.html" class="nav-link">Home</a>
        <a href="../index.html#topics" class="nav-link">Topics</a>
        <a href="../index.html#blogs" class="nav-link">Blogs</a>
        <a href="../index.html#about" class="nav-link">About</a>
        <a href="../books.html" class="nav-link">Books</a>
      </div>
    </div>
  </nav>

  <main class="article-content">
    <div class="container">
      <article class="article-body">
        <h1>{{title}}</h1>
        <div class="article-meta">
          <span class="article-date">{{date}}</span>
          <span class="article-category">{{category}}</span>
        </div>
        {{content}}
      </article>
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <p>&copy; 2024 Android Internals. Built with ❤️ for the Android community.</p>
    </div>
  </footer>

  <script src="../scripts.js"></script>
</body>
</html>'''
        
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        template_path = self.templates_dir / 'article.html'
        template_path.write_text(template, encoding='utf-8')
    
    def build(self):
        """Main build function"""
        print('🚀 Starting build process...')
        
        # Clean build directory
        if self.build_dir.exists():
            shutil.rmtree(self.build_dir)
        self.build_dir.mkdir(parents=True)
        
        # Build process
        articles = self.build_articles()
        self.generate_article_pages(articles)
        self.update_index_page(articles)
        self.copy_assets()
        self.generate_sitemap(articles)
        
        print('\n🎉 Build completed successfully!')
        print(f'📊 Generated {len(articles)} articles')
        print(f'📁 Build output: {self.build_dir}')
        print('\n🌐 To preview: cd build && python3 -m http.server 8000')

def main():
    """Main function"""
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print('''
Android Internals Build System

Usage:
  python3 tools/build.py          # Build the entire website
  python3 tools/build.py --help   # Show this help

The build system will:
1. Convert markdown articles to HTML
2. Update the homepage with latest articles
3. Copy all assets to the build directory
4. Generate sitemap.xml
5. Create a production-ready static site

Output will be in the build/ directory.
        ''')
        return
    
    build_system = BuildSystem()
    build_system.build()

if __name__ == '__main__':
    main() 