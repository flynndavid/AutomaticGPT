# iOS Deployment Guide: App Store Connect & TestFlight

This guide walks you through deploying your Expo app to iOS App Store Connect and TestFlight for internal testing.

## Prerequisites

### 1. Apple Developer Account

- **Required**: Active Apple Developer Program membership ($99/year)
- Sign up at [developer.apple.com](https://developer.apple.com/programs/)
- Note your **Apple ID** and **Team ID** (found in your developer account)

### 2. Required Tools

```bash
# Install EAS CLI globally
npm install -g @expo/eas-cli

# Login to your Expo account
eas login
```

## Step 1: Configure Your App

### Update Bundle Identifier

In `app.json`, update the bundle identifier to match your domain:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.automaticgpt"
    }
  }
}
```

**Important**: Replace `yourcompany` with your actual company/domain name.

### Update EAS Configuration

In `eas.json`, update the submit configuration:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

## Step 2: Create App in App Store Connect

### 1. Create New App

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Your app name
   - **Primary Language**: English (or your preference)
   - **Bundle ID**: Must match your `app.json` bundle identifier
   - **SKU**: Unique identifier (can be same as bundle ID)

### 2. Note Your App Store Connect App ID

- After creating the app, note the **App ID** from the URL
- Example: `https://appstoreconnect.apple.com/apps/1234567890/` → App ID is `1234567890`

## Step 3: Configure EAS Project

### Initialize EAS Project

```bash
# Initialize EAS project (creates project ID)
eas project:init

# This will update your app.json with the project ID
```

### Configure Build Profiles

Your `eas.json` should look like this:

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  }
}
```

## Step 4: Build for TestFlight

### 1. Build for Internal Distribution (TestFlight)

```bash
# Build for TestFlight
eas build --platform ios --profile preview
```

This will:

- Build your app in the cloud
- Generate an `.ipa` file
- Provide a download link when complete

### 2. Upload to TestFlight

```bash
# Upload to TestFlight automatically
eas submit --platform ios --profile production
```

**Or upload manually:**

1. Download the `.ipa` file from the build
2. Use **Transporter** app (Mac App Store) to upload
3. Or use **Xcode** → **Window** → **Organizer** → **Distribute App**

## Step 5: Configure TestFlight

### 1. Add Test Information

In App Store Connect:

1. Go to **TestFlight** tab
2. Click on your build
3. Add **"What to Test"** information
4. Add **Beta App Description**

### 2. Add Internal Testers

1. Go to **TestFlight** → **Internal Testing**
2. Click **"+"** to add testers
3. Add email addresses of team members
4. They'll receive email invitations

### 3. Install TestFlight App

Testers need to:

1. Install **TestFlight** app from App Store
2. Accept email invitation
3. Install your app through TestFlight

## Step 6: Environment Variables

### Create `.env` file

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Required Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (if using auth features)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Feature Flags
EXPO_PUBLIC_ENABLE_AUTH=true
EXPO_PUBLIC_ENABLE_CHAT=true
```

## Step 7: Updating Your App

### Version Updates

Before each new build:

1. Update `version` in `app.json`
2. Update `buildNumber` in `app.json` → `ios` section
3. Commit changes to git

### Build and Deploy

```bash
# Build new version
eas build --platform ios --profile preview

# Upload to TestFlight
eas submit --platform ios --profile production
```

## Troubleshooting

### Common Issues

**1. Bundle Identifier Conflicts**

- Ensure your bundle ID is unique
- Check it's not already registered by another developer

**2. Build Failures**

- Check your environment variables are set
- Ensure all dependencies are properly installed
- Review build logs in EAS dashboard

**3. TestFlight Upload Issues**

- Verify your Apple Developer account is active
- Check your Team ID is correct in `eas.json`
- Ensure you have proper permissions in App Store Connect

### Useful Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view [build-id]

# Check EAS project info
eas project:info

# Login to EAS
eas login

# Logout from EAS
eas logout
```

## Security Notes

- **Never commit** your `.env` file to version control
- **Store API keys securely** - consider using EAS Secrets for production
- **Limit TestFlight access** to trusted testers only
- **Review permissions** in App Store Connect regularly

## Next Steps

Once your app is working in TestFlight:

1. **Gather feedback** from internal testers
2. **Fix any issues** and release updates
3. **Add external testers** for broader testing
4. **Prepare for App Store submission** when ready

For App Store submission, you'll need additional assets:

- Screenshots for all device sizes
- App description and metadata
- Privacy policy (if collecting user data)
- App Store review guidelines compliance

## Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [Apple Developer Program](https://developer.apple.com/programs/)
