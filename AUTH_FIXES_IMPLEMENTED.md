# Authentication & Admin Redirect Fixes - Implementation Summary

## Overview
This document summarizes the comprehensive authentication fixes implemented to resolve token persistence, automatic token refresh, and admin redirect issues.

## Problems Fixed

### 1. **Token Persistence**
- **Problem**: Tokens were stored in AsyncStorage but never loaded on app restart, causing users to appear logged out
- **Solution**: 
  - Added `initializeAuth` thunk to load tokens from AsyncStorage on app startup
  - Added `isInitialized` flag to auth state to track initialization status
  - Root layout now dispatches `initializeAuth` before hiding splash screen
  - Automatically fetches user data if tokens are found

### 2. **Automatic Token Refresh**
- **Problem**: No automatic retry on 401 errors, causing perceived "logouts"
- **Solution**:
  - Implemented `baseQueryWithReauth` wrapper around base query
  - Automatically detects 401 errors
  - Attempts to refresh access token using stored refresh token
  - Retries original request with new token
  - Logs out user only if refresh fails

### 3. **Admin Login Redirect**
- **Problem**: Login used unreliable `setTimeout` to wait for user data, causing inconsistent admin redirects
- **Solution**:
  - Added `useEffect` hook to watch for user data after login
  - Waits for both `user` and `isAuthenticated` to be set
  - Includes 5-second timeout fallback
  - Shows different welcome message for admins
  - Redirects admins to `/(tabs)/admin` and regular users to `/(tabs)/home`

### 4. **Android Tab Bar Visibility**
- **Problem**: Tab bar potentially off-screen or non-functional on Android devices
- **Solution**:
  - Improved tab bar height calculation for Android
  - Better safe area inset handling
  - Added elevation shadow for Android
  - Platform-specific padding adjustments

### 5. **SafeAreaProvider**
- **Problem**: Missing SafeAreaProvider causing inset issues
- **Solution**: Wrapped root layout with SafeAreaProvider

## Files Modified

### 1. `store/authSlice.ts`
- Added `isInitialized` to auth state
- Created `initializeAuth` async thunk
- Added `extraReducers` to handle initialization
- Exported `User` type

```typescript
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
    return null;
  }
);
```

### 2. `store/api.ts`
- Implemented `baseQueryWithReauth` for automatic token refresh
- Handles 401 errors by:
  1. Attempting token refresh
  2. Retrying original request
  3. Logging out if refresh fails

```typescript
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt refresh and retry...
  }

  return result;
};
```

### 3. `app/_layout.tsx`
- Added `SafeAreaProvider` wrapper
- Dispatches `initializeAuth` on mount
- Fetches user data if tokens are found
- Hides splash screen after initialization

```typescript
const result = await store.dispatch(initializeAuth()).unwrap();

if (result) {
  store.dispatch(authApi.endpoints.getCurrentUser.initiate());
}
```

### 4. `app/login.tsx`
- Removed unreliable `setTimeout` approach
- Added `useEffect` to watch for user data
- Implements proper state management with `waitingForUser`
- Includes timeout fallback (5 seconds)
- Shows loading states during authentication
- Logs detailed information for debugging

```typescript
useEffect(() => {
  if (waitingForUser && user && isAuthenticated) {
    const isAdmin = user.role === 'admin' || user.admin === true;
    const destination = isAdmin ? '/(tabs)/admin' : '/(tabs)/home';
    
    Alert.alert('Welcome Back!', ..., [
      {
        text: 'Continue',
        onPress: () => router.replace(destination)
      }
    ]);
  }
}, [waitingForUser, user, isAuthenticated]);
```

### 5. `app/(tabs)/_layout.tsx`
- Improved tab bar height calculation for Android
- Better safe area inset handling
- Added elevation shadow
- Platform-specific styling

## Testing Recommendations

### 1. Token Persistence
- [ ] Login, close app completely, reopen → should remain logged in
- [ ] Check console for "Auth tokens loaded from storage" message
- [ ] Verify user data is fetched automatically

### 2. Token Refresh
- [ ] Wait for token to expire (or manually invalidate)
- [ ] Make an API request
- [ ] Check console for "Access token expired, attempting refresh..." message
- [ ] Verify request succeeds after refresh

### 3. Admin Redirect
- [ ] Login with superuser credentials
- [ ] Verify console shows: "Redirecting admin user to: /(tabs)/admin"
- [ ] Confirm admin tab is active after login
- [ ] Check that alert mentions "admin dashboard"

### 4. Regular User Redirect
- [ ] Login with regular user credentials
- [ ] Verify redirect to `/(tabs)/home`
- [ ] Confirm admin tab is not visible

### 5. Android Tab Bar
- [ ] Test on Android device/emulator
- [ ] Verify tab bar is fully visible
- [ ] Check tabs are clickable and functional
- [ ] Test with different Android system navigation modes

## Debugging Tips

### Console Logs to Monitor
1. **App Startup**:
   - "Auth tokens loaded from storage, fetching user data..."
   - "No stored auth tokens found"

2. **Login Flow**:
   - "Login successful, waiting for user data..."
   - "User data loaded after login: {...}"
   - "Redirecting admin/non-admin user to: ..."

3. **Token Refresh**:
   - "Access token expired, attempting refresh..."
   - "Token refreshed successfully, retrying original request..."
   - "Token refresh failed, logging out user"

### Common Issues

**Issue**: Admin still redirected to home
- **Check**: Console shows user data with `role: 'admin'` or `admin: true`
- **Check**: Backend serializer correctly sets these fields for superusers
- **Solution**: Verify Django superuser creation sets custom user fields

**Issue**: User appears logged out on restart
- **Check**: Tokens are in AsyncStorage (use React Native Debugger)
- **Check**: `initializeAuth` is called on app startup
- **Solution**: Check for AsyncStorage errors in console

**Issue**: 401 errors not refreshing
- **Check**: `baseQueryWithReauth` is being used
- **Check**: Refresh token is valid
- **Solution**: Verify refresh endpoint `/api/v1/auth/jwt/refresh/` works

## Next Steps

1. Monitor user behavior after deployment
2. Consider adding token expiry time tracking
3. Implement refresh token rotation if needed
4. Add metrics for token refresh success rate
5. Consider adding biometric authentication

## Security Notes

- Tokens are stored in AsyncStorage (consider more secure storage like Keychain/Keystore for production)
- Refresh tokens should have longer expiry than access tokens
- Consider implementing refresh token rotation
- Add rate limiting on refresh endpoint
- Monitor for suspicious refresh patterns

## Backend Requirements

For these fixes to work properly, ensure your Django backend:
1. Correctly sets `role` and `admin` fields when creating superusers
2. Refresh token endpoint works correctly
3. Token expiry times are reasonable (e.g., 15 min access, 7 days refresh)
4. Returns consistent user data structure

## Additional Improvements Implemented

- Added TypeScript strict typing for error handling
- Improved error messages in login flow
- Added loading states for better UX
- Enhanced console logging for debugging
- Platform-specific UI adjustments
