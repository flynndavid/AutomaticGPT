# Authentication System Issues & Fixes

This document outlines critical bugs and issues found in the authentication, splash screen, onboarding, and Supabase integration systems. Each issue includes a detailed AI prompt for resolution.

---

## 🚨 Critical Issues

### Issue #1: Race Condition in AuthProvider Initialization

**File:** `src/features/auth/components/AuthProvider.tsx` (lines 47-125)

**Description:** The initial session check and auth state listener setup create a race condition that can cause inconsistent authentication state during app startup.

**Impact:** Users may see flickering between authenticated/unauthenticated states, or authentication may not work reliably on app launch.

**AI Fix Prompt:**

```
Fix the race condition in the AuthProvider component where the initial session check and auth state listener setup happen simultaneously. The issue is in the useEffect hook where:

1. `getInitialSession()` runs asynchronously to check existing session
2. `supabase.auth.onAuthStateChange()` listener is set up immediately after
3. The listener can fire before the initial session check completes

Requirements:
- Ensure the initial session check completes before setting up the auth listener
- Prevent duplicate state updates from racing async operations
- Maintain proper loading states throughout the sequence
- Add proper error handling for both operations
- Ensure the component doesn't render inconsistent states

The fix should sequence these operations properly and use a flag to prevent duplicate state updates.
```

---

### Issue #2: Double Splash Screen Problem

**Files:**

- `src/app/_layout.tsx` (lines 36-38, 41-43)
- `src/app/index.tsx` (lines 10-12)

**Description:** Two separate splash screens can be displayed simultaneously - one from the root layout and one from the index screen, causing confusing user experience.

**Impact:** Users see multiple splash screens, unexpected transitions, or splash screens that don't hide properly.

**AI Fix Prompt:**

```
Fix the double splash screen issue where both the root layout and index screen can show splash screens simultaneously. Current problems:

1. Root layout shows splash when `!appIsReady && FEATURES.enableSplashOnboarding`
2. Index screen shows splash when `isLoading`
3. Both conditions can be true at the same time

Requirements:
- Consolidate splash screen logic into a single location
- Ensure only one splash screen shows at a time
- Properly sequence app initialization, auth checking, and splash screen hiding
- Maintain smooth transitions between splash, auth, and main app states
- Ensure splash screen always hides appropriately
- Handle all combinations of feature flags and loading states

Create a centralized splash screen state manager that coordinates between app readiness and auth loading states.
```

---

### Issue #3: Inconsistent Loading State Management

**File:** `src/features/auth/components/AuthProvider.tsx`

**Description:** Loading states are not properly managed during async auth operations, causing UI inconsistencies and potential race conditions.

**Impact:** Loading indicators may disappear before operations complete, or multiple loading states may conflict.

**AI Fix Prompt:**

```
Fix the inconsistent loading state management in the AuthProvider. Current issues:

1. `signIn`, `signUp`, `signOut` set loading to `true` but don't wait for auth state change completion
2. The auth state listener sets `isLoading: false` which might occur before operations complete
3. Loading states can conflict between manual operations and listener updates
4. No proper loading state cleanup on errors

Requirements:
- Ensure loading states remain true until operations fully complete
- Prevent auth state listener from prematurely clearing loading states during operations
- Add operation tracking to distinguish between manual operations and automatic state changes
- Implement proper loading state cleanup on both success and error
- Ensure loading states are consistent across all auth operations
- Add timeout handling for operations that might hang

Create a robust loading state system that properly tracks ongoing operations and their completion.
```

---

### Issue #4: Missing Profile Creation Error Handling

**File:** `src/features/auth/components/AuthProvider.tsx` (lines 144-183)

**Description:** The signUp function assumes a database trigger will create user profiles but doesn't handle cases where profile creation fails or the trigger doesn't exist.

**Impact:** Users can be successfully authenticated but have no profile data, breaking app functionality.

**AI Fix Prompt:**

```
Add comprehensive profile creation error handling to the signUp function. Current issues:

1. SignUp assumes database trigger will create profile automatically
2. No verification that profile was actually created
3. No fallback if database trigger fails or doesn't exist
4. Users can end up authenticated but without profiles

Requirements:
- After successful auth signup, verify that profile was created
- If profile creation failed, attempt manual profile creation
- If manual creation fails, provide clear error message and potentially clean up auth user
- Add retry logic for profile creation failures
- Log profile creation issues for debugging
- Ensure consistent profile data structure
- Handle edge cases where auth succeeds but profile operations fail

The solution should guarantee that successful signup results in both authentication and complete profile creation, with proper rollback on failures.
```

---

## ⚠️ Memory Leak Issues

### Issue #5: Supabase Auth Listener Cleanup

**File:** `src/features/auth/components/AuthProvider.tsx` (lines 99-124)

**Description:** Auth listener cleanup only happens when Supabase is configured, but the listener might still be created in edge cases, causing memory leaks.

**Impact:** Memory leaks and potential crashes on unmount, especially during development.

**AI Fix Prompt:**

```
Fix potential memory leaks in the Supabase auth listener cleanup. Current issues:

1. Cleanup only happens when `isSupabaseConfigured()` is true
2. Listener might still be created in edge cases even when not configured
3. Cleanup function may not properly handle all scenarios
4. No error handling in cleanup process

Requirements:
- Always properly cleanup auth listeners regardless of configuration state
- Add error handling to the cleanup process
- Ensure cleanup happens in all unmount scenarios
- Add logging to track listener lifecycle
- Handle cases where cleanup might fail
- Prevent listener creation when Supabase is not properly configured

Create a robust cleanup system that prevents memory leaks in all scenarios.
```

---

### Issue #6: Unused Onboarding Hook

**File:** `src/features/onboarding/hooks/useOnboarding.ts`

**Description:** The useOnboarding hook is defined but never used in the actual onboarding flow, meaning onboarding completion is never tracked.

**Impact:** Users may see onboarding screens repeatedly, onboarding state is never persisted.

**AI Fix Prompt:**

```
Integrate the unused useOnboarding hook into the onboarding flow to properly track completion status. Current issues:

1. `useOnboarding` hook exists but is never used
2. `checkOnboardingStatus` is never called
3. Onboarding completion is never tracked or persisted
4. Users may see onboarding repeatedly

Requirements:
- Integrate useOnboarding hook into OnboardingScreen component
- Call checkOnboardingStatus appropriately to track progress
- Persist onboarding completion state
- Skip onboarding for users who have already completed it
- Add proper error handling for onboarding state operations
- Ensure onboarding state is consistent across app restarts

Connect the onboarding components to the hook to create a complete onboarding tracking system.
```

---

## 🔄 State Management Issues

### Issue #7: Inconsistent Error Clearing

**Description:** Errors are cleared inconsistently across different auth operations, leading to stale error states.

**Impact:** Users may see old error messages or miss new errors.

**AI Fix Prompt:**

```
Standardize error clearing behavior across all authentication operations. Current issues:

1. Some operations clear errors at start, others don't
2. `resetPassword` clears errors but doesn't set loading state
3. Auth state listener clears errors on any state change
4. Inconsistent error handling patterns across operations

Requirements:
- Standardize error clearing timing across all auth operations
- Clear errors at the start of new operations
- Maintain errors until operations complete (success or new error)
- Add proper error state management for all async operations
- Ensure error states don't persist inappropriately
- Add error logging for debugging

Create a consistent error management system for all authentication operations.
```

---

### Issue #8: Profile Loading Race Condition

**File:** `src/features/auth/components/AuthProvider.tsx` (lines 32-44, 104-108)

**Description:** Profile loading happens in multiple places without proper synchronization, potentially causing duplicate requests or inconsistent state.

**Impact:** Multiple API calls, inconsistent profile data, or missing profile information.

**AI Fix Prompt:**

```
Fix the profile loading race condition where profile data is loaded from multiple places simultaneously. Current issues:

1. Initial session check loads profile data
2. Auth state change listener also loads profile data
3. Both can happen simultaneously without coordination
4. Potential for duplicate API calls or inconsistent state

Requirements:
- Coordinate profile loading to prevent duplicate requests
- Ensure profile data is loaded exactly once per auth state change
- Add proper loading states for profile operations
- Handle profile loading errors gracefully
- Cache profile data appropriately
- Add retry logic for failed profile loads

Create a centralized profile loading system that eliminates race conditions and duplicate requests.
```

---

## 🛣️ Navigation Issues

### Issue #9: Missing Navigation Guards

**File:** `src/app/(auth)/_layout.tsx`

**Description:** Auth layout returns null during loading states, which can cause navigation issues and blank screens.

**Impact:** Users may see blank screens or experience navigation failures during loading states.

**AI Fix Prompt:**

```
Add proper navigation guards and loading states to the auth layout. Current issues:

1. Auth layout returns `null` during loading, causing blank screens
2. No proper loading component for auth state checking
3. Potential navigation issues when transitioning between states
4. No error handling for navigation failures

Requirements:
- Replace `null` returns with appropriate loading components
- Add proper navigation guards that handle all auth states
- Ensure smooth transitions between loading, authenticated, and unauthenticated states
- Add error boundaries for navigation failures
- Handle edge cases where auth state is indeterminate
- Provide user feedback during all loading states

Create robust navigation guards that provide proper user feedback in all scenarios.
```

---

### Issue #10: Hard-coded Route Navigation

**File:** `src/features/onboarding/components/OnboardingScreen.tsx` (lines 18, 25)

**Description:** Routes are hard-coded without checking if they exist, potentially causing navigation errors.

**Impact:** App crashes or navigation failures if routes change or don't exist.

**AI Fix Prompt:**

```
Replace hard-coded route navigation with dynamic route checking and error handling. Current issues:

1. Routes like `'/(auth)/login'` are hard-coded
2. No checking if routes actually exist
3. No error handling for navigation failures
4. Brittle navigation that breaks if routes change

Requirements:
- Create a route constants file with all app routes
- Add route validation before navigation attempts
- Implement error handling for failed navigation
- Add fallback routes for missing destinations
- Make navigation more maintainable and type-safe
- Add logging for navigation failures

Create a robust navigation system that handles route changes and failures gracefully.
```

---

## 🔐 Session Management Issues

### Issue #11: Missing Automatic Session Refresh

**File:** `src/features/auth/components/AuthProvider.tsx` (lines 251-273)

**Description:** The refreshSession method exists but is never called automatically, meaning sessions can expire without user knowledge.

**Impact:** Users may be logged out unexpectedly or experience auth failures.

**AI Fix Prompt:**

```
Implement automatic session refresh to prevent unexpected logouts. Current issues:

1. `refreshSession` method exists but is never called automatically
2. No monitoring of session expiration
3. Users can be logged out without warning
4. No retry logic for failed session refreshes

Requirements:
- Add automatic session refresh before expiration
- Monitor session validity and refresh proactively
- Add retry logic for failed refresh attempts
- Handle refresh failures gracefully (e.g., redirect to login)
- Add user notification for session issues
- Ensure refresh doesn't interfere with active operations
- Add proper logging for session management

Create an automatic session management system that keeps users logged in reliably.
```

---

### Issue #12: Storage Error Handling

**File:** `src/lib/supabase.ts` (lines 96-103)

**Description:** AsyncStorage is configured for session persistence but there's no error handling for storage failures.

**Impact:** Auth state may not persist across app restarts, users may be unexpectedly logged out.

**AI Fix Prompt:**

```
Add comprehensive error handling for AsyncStorage operations in Supabase configuration. Current issues:

1. No error handling for AsyncStorage failures
2. No fallback when storage is not available
3. Silent failures could cause auth state loss
4. No recovery mechanism for storage issues

Requirements:
- Add error handling for all AsyncStorage operations
- Implement fallback storage or in-memory session management
- Add logging for storage failures
- Provide user feedback for persistent storage issues
- Add recovery mechanisms for corrupted storage
- Ensure app still functions when storage fails
- Add debugging capabilities for storage issues

Create a robust storage system that handles failures gracefully and maintains functionality even when persistence fails.
```

---

## ⏱️ Timing Issues

### Issue #13: Expo SplashScreen Race Condition

**File:** `src/app/_layout.tsx` (lines 14-15, 27-28)

**Description:** ExpoSplashScreen.preventAutoHideAsync() is called at module level, but hideAsync() might be called before the prevent call completes.

**Impact:** Splash screen may hide too early or behave unpredictably.

**AI Fix Prompt:**

```
Fix the race condition between ExpoSplashScreen.preventAutoHideAsync() and hideAsync() calls. Current issues:

1. `preventAutoHideAsync()` called at module level might not complete before `hideAsync()`
2. No awaiting of prevent operation before app initialization
3. Potential timing issues with splash screen control
4. No error handling for splash screen operations

Requirements:
- Ensure `preventAutoHideAsync()` completes before any other splash screen operations
- Add proper async handling for all splash screen operations
- Add error handling for splash screen API failures
- Ensure splash screen behavior is predictable and reliable
- Add logging for splash screen operations
- Handle edge cases where splash screen API fails

Create a reliable splash screen management system that properly sequences all operations.
```

---

### Issue #14: Splash Duration Logic Not Used

**File:** `src/features/splash/hooks/useSplashScreen.ts`

**Description:** The splash screen hook has minimum duration logic but it's not actually used in the app flow.

**Impact:** Splash screen timing is inconsistent and the minimum duration feature is wasted.

**AI Fix Prompt:**

```
Integrate the useSplashScreen hook with its minimum duration logic into the actual app flow. Current issues:

1. `useSplashScreen` hook with duration logic exists but isn't used
2. Splash timing is handled with setTimeout instead of the hook
3. Minimum duration feature is not utilized
4. Inconsistent splash screen timing across the app

Requirements:
- Integrate useSplashScreen hook into the main app flow
- Use the minimum duration logic to ensure consistent splash timing
- Replace setTimeout-based splash timing with the hook
- Ensure smooth transitions regardless of app initialization speed
- Add proper loading state management through the hook
- Make splash timing configurable and consistent

Connect the splash screen components to use the designed hook system for proper timing management.
```

---

## 🔄 Async Operation Issues

### Issue #15: Basic Error Handling in AuthForm

**File:** `src/features/auth/components/AuthForm.tsx`

**Description:** Auth operations in the form have basic error handling that doesn't cover all error scenarios.

**Impact:** Users may not see proper error messages for various failure scenarios.

**AI Fix Prompt:**

```
Enhance error handling in AuthForm to cover all authentication error scenarios. Current issues:

1. Basic try-catch with generic error handling
2. No specific handling for different error types (network, validation, auth)
3. Limited user feedback for various error scenarios
4. No retry mechanisms for transient failures

Requirements:
- Add specific error handling for different auth error types
- Provide user-friendly error messages for each scenario
- Add retry logic for network-related failures
- Handle validation errors with field-specific feedback
- Add loading states that persist until operations complete
- Implement proper error recovery flows
- Add logging for debugging authentication issues

Create comprehensive error handling that provides clear user feedback and recovery options for all authentication scenarios.
```

---

### Issue #16: Missing Profile Data in useAuthForm

**File:** `src/features/auth/hooks/useAuthForm.ts`

**Description:** The useAuthForm hook doesn't pass profile data to signUp even though it collects fullName.

**Impact:** User profile data may not be properly created during signup.

**AI Fix Prompt:**

```
Fix the useAuthForm hook to properly pass profile data to the signUp operation. Current issues:

1. Hook collects fullName but doesn't pass it to signUp
2. Profile data structure may be inconsistent
3. Signup might not create complete user profiles
4. No validation of profile data before submission

Requirements:
- Ensure useAuthForm passes all collected profile data to signUp
- Add validation for profile data fields
- Ensure consistent profile data structure
- Add error handling for profile data validation
- Make profile data collection extensible for future fields
- Add proper type safety for profile data

Connect the form data collection to the signup process to ensure complete user profiles are created.
```

---

## 📱 Feature Flag Issues

### Issue #17: Runtime Feature Flag Crashes

**File:** `src/config/features.ts`

**Description:** Feature flags are checked at runtime but some components assume features are enabled, potentially causing crashes.

**Impact:** App crashes when features are disabled or when environment variables are missing.

**AI Fix Prompt:**

```
Add comprehensive feature flag validation and error handling to prevent crashes. Current issues:

1. Components assume features are enabled without checking flags
2. No validation of feature flag dependencies
3. Runtime crashes when features are disabled
4. No graceful degradation for disabled features

Requirements:
- Add feature flag validation at app startup
- Implement graceful degradation for disabled features
- Add dependency checking between related features
- Provide clear error messages for configuration issues
- Add runtime guards in components that use optional features
- Create fallback UI for disabled features
- Add comprehensive feature flag documentation

Create a robust feature flag system that prevents crashes and provides graceful degradation.
```

---

### Issue #18: Inconsistent Supabase Configuration Checking

**Description:** The app checks for Supabase configuration in multiple places with different approaches, leading to inconsistent behavior.

**Impact:** Auth functionality may work in some parts of the app but not others.

**AI Fix Prompt:**

```
Standardize Supabase configuration checking across the entire app. Current issues:

1. Different files check Supabase config differently
2. Some use empty string returns, others check environment variables directly
3. Some use `isSupabaseConfigured()` helper, others don't
4. Inconsistent behavior between components

Requirements:
- Create a single, centralized configuration checking system
- Use consistent configuration validation across all components
- Add proper error handling for missing configuration
- Provide clear setup instructions when configuration is missing
- Add development-time warnings for configuration issues
- Ensure all auth-related components use the same configuration check
- Add configuration validation at app startup

Create a unified configuration system that ensures consistent behavior across the entire application.
```

---

## 🎯 Summary

These 18 issues represent critical problems that could cause:

- App crashes and instability
- Poor user experience
- Authentication failures
- Memory leaks and performance issues
- Inconsistent behavior across the app

Each issue includes a detailed AI prompt that can be used with any AI coding assistant to implement the fix. The prompts are designed to be comprehensive and provide specific requirements for robust solutions.

**Priority Order for Fixes:**

1. Issues #1-4 (Critical Issues) - Fix immediately
2. Issues #5-6 (Memory Leaks) - Fix before production
3. Issues #7-12 (State/Session Management) - Fix for reliability
4. Issues #13-16 (Timing/Async) - Fix for user experience
5. Issues #17-18 (Feature Flags) - Fix for maintainability
