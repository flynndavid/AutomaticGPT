# 🛠️ Auth State Refactor Plan

\_Last updated: <!--DATE_PLACEHOLDER-->

---

## 1 Problem Statement

Our Expo + Supabase app occasionally boots into a **white screen** or remains on the splash/loading state after the user signs in/out. Logs show:

```
[AUTH] Auth listener cleaned up successfully   // Provider remounts
[AUTH_LAYOUT] Auth state changed … isLoading: true
[AUTH] Failsafe timeout – clearing active operations: ["signIn"]
```

Key symptoms / root triggers:

| #   | Symptom                                                            | Root cause                                                                     |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| 1   | Double initial-session fetch (`getSession()` twice)                | `AuthProvider` mounts twice (React Strict Mode & fast-refresh)                 |
| 2   | UI waits for `activeOperations` to clear                           | We expect `onAuthStateChange` to fire but it sometimes doesn't (network, race) |
| 3   | 30-second watchdog or 10-second failsafe unblocks UI               | Indicates our own loading logic—not Supabase—is gating the screen              |
| 4   | Navigation relies on side-effectful `useEffect` + `router.replace` | Complex / fragile; fires before auth stabilises                                |

> The official Supabase RN / Expo pattern avoids all of this by **never** calling `getSession()` directly; it relies solely on the initial `onAuthStateChange('INITIAL_SESSION')` event (instant from AsyncStorage).

## 2 Goal

Implement a minimal, reliable auth-state flow that:

1. Uses `onAuthStateChange` as the single source of truth.
2. Renders the correct screen within ≤ 50 ms after AsyncStorage read.
3. Removes `activeOperations`, grace-timers and long watchdogs.
4. Works with React-Strict-Mode / Expo fast-refresh without duplication.
5. Keeps navigation declarative (Expo Router v5 `redirect` or equivalent).

## 3 Key References

- **Internal code**
  - `src/features/auth/components/AuthProvider.tsx` – current provider logic 📄
  - `src/app/_layout.tsx` – providers & navigation tree 📄
  - `src/app/index.tsx` – redirect wrapper 📄
- **External docs / examples**
  - Supabase RN guide (Nov 2023) – <https://dev.to/supabase/getting-started-with-react-native-authentication-2mpl>
  - Supabase `onAuthStateChange` reference – <https://supabase.com/docs/reference/javascript/auth-onauthstatechange>
  - Expo / Supabase example repo – <https://github.com/supabase-community/expo-auth>

---

## 4 Implementation Plan (High-Level)

### Stage 0 (Prep)

1. Create a feature branch: `git checkout -b auth/refactor-onAuthStateChange`.
2. Disable React-Strict-Mode _only_ if it blocks debugging; re-enable later.

### Stage 1 Slim AuthProvider

1. **Delete** manual `auth.getSession()` call.
2. Inside `useEffect`, register:
   ```ts
   const {
     data: { subscription },
   } = supabase.auth.onAuthStateChange(
     (event, session) => setSessionState(session) // local reducer
   );
   ```
3. Replace `state.isLoading` logic with a simple `bootstrapped` flag that is set _after_ the first callback (event === `INITIAL_SESSION`).
4. Remove `activeOperations`, grace-timers, 10 s watchdog.
5. Auth methods (`signIn`, `signUp`, `signOut`):
   - Call Supabase API.
   - Immediately return Promise result & **do not** set global loading; UI will update when listener fires.

### Stage 2 Guarantee Single Mount

1. Ensure `<AuthProvider>` sits **once** at the root in `_layout.tsx`.
2. Add guard:
   ```ts
   if (globalThis.__authProviderMounted) return children;
   globalThis.__authProviderMounted = true;
   ```
   (Only in dev; strip for prod.)

### Stage 3 Navigation Simplification

1. Remove `router.replace` side-effects in `src/app/index.tsx`.
2. With Expo Router v5 you can do:
   ```tsx
   import { useRootNavigationState } from 'expo-router';
   export const unstable_settings = {
     initialRouteName: '(auth)',
     redirect: (state) => (state.session ? '/(app)' : '/(auth)/welcome'),
   };
   ```
   (If still on v4, keep `<Redirect>` but rely on stable `session`.)

### Stage 4 AppState-Aware Auto-Refresh (optional)

1. Move start/stop token-refresh logic to `supabase.ts` per docs:
   ```ts
   AppState.addEventListener('change', (state) => {
     if (state === 'active') supabase.auth.startAutoRefresh();
     else supabase.auth.stopAutoRefresh();
   });
   ```
2. Remove our manual 1-minute refresh interval.

### Stage 5 Cleanup & Docs

1. Delete unused `activeOperations`, timers, old comments.
2. Update any custom hooks relying on `isLoading`.
3. Add a dev-screen or toast that displays the raw `event` stream for quick debugging.
4. Write migration notes in `docs/auth_state_refactor.md`.

---

## 5 Testing Checklist

| Step                     | Expected outcome                                               |
| ------------------------ | -------------------------------------------------------------- |
| Cold start (authed user) | Splash ≤ 1 s, immediate render of `(app)`                      |
| Cold start (anon user)   | Splash ≤ 1 s, immediate render of `(auth)/welcome`             |
| Sign In                  | After Promise resolves, UI redirects ≤ 300 ms, no white screen |
| Sign Out                 | Same as above                                                  |
| Toggle dev fast-refresh  | No duplicate "Auth listener cleaned up" logs                   |

Automated tests can subscribe to the provider and assert state changes.

---

## 6 Rollback Plan

If the new provider causes regressions:

1. `git revert` the feature branch or switch back to `main`.
2. Comment back in the old provider (kept in `AuthProvider.legacy.tsx`).
3. Re-enable `activeOperations` watchdog.

---

## 7 Timeline / Effort

- Stage 1 & 2: 1 dev-day (≈ 200 LOC changed).
- Stage 3: 0.5 day (depends on router version).
- Stage 4: 0.5 day.
- QA + docs: 0.5 day.

Total ≈ 2–3 dev-days.

---

## 8 Open Questions

- Are we okay dropping the granular `isLoading` UI for sign-in/up flows?  
  (Supabase examples don't show it.)
- Should we encrypt session storage (MMKV + SecureStore) before release?
- Expo Router version upgrade to v5 for declarative `redirect`?

> Answer these before implementation starts.
