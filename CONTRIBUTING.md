# Contributing to GLM Statusline

Thank you for your interest in contributing to GLM Statusline! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive community.

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node.js version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing feature requests
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach (if known)

### Submitting Code Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/glm-statusline.git
cd glm-statusline

# The script has no external dependencies
# Test locally
npm test
```

## Coding Standards

### Code Style

- Use clear, descriptive variable and function names
- Follow existing code formatting
- Add comments for complex logic
- Use ES6+ features when appropriate

### Variable Naming

- Use `camelCase` for variables and functions
- Use `UPPER_SNAKE_CASE` for constants
- Be descriptive: `quotaPercent` instead of `qp`

### Function Structure

- Keep functions focused and small
- Use meaningful parameter names
- Return early when possible

Example:

```javascript
// Good
async function fetchQuotaDataFromApi(apiConfig) {
  if (!apiConfig) {
    return { quotaPercent: 0 };
  }
  // ... implementation
}

// Avoid
async function fetch(q) {
  // ... implementation
}
```

## Testing

Test your changes with the included test script:

```bash
npm test
```

Manual testing:

```bash
echo '{"context_window":{"used_percentage":75}}' | node statusline-command.js
```

Test with different scenarios:
- Low quota (< 70%)
- Medium quota (70-89%)
- High quota (≥ 90%)
- Missing API credentials
- Network errors

## Submitting Changes

### Pull Request Checklist

- [ ] Code follows project standards
- [ ] Changes are tested locally
- [ ] Documentation is updated (if needed)
- [ ] Commit messages are clear and descriptive
- [ ] Only one feature/fix per PR

### Commit Message Format

```
type(scope): description

# Examples:
feat(api): add support for new GLM endpoint
fix(display): correct git branch parsing
docs(readme): update installation instructions
refactor(variable): rename tokenPercent to quotaPercent
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Project Structure

```
glm-statusline/
├── statusline-command.js    # Main statusline script
├── install.js               # Installation script
├── package.json             # NPM package configuration
├── README.md                # Project documentation
├── CONTRIBUTING.md          # This file
├── LICENSE                  # MIT License
└── .gitignore              # Git ignore rules
```

## Getting Help

- Open an issue for bugs or feature requests
- Check existing documentation
- Review similar issues for solutions

## Recognition

Contributors will be acknowledged in the project README.

Thank you for contributing to GLM Statusline! 🎉
