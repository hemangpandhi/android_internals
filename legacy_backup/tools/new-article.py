#!/usr/bin/env python3
"""
Android Internals - Article Creator
Create new articles with proper front matter and structure
"""

import sys
import os
from datetime import datetime
from pathlib import Path
import re

def create_slug(title):
    """Create URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')

def create_article(title):
    """Create a new article with the given title"""
    if not title:
        print("❌ Error: Please provide an article title")
        print("Usage: python3 tools/new-article.py 'Your Article Title'")
        return
    
    # Create slug and filename
    slug = create_slug(title)
    today = datetime.now().strftime('%Y-%m-%d')
    filename = f"{today}-{slug}.md"
    
    # Setup paths
    base_dir = Path(__file__).parent.parent
    articles_dir = base_dir / 'content' / 'articles'
    filepath = articles_dir / filename
    
    # Create directories if they don't exist
    articles_dir.mkdir(parents=True, exist_ok=True)
    
    # Article template
    article_template = f'''---
title: "{title}"
description: "Add a compelling description for this article here."
author: "Android Internals Team"
date: "{today}"
category: "System Architecture"
tags: ["android", "internals", "development"]
image: ""
featured: false
---

# {title}

## Introduction

Start your article with an engaging introduction that explains what readers will learn...

## Main Content

### Section 1

Add your main content here...

### Section 2

Continue with more sections...

## Code Examples

```bash
# Add relevant code examples
adb shell command
```

## Conclusion

Wrap up your article with key takeaways...

---
*Published on {datetime.now().strftime('%B %d, %Y')}*
'''
    
    # Write the article file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(article_template)
    
    print(f"✅ Created new article: {filename}")
    print(f"📝 Edit the file at: {filepath}")
    print(f"🌐 Article will be available at: /articles/{slug}.html")
    print(f"\n📋 Next steps:")
    print(f"1. Edit the article content")
    print(f"2. Run: python3 tools/build.py")
    print(f"3. Preview: cd build && python3 -m http.server 8000")

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("❌ Error: Please provide an article title")
        print("Usage: python3 tools/new-article.py 'Your Article Title'")
        return
    
    title = sys.argv[1]
    create_article(title)

if __name__ == '__main__':
    main() 