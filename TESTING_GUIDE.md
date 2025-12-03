# Testing Guide - Mubaku Lifestyle API Integration

## 🧪 Quick Test

### 1. Start the App
```bash
npm start
# or
bun start
```

### 2. Test Login Flow

#### Test Credentials
```
Email: superuser@gmail.com
Password: 123456789
```

#### Expected Behavior:
1. Open the app → Should show Language Selection screen
2. Navigate to Login screen
3. Enter test credentials
4. Click "Login" button
5. Should see loading spinner
6. Should redirect to Home screen
7. Home screen should display:
   - Welcome message with user's first name
   - Categories (if available in backend)
   - Services list (if available in backend)

---

## 🔍 Debugging

### Check Console Logs

#### Successful Login:
```
Login success response:
{
  access: "eyJ0eXAiOiJKV1QiLCJh...",
  refresh: "eyJ0eXAiOiJKV1QiLCJh..."
}

User data fetched:
{
  pkid: 1,
  username: "superuser",
  email: "superuser@gmail.com",
  first_name: "Super",
  last_name: "User",
  role: "admin",
  ...
}

Home screen loaded:
{
  user: { ... },
  servicesCount: 5,
  categoriesCount: 3
}
```

#### Failed Login:
```
Login error:
{
  status: 401,
  data: { detail: "No active account found with the given credentials" }
}
```

---

## 🔗 API Endpoints Being Called

### On Login:
1. `POST https://mubakulifestyle.com/api/v1/auth/jwt/create/`
   - Body: `{ email, password }`
   - Response: `{ access, refresh }`

2. `GET https://mubakulifestyle.com/api/v1/auth/users/me/`
   - Headers: `Authorization: Bearer {access_token}`
   - Response: User object

### On Home Screen Load:
1. `GET https://mubakulifestyle.com/api/v1/auth/users/me/`
   - Get current user data

2. `GET https://mubakulifestyle.com/api/v1/services/`
   - Get all services

3. `GET https://mubakulifestyle.com/api/v1/services/categories/`
   - Get all categories

---

## 🐛 Common Issues & Solutions

### Issue 1: 404 Not Found
**Symptoms:**
- Login fails with 404 error
- URL shows double `/api/v1/api/v1/`

**Solution:**
- ✅ This has been fixed
- Base URL is now: `https://mubakulifestyle.com`
- All endpoints include full path: `/api/v1/...`

### Issue 2: Network Request Failed
**Symptoms:**
- App shows "Network request failed"
- No data loads

**Possible Causes:**
1. Backend server is down
2. No internet connection
3. CORS issues (Web only)

**Solutions:**
- Check if backend is up: Visit `https://mubakulifestyle.com/api/v1/` in browser
- Check internet connection
- For web: Ensure backend has CORS enabled

### Issue 3: No Services/Categories Display
**Symptoms:**
- Login works
- Home screen loads
- Shows "No services available"

**Possible Causes:**
1. Backend has no data yet
2. Services are marked as inactive

**Solutions:**
- Check backend admin panel
- Create test services via Django admin
- Verify services have `is_active=True`

### Issue 4: Token Expired
**Symptoms:**
- Login works initially
- After some time, API calls fail with 401

**Solution:**
- Token refresh is implemented
- Use `useRefreshTokenMutation()` to refresh token
- Or logout and login again

---

## 📱 Testing on Different Platforms

### iOS Simulator
```bash
npm start
# Press 'i' for iOS simulator
```

### Android Emulator
```bash
npm start
# Press 'a' for Android emulator
```

### Web Browser
```bash
npm start
# Press 'w' for web
```

### Physical Device (QR Code)
```bash
npm start
# Scan QR code with Expo Go app
```

---

## 🔐 Testing Different User Roles

### Admin User (Provided)
```
Email: superuser@gmail.com
Password: 123456789
Role: admin
```

### Create Test Provider
1. Register new account
2. Navigate to role selection
3. Select "Provider"
4. Fill provider profile details
5. Wait for admin approval (or approve via Django admin)

### Create Test Client
1. Register new account
2. Navigate to role selection
3. Select "Client"
4. Fill client profile details

---

## 🧪 API Testing with Postman/Thunder Client

### Get JWT Token
```http
POST https://mubakulifestyle.com/api/v1/auth/jwt/create/
Content-Type: application/json

{
  "email": "superuser@gmail.com",
  "password": "123456789"
}
```

### Get Current User
```http
GET https://mubakulifestyle.com/api/v1/auth/users/me/
Authorization: Bearer {your_access_token}
```

### Get All Services
```http
GET https://mubakulifestyle.com/api/v1/services/
Authorization: Bearer {your_access_token}
```

### Create Service (Provider only)
```http
POST https://mubakulifestyle.com/api/v1/services/create/
Authorization: Bearer {your_access_token}
Content-Type: application/json

{
  "category": "category-uuid",
  "name": "Women's Haircut",
  "description": "Professional haircut and styling",
  "duration_minutes": 60,
  "price": 15000,
  "currency": "XAF"
}
```

---

## 📊 Expected API Responses

### Successful Login Response
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### User Data Response
```json
{
  "pkid": 1,
  "username": "superuser",
  "email": "superuser@gmail.com",
  "first_name": "Super",
  "last_name": "User",
  "full_name": "Super User",
  "gender": "Male",
  "phone_number": "+237670000000",
  "profile_photo": "/media/profiles/default.png",
  "country": "CM",
  "city": "Douala",
  "role": "admin",
  "is_active": true,
  "is_verified_provider": false
}
```

### Services Response
```json
[
  {
    "id": "uuid",
    "provider": "provider-uuid",
    "category": "category-uuid",
    "name": "Women's Haircut",
    "description": "Professional haircut",
    "duration_minutes": 60,
    "price": 15000,
    "currency": "XAF",
    "is_active": true,
    "rating": 4.5,
    "total_bookings": 10,
    "category_details": {
      "id": "uuid",
      "name": "Hair Styling",
      "description": "..."
    }
  }
]
```

---

## ✅ Testing Checklist

### Authentication
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Token is stored in AsyncStorage
- [ ] Token is sent with API requests
- [ ] Can logout (token is cleared)
- [ ] Can change password
- [ ] Can request password reset

### Home Screen
- [ ] User data displays correctly
- [ ] Services list loads from API
- [ ] Categories list loads from API
- [ ] Empty state shows when no services
- [ ] Can click on service to view details
- [ ] Loading spinner shows while fetching

### Profile
- [ ] Can view own profile
- [ ] Can update profile information
- [ ] Profile photo placeholder works
- [ ] Can apply to become provider
- [ ] Can check application status

### Services (Provider)
- [ ] Provider can create services
- [ ] Provider can view own services
- [ ] Provider can update services
- [ ] Provider can delete services
- [ ] Provider can view service stats

### Appointments
- [ ] Can view available time slots
- [ ] Can create appointment
- [ ] Can confirm payment
- [ ] Can view my appointments
- [ ] Can cancel appointment
- [ ] Can reschedule appointment

---

## 🚨 Known Limitations

1. **Image Upload Not Implemented**
   - Profile photos currently use placeholders
   - Need to implement image picker and upload

2. **Payment Integration Not Complete**
   - Payment confirmation is API call only
   - No actual payment gateway integration

3. **Real-time Notifications Not Implemented**
   - Notifications screen uses mock data
   - Need to implement push notifications

4. **Search Functionality Not Active**
   - Search bar in home screen is UI only
   - Need to implement search API call

---

## 📞 Support

If tests fail:
1. Check console logs in Metro bundler
2. Check network requests in React Native Debugger
3. Verify backend is running
4. Check API endpoints in browser
5. Refer to `API_INTEGRATION.md` for endpoint details
6. Refer to `FIXES_SUMMARY.md` for what was fixed

---

## ✨ Success Indicators

Your API integration is working correctly if:
- ✅ Login redirects to home screen
- ✅ Home screen shows user's first name
- ✅ Services list loads (or shows empty state)
- ✅ Categories load (or shows nothing if empty)
- ✅ No 404 errors in console
- ✅ No TypeScript errors
- ✅ JWT token is in AsyncStorage

Happy Testing! 🎉
