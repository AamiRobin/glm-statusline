# GLM Statusline for Claude Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-windows%20%7C%20macos%20%7C%20linux-lightgrey)](https://github.com/AamiRobin/glm-statusline)

A beautiful, feature-rich statusline for **Claude Code** that displays real-time quota, context usage, and reset information from the **GLM API** (api.z.ai).

## ✨ Features

- 📊 **Real-time Quota Monitoring** - Shows current token quota usage from GLM API
- 🔄 **Context Usage** - Displays current context window usage percentage
- ⏰ **Reset Timer** - Shows time until quota resets (e.g., "4h 30m")
- 🔧 **MCP Usage** - Displays Model Context Protocol usage percentage
- 🌿 **Git Integration** - Shows current directory and git branch
- 🎨 **Colored Progress Bars** - Visual indicators with smart color coding (green/yellow/red)
- 💾 **Smart Caching** - Reduces API calls with 60-second cache (15s on errors)
- ⚡ **Zero Dependencies** - No external npm packages required
- 🚀 **Fast Performance** - Built for speed with Bun or Node.js

## 📸 Preview

```
📁 Tickits-Bot | git:(main) | CTX: █████░░░░░ 45% | Quota: █░░░░░░░░ 14% | Reset: 3h 56m | MCP: 58%
```

### What Each Component Means

| Component | Description | Example |
|-----------|-------------|---------|
| 📁 Tickits-Bot | Current working directory name | `my-project` |
| git:(main) | Current git branch | `git:(develop)` |
| CTX: 45% | Context window usage | `CTX: █████░░░░░ 45%` |
| Quota: 14% | GLM API quota usage | `Quota: ██░░░░░░░░ 14%` |
| Reset: 3h 56m | Time until quota resets | `Reset: 4h 30m` |
| MCP: 58% | Model Context Protocol usage | `MCP: 25%` |

### Color Coding

- 🟢 **Green** (< 70% usage) - Healthy
- 🟡 **Yellow** (70-89% usage) - Warning
- 🔴 **Red** (≥ 90% usage) - Critical

## 🔧 How It Works

1. **Reads Session Context**: The statusline receives session data from Claude Code via stdin
2. **Fetches API Data**: Makes HTTPS requests to GLM API monitoring endpoints
3. **Caches Results**: Stores data for 60 seconds to reduce API calls
4. **Formats Output**: Creates a beautiful, colorized statusline display

### Architecture

```
Claude Code → statusline-command.js → GLM API
                ↓                    ↓
           Reads Context        Fetches Quota
                ↓                    ↓
            Formats Output ← Returns Data
                ↓
         Displays in Terminal
```

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) or [Bun](https://bun.sh/) installed
- Claude Code CLI
- GLM API credentials (api.z.ai, open.bigmodel.cn, or dev.bigmodel.cn)

## Installation

### Option 1: Clone the Repository

```bash
git clone https://github.com/AamiRobin/glm-statusline.git
cd glm-statusline
npm install
```

### Option 2: Download Script Only

1. Download `statusline-command.js` to your `.claude` directory:
```bash
curl -o ~/.claude/statusline-command.js https://raw.githubusercontent.com/AamiRobin/glm-statusline/main/statusline-command.js
# On Windows
curl -o %USERPROFILE%\.claude\statusline-command.js https://raw.githubusercontent.com/AamiRobin/glm-statusline/main/statusline-command.js
```

### Option 3: Using Bun (Recommended for Windows)

```bash
bun add -g glm-statusline
```

## Configuration

1. Edit your Claude Code settings file (`~/.claude/settings.json` or `%USERPROFILE%\.claude\settings.json`):

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "your-api-token-here"
  },
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/statusline-command.js"
  }
}
```

2. For Bun (faster on Windows):
```json
{
  "statusLine": {
    "type": "command",
    "command": "bun ~/.claude/statusline-command.js"
  }
}
```

3. Restart Claude Code

## Supported Domains

- `api.z.ai`
- `open.bigmodel.cn`
- `dev.bigmodel.cn`

## Statusline Components

| Component | Description |
|-----------|-------------|
| 📁 Directory | Current working directory name |
| git:(branch) | Current git branch (if in a git repo) |
| CTX | Context window usage percentage |
| Quota | GLM API quota usage percentage |
| Reset | Time until quota resets |
| MCP | Model Context Protocol usage |

## Cache Behavior

- Normal cache duration: 60 seconds
- Error retry duration: 15 seconds
- Cache location: `~/.claude/zai-usage-cache.json`

## Troubleshooting

### Statusline shows "Setup required"

Make sure your `settings.json` contains both `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN`.

### Statusline shows "Loading..."

The API is being contacted. This should resolve within a few seconds.

### Quota shows 0%

Check that:
- Your API token is valid
- The base URL is correct
- You have network connectivity to the GLM API

## Development

```bash
# Clone the repository
git clone https://github.com/AamiRobin/glm-statusline.git
cd glm-statusline

# Test locally
echo '{"context_window":{"used_percentage":45}}' | node statusline-command.js
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for use with Claude Code
- Uses GLM API endpoints for quota monitoring
- Inspired by other developer tool statuslines

## Support

If you encounter any issues or have questions, please:
- Open an issue on GitHub
- Check existing issues for solutions
- Read the troubleshooting guide above

## Changelog

### v1.0.0 (Initial Release)
- Real-time quota monitoring from GLM API
- Context usage display
- Git branch integration
- Smart caching system
- Colored progress bars
- Support for multiple GLM domains

---

Made with ❤️ for the Claude Code community
