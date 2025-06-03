# First-Time Login Onboarding Flow

## Overview

When a user logs in with Lichess OAuth for the first time, they are automatically redirected to the onboarding page to set up their repertoire studies. Returning users go directly to the dashboard.

## Flow Diagram

```
Landing Page
     ↓ (Click "Connect with Lichess")
Lichess OAuth
     ↓ (User authorizes)
Auth Callback
     ↓ (Check onboarding status)
     ├─ First-time user → Onboarding Page
     └─ Returning user → Dashboard
```

## Implementation Details

### 1. AuthCallback (`/auth/callback`)

- Completes OAuth flow with Lichess
- Checks if user has completed onboarding using `hasCompletedOnboarding(userId)`
- Redirects to `/onboarding` for first-time users
- Redirects to `/dashboard` for returning users

### 2. OnboardingPage (`/onboarding`)

- Protected route (requires authentication)
- Uses `StudySelector` component for study URL input
- Saves study selections using `saveUserStudies()` utility
- Redirects to dashboard after completion

### 3. Onboarding Status Tracking

Currently uses localStorage (temporary solution):

- Key: `user_studies_${userId}`
- Value: `{ whiteStudyId, blackStudyId, completedAt, userId }`
- Will be replaced with Supabase in Task 7d

## Testing the Flow

### First-Time Login Test

1. **Clear onboarding status** (if testing with existing user):

   ```javascript
   // Open browser console and run:
   onboardingUtils.clearOnboardingStatus('your-lichess-user-id');
   ```

2. **Start fresh login**:

   - Go to landing page (`/`)
   - Click "Connect with Lichess"
   - Complete OAuth flow
   - Should redirect to `/onboarding`

3. **Complete onboarding**:
   - Enter study URLs (or use CORS-limited validation)
   - Click "Start Tracking Your Games"
   - Should redirect to `/dashboard`

### Returning User Test

1. **Login again** (after completing onboarding once):
   - Go to landing page (`/`)
   - Click "Connect with Lichess"
   - Complete OAuth flow
   - Should redirect directly to `/dashboard`

## Development Utilities

In development mode, onboarding utilities are exposed on `window.onboardingUtils`:

```javascript
// Check if user completed onboarding
onboardingUtils.hasCompletedOnboarding('user-id');

// Get user's saved studies
onboardingUtils.getUserStudies('user-id');

// Clear onboarding status (for testing)
onboardingUtils.clearOnboardingStatus('user-id');

// Save studies manually
onboardingUtils.saveUserStudies('user-id', 'white-study-id', 'black-study-id');
```

## Future Enhancements (Task 7d)

- Replace localStorage with Supabase database
- Add `onboarding_completed` field to user profiles
- Implement proper error handling for database operations
- Add loading states during save operations

## User Experience

### First-Time User Journey

1. **Landing Page**: "Connect with Lichess" → OAuth
2. **Auth Success**: "Welcome! Let's set up your repertoire..."
3. **Onboarding**: Study selection with progress indicator
4. **Completion**: "Start Tracking Your Games" → Dashboard

### Returning User Journey

1. **Landing Page**: "Connect with Lichess" → OAuth
2. **Auth Success**: "Welcome back! Redirecting to dashboard..."
3. **Dashboard**: Immediate access to app features

## Error Handling

- **OAuth failures**: Redirect to landing page with error message
- **Missing session**: Log error and prevent onboarding completion
- **Save failures**: Log error but don't block user (TODO: show user-facing error)

## Notes

- Onboarding page is a protected route (requires authentication)
- Study validation shows CORS warnings but allows progression
- Demo mode is available as alternative to real study setup
- All redirects include 2-second delays for better UX
