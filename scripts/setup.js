#!/usr/bin/env node

/**
 * Interactive Template Setup Wizard
 * Helps developers configure the Expo template after cloning
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Simple console utilities (avoiding external dependencies for now)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}🚀 ${msg}${colors.reset}\n`),
};

// Simple prompt utility (can be enhanced with inquirer later)
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
  log.title('Welcome to the Expo Template Setup Wizard!');

  console.log(
    'This wizard will help you configure your new Expo app with the features you need.\n'
  );

  try {
    // 1. Basic App Configuration
    log.info("Let's start with basic app configuration...");

    const appName = await prompt('What is your app name?', 'My Awesome App');
    const appSlug = await prompt(
      'App slug (for URLs and package name)',
      appName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
    );

    // 2. Feature Selection
    log.info("\nNow let's choose which features to enable...");

    const features = {
      // Core features (currently implemented)
      enableDarkMode: await confirm('Enable dark mode support?', true),
      enableHaptics: await confirm('Enable haptic feedback?', true),
      enableAnimations: await confirm('Enable UI animations?', true),

      // Template features (future implementation)
      enableAuth: await confirm('Enable authentication (login/signup)?', false),
      enableStorage: await confirm('Enable file storage and uploads?', false),
      enableOnboarding: await confirm('Enable user onboarding flow?', false),
      enableProfile: await confirm('Enable user profile management?', false),
      enableSidebar: await confirm('Enable app sidebar navigation?', false),
      enableAnalytics: await confirm('Enable analytics tracking?', false),
    };

    // 3. Branding Configuration
    log.info("\nLet's configure your app's branding...");

    const primaryColors = {
      Blue: '#3B82F6',
      Green: '#10B981',
      Purple: '#8B5CF6',
      Red: '#EF4444',
      Orange: '#F97316',
    };

    console.log('\nAvailable colors:');
    Object.entries(primaryColors).forEach(([name, hex], index) => {
      console.log(`  ${index + 1}. ${name} (${hex})`);
    });

    const colorChoice = await prompt('Choose primary color (1-5)', '1');
    const colorIndex = parseInt(colorChoice) - 1;
    const primaryColor = Object.values(primaryColors)[colorIndex] || '#3B82F6';

    const themeMode = await prompt('Default theme mode (light/dark/system)', 'system');

    // 4. Generate configuration files
    log.info('\nGenerating configuration files...');

    await generateEnvFile({
      appName,
      appSlug,
      features,
      primaryColor,
      themeMode,
    });

    await updateAppConfig({ appName, appSlug });
    await updatePackageJson({ appName, appSlug });

    // 5. Check for optional integrations
    const hasSupabase = await confirm('\nDo you have Supabase credentials ready?', false);
    const hasOpenAI = await confirm('Do you have an OpenAI API key ready?', false);

    if (hasSupabase) {
      await setupSupabasePrompt();
    }

    if (hasOpenAI) {
      await setupOpenAIPrompt();
    }

    // 6. Install dependencies if needed
    const shouldInstall = await confirm('\nInstall dependencies now?', true);
    if (shouldInstall) {
      log.info('Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
      log.success('Dependencies installed successfully!');
    }

    // 7. Show completion message
    showCompletionMessage({ hasSupabase, hasOpenAI, features });
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

async function generateEnvFile(config) {
  const envPath = path.join(process.cwd(), '.env.local');

  const envContent = `# Generated by template setup wizard
# ${new Date().toISOString()}

# =====================================================
# APP CONFIGURATION
# =====================================================
EXPO_PUBLIC_APP_NAME="${config.appName}"
EXPO_PUBLIC_APP_SLUG="${config.appSlug}"
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_BUILD_NUMBER=1
EXPO_PUBLIC_ENVIRONMENT=development

# =====================================================
# FEATURE FLAGS
# =====================================================
EXPO_PUBLIC_ENABLE_DARK_MODE=${config.features.enableDarkMode}
EXPO_PUBLIC_ENABLE_HAPTICS=${config.features.enableHaptics}
EXPO_PUBLIC_ENABLE_ANIMATIONS=${config.features.enableAnimations}

# Template features (to be implemented)
EXPO_PUBLIC_ENABLE_AUTH=${config.features.enableAuth}
EXPO_PUBLIC_ENABLE_STORAGE=${config.features.enableStorage}
EXPO_PUBLIC_ENABLE_ONBOARDING=${config.features.enableOnboarding}
EXPO_PUBLIC_ENABLE_PROFILE=${config.features.enableProfile}
EXPO_PUBLIC_ENABLE_SIDEBAR=${config.features.enableSidebar}
EXPO_PUBLIC_ENABLE_ANALYTICS=${config.features.enableAnalytics}

# =====================================================
# BRANDING
# =====================================================
EXPO_PUBLIC_PRIMARY_COLOR="${config.primaryColor}"
EXPO_PUBLIC_SECONDARY_COLOR=#64748B
EXPO_PUBLIC_THEME_MODE="${config.themeMode}"

# =====================================================
# API CONFIGURATION
# =====================================================
EXPO_PUBLIC_API_URL=http://localhost:8081

# =====================================================
# THIRD-PARTY SERVICES
# =====================================================
# TODO: Add your API keys below

# OpenAI (required for AI chat features)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase (required for auth and storage features)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
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

async function setupSupabasePrompt() {
  log.info('\nSupabase Setup:');
  console.log('1. Go to https://supabase.com and create a new project');
  console.log('2. Copy your project URL and anon key from Settings > API');
  console.log('3. Update the SUPABASE_* variables in your .env.local file');
}

async function setupOpenAIPrompt() {
  log.info('\nOpenAI Setup:');
  console.log('1. Go to https://platform.openai.com/api-keys');
  console.log('2. Create a new API key');
  console.log('3. Update the OPENAI_API_KEY in your .env.local file');
}

function showCompletionMessage({ hasSupabase, hasOpenAI, features }) {
  log.title('Setup Complete! 🎉');

  console.log('Your template has been configured successfully.\n');

  log.info('Next Steps:');

  if (!hasSupabase && (features.enableAuth || features.enableStorage)) {
    console.log('1. 📝 Set up Supabase credentials in .env.local (required for auth/storage)');
  }

  if (!hasOpenAI) {
    console.log('2. 🔑 Add your OpenAI API key to .env.local (required for AI chat)');
  }

  console.log('3. 🚀 Start development: npm run start');
  console.log('4. 📱 Choose your platform: npm run ios | npm run android | npm run web');
  console.log('5. 📖 Check the docs folder for feature guides\n');

  if (Object.values(features).some(Boolean)) {
    log.warning('Note: Some features are enabled but not yet implemented.');
    log.info('These will be available in future template updates.');
  }

  log.success('Happy coding! 🚀');
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupTemplate().catch((error) => {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { setupTemplate };
