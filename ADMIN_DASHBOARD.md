# Admin Dashboard - Implementation Guide

## Overview

The Admin Dashboard provides comprehensive administrative controls for the Mubaku Lifestyle mobile application. It allows administrators to manage provider applications, service categories, and user accounts through a secure, role-based interface.

## Features Implemented

### 1. Provider Application Management (`/admin/applications`)

**Capabilities:**
- View all provider applications with filtering (Pending/All)
- Approve provider applications
- Decline provider applications
- View applicant details (email, phone, location)
- Pull-to-refresh functionality

**API Endpoints Used:**
- `GET /api/v1/users/applications/` - List all applications
- `POST /api/v1/users/{id}/verify-provider/` - Verify a provider
- `POST /api/v1/users/{user_id}/decline-provider/` - Decline a provider application

**Key Features:**
- Tab-based filtering (Pending/All)
- User profile display with avatar
- Status badges (pending, approved, declined)
- Confirmation dialogs for all actions
- Loading states and error handling
- Empty state handling

### 2. Service Category Management (`/admin/categories`)

**Capabilities:**
- View all service categories
- Create new categories
- Edit existing categories
- Delete categories
- Pull-to-refresh functionality

**API Endpoints Used:**
- `GET /api/v1/services/categories/` - List all categories
- `POST /api/v1/services/categories/create/` - Create category
- `PATCH /api/v1/services/categories/{category_id}/update/` - Update category
- `DELETE /api/v1/services/categories/{category_id}/delete/` - Delete category

**Key Features:**
- Modal-based create/edit forms
- Name and description fields
- Delete confirmation dialogs
- Icon-based category display
- Real-time updates after mutations

### 3. User Management (`/admin/users`)

**Capabilities:**
- View all users in the system
- Search users by name, email, or username
- Filter users by role (Client/Provider/Admin)
- Edit user details
- Update user roles
- Activate/deactivate user accounts

**API Endpoints Used:**
- `GET /api/v1/auth/users/` - List all users
- `GET /api/v1/auth/users/{pkid}/` - Get specific user
- `PATCH /api/v1/auth/users/{pkid}/` - Update user details
- `POST /api/v1/users/{user_id}/update-role/` - Update user role

**Key Features:**
- Real-time search functionality
- Role-based filtering with chips
- Comprehensive edit modal with all user fields
- Role selector (Client/Provider/Admin)
- Account status toggle
- Status badges and role indicators
- Bulk information display (email, phone, location)

## Architecture

### File Structure

```
app/
├── (tabs)/
│   ├── admin.tsx                 # Main admin dashboard (tab)
│   └── _layout.tsx              # Tabs layout with conditional admin tab
├── admin/
│   ├── _layout.tsx              # Admin section layout
│   ├── applications.tsx         # Provider applications screen
│   ├── categories.tsx           # Service categories screen
│   └── users.tsx                # User management screen
├── hooks/
│   └── useAdminGuard.ts         # Admin authentication hooks
└── store/
    └── services/
        └── adminApi.ts          # RTK Query admin API definitions
```

### API Integration

All admin API calls are centralized in `store/services/adminApi.ts` using RTK Query. This provides:
- Automatic caching
- Loading and error states
- Optimistic updates
- Cache invalidation
- TypeScript type safety

### Authentication & Authorization

**Admin Guard Hook (`useAdminGuard`):**
- Checks user authentication status
- Verifies admin role (`role === 'admin'` or `admin === true`)
- Redirects unauthorized users
- Can be used in any admin screen

**Conditional Tab Display:**
- Admin tab only visible to users with admin privileges
- Uses `href: isAdmin ? '/admin' : null` to hide tab
- Non-admin users cannot access admin routes

## Security Considerations

1. **JWT Token Authentication:**
   - All API requests include Bearer token
   - Token automatically added via RTK Query base query
   - Stored securely in Redux and AsyncStorage

2. **Role-Based Access Control:**
   - Server-side validation of admin role
   - Client-side checks prevent unauthorized access
   - Routes protected with `useAdminGuard` hook

3. **Permission Checks:**
   - Each screen verifies user role on mount
   - Redirects non-admin users immediately
   - 403 errors handled gracefully

## Usage Guide

### For Admins

1. **Accessing Admin Dashboard:**
   - Login with admin credentials
   - Navigate to "Admin" tab in bottom navigation
   - View three main sections: Applications, Categories, Users

2. **Managing Provider Applications:**
   - Select "Provider Applications"
   - Review pending applications in "Pending" tab
   - Click "Verify" to approve or "Decline" to reject
   - View all applications in "All" tab

3. **Managing Service Categories:**
   - Select "Service Categories"
   - Click "+" icon to create new category
   - Tap edit icon to modify category
   - Tap delete icon to remove category (with confirmation)

4. **Managing Users:**
   - Select "User Management"
   - Use search bar to find specific users
   - Filter by role using chip buttons
   - Click "Edit" to modify user details
   - Click "Activate/Deactivate" to change account status

### For Developers

1. **Adding New Admin Endpoints:**
   ```typescript
   // In store/services/adminApi.ts
   export const adminApi = api.injectEndpoints({
     endpoints: (builder) => ({
       newEndpoint: builder.mutation<ResponseType, RequestType>({
         query: (data) => ({
           url: '/api/v1/admin/new-endpoint/',
           method: 'POST',
           body: data,
         }),
         invalidatesTags: ['User'],
       }),
     }),
   });
   ```

2. **Creating New Admin Screens:**
   ```typescript
   // In app/admin/new-screen.tsx
   import { useAdminGuard } from '@/hooks/useAdminGuard';
   
   export default function NewAdminScreen() {
     useAdminGuard(); // Protect route
     // Your screen implementation
   }
   ```

3. **Adding to Dashboard:**
   ```typescript
   // In app/(tabs)/admin.tsx
   const menuItems = [
     // Add new menu item
     {
       id: 'new-feature',
       title: 'New Feature',
       description: 'Description',
       icon: IconComponent,
       route: '/admin/new-feature',
       color: '#COLOR',
     },
   ];
   ```

## API Request/Response Examples

### Verify Provider
```typescript
// Request
POST /api/v1/users/{userId}/verify-provider/
Body: {}

// Success Response
Status: 200 OK
```

### Create Category
```typescript
// Request
POST /api/v1/services/categories/create/
Body: {
  "name": "Hair Styling",
  "description": "Professional hair styling services"
}

// Success Response
Status: 201 Created
Body: {
  "id": "uuid",
  "name": "Hair Styling",
  "description": "Professional hair styling services",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Update User Role
```typescript
// Request
POST /api/v1/users/{userId}/update-role/
Body: {
  "role": "admin"
}

// Success Response
Status: 200 OK
Body: {
  "pkid": 123,
  "username": "user",
  "role": "admin",
  ...
}
```

## Error Handling

All admin screens implement comprehensive error handling:

1. **Network Errors:**
   - Display error message
   - Provide retry button
   - Log errors to console

2. **Permission Errors (403):**
   - Redirect to previous screen
   - Show alert message

3. **Validation Errors (400):**
   - Display specific error from API
   - Highlight problematic fields

4. **Server Errors (500):**
   - Generic error message
   - Retry option
   - Error logged for debugging

## Testing Checklist

- [ ] Admin tab only visible to admin users
- [ ] Non-admin users cannot access admin routes
- [ ] All API endpoints return expected data
- [ ] Loading states displayed during API calls
- [ ] Error messages shown for failed requests
- [ ] Confirmation dialogs prevent accidental actions
- [ ] Search and filtering work correctly
- [ ] Modal forms validate input
- [ ] Pull-to-refresh updates data
- [ ] Navigation works between all screens

## Future Enhancements

Potential features for future implementation:

1. **Analytics Dashboard:**
   - User growth metrics
   - Booking statistics
   - Revenue tracking

2. **Bulk Actions:**
   - Approve multiple applications
   - Bulk user role updates
   - Mass email notifications

3. **Activity Logs:**
   - Admin action history
   - User activity tracking
   - System audit trail

4. **Advanced Filtering:**
   - Date range filters
   - Multiple criteria filtering
   - Saved filter presets

5. **Export Functionality:**
   - CSV export for users
   - Report generation
   - Data backup tools

## Troubleshooting

### Admin Tab Not Showing
- Verify user has `role: "admin"` or `admin: true`
- Check token is valid and not expired
- Ensure `useIsAdmin` hook returns true

### API Calls Failing
- Verify token is being sent in headers
- Check API base URL is correct
- Confirm endpoint paths match backend
- Review server logs for specific errors

### Routes Not Working
- Ensure `app/admin/_layout.tsx` exists
- Verify Stack.Screen names match file names
- Check for TypeScript errors in console

## Support

For issues or questions about the Admin Dashboard:
1. Check console logs for detailed error messages
2. Verify API endpoint availability
3. Confirm user has proper admin role
4. Review this documentation for usage guidelines
