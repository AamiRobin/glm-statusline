#!/usr/bin/env node

/**
 * GLM Statusline Installer
 * Automatically installs the statusline command to your Claude Code configuration
 */

const fs = require('fs');
const path = require('path');

const homeDir = process.env.HOME || process.env.USERPROFILE;
const claudeDir = path.join(homeDir, '.claude');
const settingsPath = path.join(claudeDir, 'settings.json');
const statuslineScriptPath = path.join(__dirname, 'statusline-command.js');
const targetScriptPath = path.join(claudeDir, 'statusline-command.js');

console.log('🚀 Installing GLM Statusline for Claude Code...\n');

// Create .claude directory if it doesn't exist
if (!fs.existsSync(claudeDir)) {
  console.log(`📁 Creating .claude directory at ${claudeDir}`);
  fs.mkdirSync(claudeDir, { recursive: true });
}

// Copy statusline script
console.log(`📝 Copying statusline script to ${targetScriptPath}`);
fs.copyFileSync(statuslineScriptPath, targetScriptPath);

// Read existing settings or create new
let settings = {};
if (fs.existsSync(settingsPath)) {
  try {
    const settingsContent = fs.readFileSync(settingsPath, 'utf8');
    settings = JSON.parse(settingsContent);
    console.log('✅ Found existing settings.json');
  } catch (error) {
    console.log('⚠️  Error reading settings.json, creating new one');
  }
}

// Determine which command to use (prefer bun if available, otherwise node)
const useBun = process.env.npm_config_user_agent && process.env.npm_config_user_agent.includes('bun');
const command = useBun ? 'bun' : 'node';

// Use appropriate path format for Windows vs Unix
// Both Bun and Node on Windows need forward slashes in the actual path
const isWindows = process.platform === 'win32';
let scriptPathForCommand;
if (isWindows) {
  // Convert backslashes to forward slashes for both Node and Bun on Windows
  scriptPathForCommand = targetScriptPath.replace(/\\/g, '/');
} else {
  // Unix systems
  scriptPathForCommand = targetScriptPath;
}
const statuslineCommand = `${command} ${scriptPathForCommand}`;

// Update statusline configuration
settings.statusLine = {
  type: 'command',
  command: statuslineCommand
};

// Write updated settings
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
console.log('✅ Updated settings.json with statusline configuration:');
console.log(`   "statusLine": {`);
console.log(`     "type": "command",`);
console.log(`     "command": "${statuslineCommand}"`);
console.log(`   }`);

console.log('\n✨ Installation complete!\n');
console.log('\n📝 Next steps:');
console.log('   1. Make sure your settings.json contains GLM API credentials:');
console.log('      - ANTHROPIC_BASE_URL');
console.log('      - ANTHROPIC_AUTH_TOKEN');
console.log('   2. Restart Claude Code');
console.log('   3. The statusline will appear at the bottom of your terminal\n');

console.log('🔧 Troubleshooting:');
console.log('   If the statusline doesn\'t appear, check:');
console.log(`   - Settings file: ${settingsPath}`);
console.log(`   - Script location: ${targetScriptPath}`);
console.log('   - API credentials are correctly configured\n');
