# Android Internals Website

A comprehensive website dedicated to Android system internals, debugging, and development resources.

## 🚀 Features

- **Comprehensive ADB Guide**: Complete encyclopedia of ADB commands and Android debugging
- **Interactive Forms**: Contact form and newsletter subscription with EmailJS integration
- **Responsive Design**: Modern, mobile-friendly interface
- **Static Site Generation**: Fast, SEO-optimized static website
- **Automated Deployment**: GitHub Actions for continuous deployment

## 📚 Content

### Articles
- **The Ultimate Encyclopedia of ADB, Dumpsys & Android Internals**: Complete guide covering:
  - ADB fundamentals and device management
  - App and file management
  - Logging and debugging techniques
  - Advanced internals and native debugging
  - Android Automotive commands
  - Dumpsys encyclopedia
  - Automation and UI testing

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Email Service**: EmailJS for contact forms and newsletters
- **Build System**: Custom Node.js build script
- **Deployment**: GitHub Pages with GitHub Actions
- **Styling**: Custom CSS with responsive design
- **Icons**: SVG icons and Android branding

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Git

### Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/android-internals.git
cd android-internals

# Install dependencies
npm install

# Copy configuration template
cp config.example.js config.js

# Edit config.js with your EmailJS credentials
# (Use test values for development)

# Build the website
npm run build

# Serve locally
npm run serve
```

### Production Deployment
1. Set up GitHub Secrets (see [Deployment Guide](docs/deployment/DEPLOYMENT.md))
2. Push to main branch
3. GitHub Actions will automatically build and deploy

## 📁 Project Structure

```
android-internals/
├── content/                 # Content management
│   ├── articles/           # Markdown articles
│   └── data/              # Article metadata
├── templates/              # HTML templates
├── tools/                  # Build and utility scripts
├── docs/                   # Documentation
│   ├── deployment/        # Deployment guides
│   ├── development/       # Development guides
│   └── guides/           # User guides
├── .github/               # GitHub Actions workflows
├── build/                 # Generated static files (not in repo)
└── assets/               # Static assets (CSS, JS, images)
```

## 🔧 Configuration

### EmailJS Setup
The website uses EmailJS for contact forms and newsletters. Configure in `config.js`:

```javascript
window.EMAILJS_CONFIG = {
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
  serviceId: 'YOUR_EMAILJS_SERVICE_ID',
  newsletterTemplate: 'YOUR_NEWSLETTER_TEMPLATE_ID',
  contactTemplate: 'YOUR_CONTACT_TEMPLATE_ID',
  // ... other settings
};
```

### Environment Variables
For production, set these GitHub Secrets:
- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_SERVICE_ID`
- `EMAILJS_NEWSLETTER_TEMPLATE`
- `EMAILJS_CONTACT_TEMPLATE`
- `SITE_DOMAIN`
- `NEWSLETTER_FROM_EMAIL`

## 📖 Documentation

- **[Deployment Guide](docs/deployment/DEPLOYMENT.md)**: Complete deployment instructions
- **[Development Guide](docs/development/content-structure.md)**: Content management and development
- **[Security Guide](docs/deployment/clean-for-github.sh)**: Security best practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

### Adding New Articles
```bash
# Use the article creation tool
node tools/new-article.js "Your Article Title"
```

## 🔒 Security

- No sensitive data in source code
- API keys stored as GitHub Secrets
- Environment variables for configuration
- Secure deployment pipeline

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Android Debug Bridge (ADB) documentation
- EmailJS for email functionality
- GitHub Pages for hosting
- The Android developer community

## 📞 Contact

- **Website**: [Android Internals](https://www.hemangpandhi.com)
- **Email**: Contact via the website's contact form
- **GitHub**: [Repository](https://github.com/your-username/android-internals)

---

**Built with ❤️ for the Android developer community**
