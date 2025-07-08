#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🍎 iOS Deployment Setup Helper\n');

// Check if EAS CLI is installed
function checkEASCLI() {
  try {
    execSync('eas --version', { stdio: 'pipe' });
    console.log('✅ EAS CLI is installed');
    return true;
  } catch (error) {
    console.log('❌ EAS CLI not found');
    console.log('📦 Installing EAS CLI...');
    try {
      execSync('npm install -g @expo/eas-cli', { stdio: 'inherit' });
      console.log('✅ EAS CLI installed successfully');
      return true;
    } catch (installError) {
      console.log('❌ Failed to install EAS CLI');
      console.log('Please run: npm install -g @expo/eas-cli');
      return false;
    }
  }
}

// Check if user is logged in to EAS
function checkEASLogin() {
  try {
    const result = execSync('eas whoami', { stdio: 'pipe', encoding: 'utf8' });
    console.log(`✅ Logged in as: ${result.trim()}`);
    return true;
  } catch (error) {
    console.log('❌ Not logged in to EAS');
    console.log('Please run: eas login');
    return false;
  }
}

// Check app.json configuration
function checkAppConfig() {
  const appJsonPath = path.join(process.cwd(), 'app.json');

  if (!fs.existsSync(appJsonPath)) {
    console.log('❌ app.json not found');
    return false;
  }

  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const ios = appJson.expo?.ios;

  if (!ios?.bundleIdentifier) {
    console.log('❌ Bundle identifier not set in app.json');
    console.log('Please update app.json with your bundle identifier');
    return false;
  }

  if (ios.bundleIdentifier.includes('yourcompany')) {
    console.log('⚠️ Bundle identifier still contains placeholder');
    console.log(`Current: ${ios.bundleIdentifier}`);
    console.log('Please update with your actual company/domain name');
    return false;
  }

  console.log(`✅ Bundle identifier: ${ios.bundleIdentifier}`);
  return true;
}

// Check if .env file exists
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    console.log('⚠️ .env file not found');
    console.log('Copy .env.example to .env and fill in your values');
    return false;
  }

  console.log('✅ .env file exists');
  return true;
}

// Main setup check
function main() {
  console.log('Checking iOS deployment setup...\n');

  const checks = [
    { name: 'EAS CLI Installation', fn: checkEASCLI },
    { name: 'EAS Login', fn: checkEASLogin },
    { name: 'App Configuration', fn: checkAppConfig },
    { name: 'Environment Variables', fn: checkEnvFile },
  ];

  let allPassed = true;

  checks.forEach((check) => {
    console.log(`\n🔍 ${check.name}:`);
    const passed = check.fn();
    if (!passed) allPassed = false;
  });

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    console.log('🎉 Setup complete! You can now build for iOS:');
    console.log('   eas build --platform ios --profile preview');
  } else {
    console.log('❌ Setup incomplete. Please address the issues above.');
    console.log('📖 See docs/deployment/IOS_DEPLOYMENT.md for detailed instructions');
  }
}

main();
