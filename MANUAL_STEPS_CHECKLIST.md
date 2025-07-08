# Manual Steps Checklist for AutomaticGPT Rename

## ✅ Completed Automatically

- [x] Updated app.json with new name, slug, and bundle identifiers
- [x] Updated package.json with new repository URLs and descriptions
- [x] Updated README.md and TEMPLATE_README.md with new references
- [x] Updated docs/ENV_SETUP.md with new app name examples
- [x] Updated docs/deployment/IOS_DEPLOYMENT.md with new bundle identifier
- [x] Created .env.example with proper AutomaticGPT configuration
- [x] Updated package-lock.json (via npm install)

## 📋 Manual Steps Required

### 1. GitHub Repository (HIGH PRIORITY)

- [ ] **Rename GitHub repository** from `automatic-sandbox-expo-1` to `AutomaticGPT`
  - Go to https://github.com/flynndavid/automatic-sandbox-expo-1
  - Settings → Repository name → Change to `AutomaticGPT`
  - **Note**: GitHub will create automatic redirects
- [ ] **Update local git remote** (after repository rename):
  ```bash
  git remote set-url origin https://github.com/flynndavid/AutomaticGPT.git
  ```
- [ ] **Update GitHub Actions secrets** (if any custom secrets reference old name)
- [ ] **Update repository description** to "AutomaticGPT - AI-powered mobile & web app template"

### 2. NPM Package (MEDIUM PRIORITY)

- [ ] **Deprecate old NPM package** (if published):
  ```bash
  npm deprecate create-expo-ai-template@* "Package renamed - use AutomaticGPT template instead"
  ```
- [ ] **Publish new package** (optional - keep current name for template compatibility):
  ```bash
  npm publish
  ```
- [ ] **Update NPM package description** on npmjs.com to reference AutomaticGPT

### 3. Vercel Deployment (MEDIUM PRIORITY)

- [ ] **Update Vercel project name**:
  - Go to Vercel dashboard
  - Select project → Settings → General → Project Name
  - Change to `AutomaticGPT`
- [ ] **Update environment variables** in Vercel:
  - `EXPO_PUBLIC_APP_NAME` → `AutomaticGPT`
  - `EXPO_PUBLIC_APP_SLUG` → `automaticgpt`
- [ ] **Update custom domain** (if using one) to point to new project name
- [ ] **Test deployment** after changes

### 4. Supabase Project (LOW PRIORITY)

- [ ] **Update Supabase project name** (cosmetic only):
  - Go to Supabase dashboard
  - Select project → Settings → General → Project Name
  - Change to `AutomaticGPT`
- [ ] **Update project description** to reference AutomaticGPT
- [ ] **No changes needed** for:
  - Database structure
  - API URLs
  - Authentication settings
  - Environment variables

### 5. Apple Developer Portal (WHEN READY)

- [ ] **Create new app** in App Store Connect when ready:
  - App Name: `AutomaticGPT`
  - Bundle ID: `com.yourcompany.automaticgpt`
  - SKU: `automaticgpt`
- [ ] **Update eas.json** with real values:
  - `appleId`: Your Apple ID email
  - `ascAppId`: App Store Connect App ID
  - `appleTeamId`: Your Apple Team ID
- [ ] **Generate new provisioning profiles** for the new bundle ID

### 6. Domain and Email (OPTIONAL)

- [ ] **Register domain** (if desired): `automaticgpt.com` or similar
- [ ] **Update email references** in eas.json if using different email
- [ ] **Update website/landing page** if you have one

### 7. Analytics and Monitoring (WHEN APPLICABLE)

- [ ] **Update Google Analytics** (if configured):
  - Property name
  - Website URL
- [ ] **Update Sentry** (if configured):
  - Project name
  - DSN references
- [ ] **Update any other monitoring tools** with new project name

### 8. Social Media and Marketing (OPTIONAL)

- [ ] **Update social media handles** if using project-specific accounts
- [ ] **Update marketing materials** with new name
- [ ] **Update any press releases** or announcements

## 🔄 After Manual Steps - Testing Checklist

### Local Development

- [ ] **Clone repository** with new URL to test
- [ ] **Run development server**: `npm start`
- [ ] **Test all features** work as expected
- [ ] **Verify environment variables** are loading correctly

### Deployment Testing

- [ ] **Test Vercel deployment** works with new configuration
- [ ] **Test EAS build** (when ready): `eas build --platform ios --profile preview`
- [ ] **Test Supabase connection** works with existing configuration
- [ ] **Test authentication flow** if enabled

### End-to-End Testing

- [ ] **Test app installation** on device/simulator
- [ ] **Test all major features** (chat, auth, navigation)
- [ ] **Test sharing functionality** if implemented
- [ ] **Test analytics** if implemented

## 📞 Support and Rollback

### If Issues Occur

1. **GitHub redirects** handle most URL changes automatically
2. **Keep old NPM package** available for backward compatibility
3. **Revert git remote** if needed: `git remote set-url origin <old-url>`
4. **Contact support** for external services if needed

### Emergency Rollback

1. **Git**: `git checkout main` (original branch)
2. **Vercel**: Revert project name in dashboard
3. **Supabase**: Revert project name (cosmetic only)
4. **NPM**: Unpublish if published recently

---

## 📝 Notes

- **GitHub redirects** will handle most URL changes automatically
- **Bundle identifier changes** only affect new app installations
- **Environment variables** in external services need manual updates
- **DNS changes** may take up to 24 hours to propagate
- **Apple App Store** changes require review process

## 🎯 Priority Order

1. **GitHub repository rename** (enables all other steps)
2. **Vercel deployment updates** (affects live app)
3. **Supabase project name** (cosmetic improvement)
4. **Apple Developer Portal** (when ready to deploy)
5. **Domain and marketing updates** (optional enhancements)

**Total estimated time**: 2-3 hours for all manual steps
