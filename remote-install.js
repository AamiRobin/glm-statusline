#!/usr/bin/env node

/**
 * GLM Statusline Remote Installer
 * Can be run directly with: curl -fsSL https://raw.githubusercontent.com/AamiRobin/glm-statusline/main/remote-install.js | node
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const homeDir = process.env.HOME || process.env.USERPROFILE;
const claudeDir = path.join(homeDir, '.claude');
const settingsPath = path.join(claudeDir, 'settings.json');
const targetScriptPath = path.join(claudeDir, 'statusline-command.js');

const REPO_URL = 'https://raw.githubusercontent.com/AamiRobin/glm-statusline/master';
const SCRIPT_URL = `${REPO_URL}/statusline-command.js`;

console.log('🚀 Installing GLM Statusline for Claude Code...\n');

// Create .claude directory if it doesn't exist
if (!fs.existsSync(claudeDir)) {
  console.log(`📁 Creating .claude directory at ${claudeDir}`);
  fs.mkdirSync(claudeDir, { recursive: true });
}

// Download the statusline script
console.log(`📥 Downloading statusline script...`);
https.get(SCRIPT_URL, (response) => {
  if (response.statusCode !== 200) {
    console.error(`❌ Failed to download script. Status code: ${response.statusCode}`);
    process.exit(1);
  }

  const fileStream = fs.createWriteStream(targetScriptPath);
  response.pipe(fileStream);

  fileStream.on('finish', () => {
    fileStream.close();
    console.log(`✅ Downloaded to ${targetScriptPath}`);

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
    const command = 'node';

    // Use appropriate path format for Windows vs Unix
    // Bun on Windows needs forward slashes and full path
    // Node works with both, but we use USERPROFILE for consistency
    const isWindows = process.platform === 'win32';
    let scriptPathForCommand;
    if (isWindows) {
      // Node on Windows can use USERPROFILE environment variable
      scriptPathForCommand = '%USERPROFILE%\\.claude\\statusline-command.js';
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
    console.log('✅ Updated settings.json with statusline configuration');

    console.log('\n✨ Installation complete!\n');
    console.log('Your statusline has been configured to use:');
    console.log(`   ${statuslineCommand}`);
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
  });
}).on('error', (error) => {
  console.error('❌ Error downloading script:', error.message);
  console.log('\n💡 Alternative installation method:');
  console.log('   git clone https://github.com/AamiRobin/glm-statusline.git');
  console.log('   cd glm-statusline');
  console.log('   node install.js\n');
  process.exit(1);
});
