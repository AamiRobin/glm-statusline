# Quick Start Guide

Get GLM Statusline up and running in under 2 minutes!

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js (v14+) or Bun installed
- [ ] Claude Code CLI installed
- [ ] GLM API credentials (api.z.ai or compatible)

## Installation (Choose One)

### Option 1: NPM Installation (Recommended)

```bash
npm install -g glm-statusline
glm-statusline-install
```

### Option 2: Manual Installation

```bash
# Clone the repository
git clone https://github.com/your-username/glm-statusline.git
cd glm-statusline

# Run the installer
npm install
node install.js
```

### Option 3: Quick Copy (Linux/Mac)

```bash
curl -o ~/.claude/statusline-command.js https://raw.githubusercontent.com/your-username/glm-statusline/main/statusline-command.js
```

### Option 4: Quick Copy (Windows)

```powershell
curl -o %USERPROFILE%\.claude\statusline-command.js https://raw.githubusercontent.com/your-username/glm-statusline/main/statusline-command.js
```

## Configuration

### Step 1: Add API Credentials

Edit your Claude Code settings file:

**Linux/Mac:** `~/.claude/settings.json`
**Windows:** `%USERPROFILE%\.claude\settings.json`

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "your-api-token-here"
  }
}
```

### Step 2: Enable Statusline

The installer should have automatically added the statusline configuration. If not, add this to your `settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/statusline-command.js"
  }
}
```

For Windows with Bun (faster):
```json
{
  "statusLine": {
    "type": "command",
    "command": "bun ~/.claude/statusline-command.js"
  }
}
```

### Step 3: Restart Claude Code

Close and restart Claude Code to see the statusline.

## Verify Installation

You should see a statusline at the bottom of your terminal like:

```
📁 my-project | git:(main) | CTX: █████░░░░░ 45% | Quota: ██░░░░░░░░ 20% | Reset: 4h 30m | MCP: 15%
```

## Troubleshooting

### Statusline not appearing?

1. **Check settings.json location:**
   ```bash
   # Linux/Mac
   cat ~/.claude/settings.json

   # Windows
   type %USERPROFILE%\.claude\settings.json
   ```

2. **Verify script exists:**
   ```bash
   # Linux/Mac
   ls -la ~/.claude/statusline-command.js

   # Windows
   dir %USERPROFILE%\.claude\statusline-command.js
   ```

3. **Test manually:**
   ```bash
   echo '{"context_window":{"used_percentage":50}}' | node ~/.claude/statusline-command.js
   ```

### "Setup required" message?

Your API credentials are missing. Add them to `settings.json`:
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "your-token"
  }
}
```

### "Loading..." stuck?

1. Check internet connection
2. Verify API endpoint is accessible
3. Check API token is valid
4. Cache will retry in 15 seconds on error

## Next Steps

- 📖 Read the full [README.md](README.md) for all features
- 🎨 Customize colors and display options
- 🐛 Report issues on GitHub
- ⭐ Star the repository if you find it useful!

## Support

- 📧 Open an issue on GitHub
- 📖 Check [README.md](README.md) for detailed documentation
- 💬 Join discussions in GitHub Issues

---

**Installation complete!** Enjoy your beautiful statusline! 🎉
