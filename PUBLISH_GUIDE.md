# GitHub Publishing Guide

This guide will help you publish the GLM Statusline project to GitHub.

## 📦 Project Structure

Your project is ready with the following structure:

```
glm-statusline/
├── .github/
│   └── workflows/
│       ├── test.yml          # CI/CD testing workflow
│       └── release.yml       # Automated releases
├── statusline-command.js      # Main statusline script
├── install.js                 # Installation script
├── package.json               # NPM package configuration
├── README.md                  # Main documentation
├── QUICKSTART.md              # Quick start guide
├── CONTRIBUTING.md            # Contribution guidelines
├── LICENSE                    # MIT License
└── .gitignore                 # Git ignore rules
```

## 🚀 Steps to Publish

### 1. Create a New GitHub Repository

1. Go to https://github.com/new
2. Repository name: `glm-statusline`
3. Description: `A beautiful statusline for Claude Code with real-time GLM API quota monitoring`
4. Set to **Public**
5. Don't initialize with README (we have one)
6. Click **Create repository**

### 2. Update Package.json

Before publishing, update these fields in `package.json`:

```json
{
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "url": "git+https://github.com/YOUR_USERNAME/glm-statusline.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/glm-statusline/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/glm-statusline#readme"
}
```

### 3. Update README.md Badges

Replace `your-username` with your actual GitHub username in README.md:

```markdown
[![npm version](https://badge.fury.io/js/glm-statusline.svg)](https://www.npmjs.com/package/glm-statusline)
```

And in the repository URLs:

```markdown
- "url": "git+https://github.com/YOUR_USERNAME/glm-statusline.git"
```

### 4. Initialize Git and Push

```bash
cd glm-statusline

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial release of GLM Statusline v1.0.0

- Real-time quota monitoring from GLM API
- Context usage display
- Git branch integration
- Smart caching system
- Colored progress bars
- Support for multiple GLM domains"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/glm-statusline.git

# Push to GitHub
git push -u origin main
```

### 5. Create GitHub Release

1. Go to your repository on GitHub
2. Click **Releases** → **Create a new release**
3. Tag version: `v1.0.0`
4. Release title: `v1.0.0 - Initial Release`
5. Description:

```markdown
## 🎉 Initial Release of GLM Statusline

This is the first stable release of GLM Statusline for Claude Code.

### Features
- ✨ Real-time quota monitoring from GLM API
- 📊 Context usage display
- ⏰ Reset timer
- 🌿 Git integration
- 🎨 Colored progress bars
- 💾 Smart caching

### Installation

```bash
npm install -g glm-statusline
```

See [README.md](https://github.com/YOUR_USERNAME/glm-statusline#readme) for details.

### What's Changed

Full Changelog: https://github.com/YOUR_USERNAME/glm-statusline/compare/v1.0.0...v1.0.0
```

6. Check **Set as the latest release**
7. Click **Publish release**

### 6. Publish to NPM (Optional)

If you want to publish to NPM:

```bash
# Login to NPM
npm login

# Publish
npm publish
```

## 📝 Post-Publish Checklist

- [ ] Repository created on GitHub
- [ ] Code pushed to main branch
- [ ] GitHub release created
- [ ] README.md badges link correctly
- [ ] package.json has correct author info
- [ ] LICENSE has your name
- [ ] CI/CD tests are passing
- [ ] Topics/tags added to GitHub repo

## 🏷️ GitHub Topics

Add these topics to your GitHub repository:

```
claude-code, statusline, glm-api, quota-monitor, cli, developer-tools, nodejs, javascript, typescript, api-monitoring
```

## 📢 Promotion

Share your project with the Claude Code community:

1. **Claude Code Discord/Slack**: Share in relevant channels
2. **Reddit**: Post in r/ClaudeAI or relevant subreddits
3. **Twitter/X**: Post with hashtag #ClaudeCode
4. **Dev.to**: Write a blog post about it

Example tweet:

```
🎉 Just released GLM Statusline for Claude Code!

A beautiful statusline that shows:
- Real-time quota usage
- Context percentage
- Reset timer
- Git branch

Get it here: https://github.com/YOUR_USERNAME/glm-statusline

#ClaudeCode #DeveloperTools
```

## 🐛 Next Steps

After publishing:

1. **Monitor Issues**: Respond to user questions and bug reports
2. **Iterate**: Make improvements based on feedback
3. **Document**: Add more examples and use cases
4. **Test**: Test on different platforms and Node.js versions

## 📚 Resources

- [GitHub Creating a Release](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/releasing-projects-on-github)
- [NPM Publishing](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Writing a Great README](https://www.makeareadme.com/)

---

Good luck with your release! 🚀
