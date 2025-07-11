#!/usr/bin/env node

/**
 * Interactive Template Setup Wizard
 * Streamlined setup for the Expo AI Template
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Console utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}🚀 ${msg}${colors.reset}\n`),
};

// Simple prompt utility
const prompt = (question, defaultValue = '') => {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const displayDefault = defaultValue ? ` (${defaultValue})` : '';
    rl.question(`${question}${displayDefault}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
};

const confirm = async (question, defaultValue = true) => {
  const defaultText = defaultValue ? 'Y/n' : 'y/N';
  const answer = await prompt(`${question} (${defaultText})`);
  if (!answer) return defaultValue;
  return answer.toLowerCase().startsWith('y');
};

async function setupTemplate() {
  log.title('Welcome to the Expo AI Template Setup! 🤖');

  console.log(
    `${colors.bright}This template includes:${colors.reset}
• 🔐 Authentication & User Management
• 💬 AI Chat with OpenAI GPT-4o
• 🗂️ Conversation Management & Analytics
• 🔗 Conversation Sharing
• 🎨 Theme Customization & Navigation

${colors.green}This wizard will help you configure your app quickly!${colors.reset}
${colors.cyan}Alternatively, you can skip this and manually copy .env.example to .env.local${colors.reset}\n`
  );

  try {
    // 1. Basic App Information
    log.info('📱 App Information');

    const appName = await prompt('What is your app name?', 'My AI App');
    const appSlug = await prompt(
      'App slug (for URLs and package name)',
      appName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    );

    // 2. API Keys (Required)
    log.info('\n🔑 API Configuration');
    console.log('You need these API keys to use all features:\n');

    const hasSupabase = await confirm('Do you have Supabase credentials ready?', false);
    const hasOpenAI = await confirm('Do you have an OpenAI API key ready?', false);

    let supabaseConfig = null;
    let openaiConfig = null;

    if (hasSupabase) {
      supabaseConfig = await setupSupabaseConfig();
    }

    if (hasOpenAI) {
      openaiConfig = await setupOpenAIConfig();
    }

    // 3. Generate Configuration Files
    log.info('\n📝 Generating configuration files...');

    await generateEnvFile({
      appName,
      appSlug,
      supabaseConfig,
      openaiConfig,
    });

    await updateAppConfig({ appName, appSlug });
    await updatePackageJson({ appName, appSlug });
    await generateReadme({ appName, appSlug });

    // 4. Install Dependencies
    const shouldInstall = await confirm('\n📦 Install dependencies now?', true);
    if (shouldInstall) {
      log.info('Installing dependencies...');
      try {
        execSync('npm install', { stdio: 'inherit' });
        log.success('Dependencies installed successfully!');
      } catch (_error) {
        log.error('Failed to install dependencies. Please run "npm install" manually.');
      }
    }

    // 5. Show Completion Message
    showCompletionMessage({
      appName,
      hasSupabase,
      hasOpenAI,
    });
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

async function setupSupabaseConfig() {
  log.info('\n🔧 Supabase Configuration:');

  const supabaseUrl = await prompt('Supabase Project URL');
  const supabaseAnonKey = await prompt('Supabase Anon Key');
  const supabaseServiceKey = await prompt('Supabase Service Role Key (optional)');

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceKey: supabaseServiceKey,
  };
}

async function setupOpenAIConfig() {
  log.info('\n🤖 OpenAI Configuration:');

  const openaiKey = await prompt('OpenAI API Key');

  return {
    apiKey: openaiKey,
  };
}

async function generateEnvFile(config) {
  const envPath = path.join(process.cwd(), '.env.local');

  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    log.warning('.env.local already exists - skipping file creation');
    log.info('To reconfigure, either delete .env.local or edit it manually');
    return;
  }

  const envContent = `# =============================================================================
# EXPO AI TEMPLATE - ENVIRONMENT CONFIGURATION
# =============================================================================
# Generated by template setup wizard on ${new Date().toISOString()}

# =============================================================================
# APP CONFIGURATION
# =============================================================================
EXPO_PUBLIC_APP_NAME="${config.appName}"
EXPO_PUBLIC_APP_SLUG="${config.appSlug}"
EXPO_PUBLIC_APP_VERSION="1.0.0"
EXPO_PUBLIC_BUILD_NUMBER="1"
EXPO_PUBLIC_ENVIRONMENT="development"

# =============================================================================
# CORE FEATURES (ALL ENABLED BY DEFAULT)
# =============================================================================

# Authentication & User Management
EXPO_PUBLIC_ENABLE_AUTH=true
EXPO_PUBLIC_ENABLE_EMAIL_AUTH=true
EXPO_PUBLIC_ENABLE_PROFILE=true
EXPO_PUBLIC_ENABLE_PROFILE_MANAGEMENT=true

# Conversation Management System
EXPO_PUBLIC_ENABLE_CONVERSATION_MANAGEMENT=true
EXPO_PUBLIC_ENABLE_CONVERSATION_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CONVERSATION_SHARING=true

# Navigation & Layout
EXPO_PUBLIC_ENABLE_ONBOARDING=true
EXPO_PUBLIC_ENABLE_SPLASH_ONBOARDING=true
EXPO_PUBLIC_ENABLE_SIDEBAR=true
EXPO_PUBLIC_ENABLE_THEME_CUSTOMIZATION=true

# UI Features
EXPO_PUBLIC_ENABLE_DARK_MODE=true
EXPO_PUBLIC_ENABLE_ANIMATIONS=true
EXPO_PUBLIC_ENABLE_HAPTICS=true

# =============================================================================
# FUTURE FEATURES (DISABLED BY DEFAULT)
# =============================================================================
# Uncomment and set to true to enable when implemented

# Social Authentication
# EXPO_PUBLIC_ENABLE_SOCIAL_AUTH=false
# EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=false
# EXPO_PUBLIC_ENABLE_APPLE_AUTH=false

# File Storage & Uploads
# EXPO_PUBLIC_ENABLE_STORAGE=false
# EXPO_PUBLIC_ENABLE_FILE_UPLOADS=false

# Advanced Features
# EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
# EXPO_PUBLIC_ENABLE_OFFLINE=false
# EXPO_PUBLIC_ENABLE_REALTIME=false
# EXPO_PUBLIC_ENABLE_VOICE=false

# =============================================================================
# BRANDING & THEMING
# =============================================================================
EXPO_PUBLIC_PRIMARY_COLOR="#3B82F6"
EXPO_PUBLIC_SECONDARY_COLOR="#64748B"
EXPO_PUBLIC_THEME_MODE="system"

# =============================================================================
# API CONFIGURATION
# =============================================================================
EXPO_PUBLIC_API_URL="http://localhost:8081"

# =============================================================================
# REQUIRED API KEYS
# =============================================================================

# OpenAI (Required for AI chat features)
OPENAI_API_KEY="${config.openaiConfig?.apiKey || 'your_openai_api_key_here'}"

# Supabase (Required for auth, conversations, analytics, sharing)
EXPO_PUBLIC_SUPABASE_URL="${config.supabaseConfig?.url || 'your_supabase_project_url'}"
EXPO_PUBLIC_SUPABASE_ANON_KEY="${config.supabaseConfig?.anonKey || 'your_supabase_anon_key'}"
SUPABASE_SERVICE_ROLE_KEY="${config.supabaseConfig?.serviceKey || 'your_supabase_service_role_key'}"

# =============================================================================
# FEATURE-SPECIFIC CONFIGURATION
# =============================================================================
EXPO_PUBLIC_MAX_MESSAGE_LENGTH="4000"
EXPO_PUBLIC_CHAT_HISTORY_LIMIT="100"
EXPO_PUBLIC_ANALYTICS_RETENTION_DAYS="90"
EXPO_PUBLIC_ENABLE_USAGE_TRACKING="true"

# =============================================================================
# DEVELOPMENT CONFIGURATION
# =============================================================================
EXPO_PUBLIC_DEBUG_MODE="false"
EXPO_PUBLIC_LOG_LEVEL="info"
EXPO_PUBLIC_ENABLE_DEV_TOOLS="true"
`;

  fs.writeFileSync(envPath, envContent);
  log.success('Generated .env.local file');
}

async function updateAppConfig(config) {
  const appConfigPath = path.join(process.cwd(), 'app.json');

  if (fs.existsSync(appConfigPath)) {
    const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));

    appConfig.expo.name = config.appName;
    appConfig.expo.slug = config.appSlug;

    fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2));
    log.success('Updated app.json');
  }
}

async function updatePackageJson(config) {
  const packagePath = path.join(process.cwd(), 'package.json');

  if (fs.existsSync(packagePath)) {
    const packageConfig = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    packageConfig.name = config.appSlug;

    fs.writeFileSync(packagePath, JSON.stringify(packageConfig, null, 2));
    log.success('Updated package.json');
  }
}

async function generateReadme(config) {
  const templatePath = path.join(process.cwd(), 'TEMPLATE_README.md');
  const readmePath = path.join(process.cwd(), 'README.md');

  if (fs.existsSync(templatePath)) {
    let readmeContent = fs.readFileSync(templatePath, 'utf8');

    // Replace template placeholders
    readmeContent = readmeContent.replace(/{{APP_NAME}}/g, config.appName);
    readmeContent = readmeContent.replace(/{{APP_SLUG}}/g, config.appSlug);

    fs.writeFileSync(readmePath, readmeContent);
    log.success('Generated README.md from template');
  }
}

function showCompletionMessage(config) {
  log.title('🎉 Setup Complete!');

  console.log(`${colors.bright}Your "${config.appName}" app is ready!${colors.reset}\n`);

  log.success('All core features are enabled and ready to use:');
  console.log('  ✅ Authentication & User Management');
  console.log('  ✅ AI Chat with Conversation Management');
  console.log('  ✅ Analytics Dashboard');
  console.log('  ✅ Conversation Sharing');
  console.log('  ✅ Theme Customization & Navigation');
  console.log();

  log.info('Next Steps:');

  if (!config.hasSupabase) {
    console.log('1. 🔧 Set up Supabase:');
    console.log('   • Go to https://supabase.com and create a new project');
    console.log('   • Run the SQL migration in supabase/migrations/');
    console.log('   • Update Supabase credentials in .env.local');
  }

  if (!config.hasOpenAI) {
    console.log('2. 🤖 Set up OpenAI:');
    console.log('   • Go to https://platform.openai.com/api-keys');
    console.log('   • Create a new API key');
    console.log('   • Update OPENAI_API_KEY in .env.local');
  }

  console.log('3. 🚀 Start development:');
  console.log('   npm run start');
  console.log();
  console.log('4. 📱 Choose your platform:');
  console.log('   npm run ios     # iOS simulator');
  console.log('   npm run android # Android emulator');
  console.log('   npm run web     # Web browser');
  console.log();

  log.info('Customization:');
  console.log('📝 Edit .env.local to customize features and branding');
  console.log('📄 Reference .env.example for all available configuration options');
  console.log('📖 See docs/FEATURES.md for detailed feature documentation');
  console.log('🎨 Modify colors, themes, and feature flags as needed');
  console.log();

  log.success('Happy coding! 🚀');

  console.log(
    `\n${colors.yellow}💡 Tip: All core features are enabled by default. You can disable or customize them in .env.local${colors.reset}`
  );
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupTemplate().catch((error) => {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { setupTemplate };
