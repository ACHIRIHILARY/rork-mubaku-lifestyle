# Provider Service Management Flow

## Overview
This document outlines the complete flow for providers to create and manage their services in the application.

## API Configuration

### Base URL
- **Production**: `https://mubakulifestyle.com/api/v1`
- All API endpoints are relative to this base URL

### Key Endpoints Fixed
All endpoints now correctly use the base URL without duplication:
- Auth: `/auth/jwt/create/`, `/auth/users/me/`
- Services: `/services/`, `/services/create/`, `/services/{id}/update/`
- Users: `/users/`, `/users/apply-provider/`
- Appointments: `/appointments/`, `/appointments/availability/`

## Provider Registration & Approval Flow

### 1. User Registration
- New users register as "clients" by default
- Navigate to: Login → Register
- Required fields: username, email, first_name, last_name, password

### 2. Apply to Become a Provider
- **Location**: Profile Tab → "Become a Service Provider" card
- **Endpoint**: `POST /users/apply-provider/`
- **Required Fields**:
  - `service_categories`: Array of category IDs (selected from dropdown)
  - `business_name`: Optional
  - `business_address`: Optional
  - `description`: Optional
  - `years_of_experience`: Optional
  - `certifications`: Optional array
  - `portfolio_urls`: Optional array
  - `availability_schedule`: Optional
  - `base_price`: Optional
  - `emergency_contact`: Optional
  - `latitude`, `longitude`: Optional

### 3. Admin Approval
- Admins review applications in their admin dashboard
- Endpoint: `POST /users/{id}/verify-provider/`
- Status changes from "pending" → "approved"
- User's role changes from "client" → "provider"

### 4. Application Status Check
- **Endpoint**: `GET /users/application-status/`
- **Statuses**: 
  - `pending`: Under review
  - `approved`: Can create services
  - `rejected`: Application denied
  - `withdrawn`: User canceled application

## Service Management for Approved Providers

### Accessing Service Management
Once approved, providers will see:
1. **Profile Tab** → "Manage My Services" button (green card)
2. **Navigates to**: `/provider-services`

### Service Creation
1. Navigate to Provider Services screen
2. Tap the "+" button (top right)
3. Fill in service details:
   - **Name** (required): e.g., "Professional Hair Styling"
   - **Description** (optional): Service details
   - **Category** (required): Select from available categories
   - **Duration** (required): In minutes (e.g., 40)
   - **Price** (required): Service cost (e.g., 12000.00)
   - **Currency**: Fixed to "XAF"
   - **Status**: Auto-set to `is_active: true`

4. **API Call**: `POST /services/create/`
```json
{
  "name": "Professional Hair Styling",
  "description": "Expert hair cutting, styling, and treatment",
  "category": 3,
  "duration_minutes": 40,
  "price": 12000.00,
  "currency": "XAF",
  "is_active": true
}
```

### Service Management Features
**Provider Services Screen** (`/provider-services`):
- View all your services
- Search services by name/description
- See service statistics:
  - Total services
  - Active services
  - Total bookings
  - Total revenue
  - Average rating

**Per Service Actions**:
1. **Toggle Status**: Activate/deactivate service
2. **Edit**: Modify service details (`/provider-services/edit?id={serviceId}`)
3. **Delete**: Remove service (with confirmation)

### Service Display on Home Screen
Active services from approved providers automatically appear on:
- **Home Tab** → "Available Services" section
- Services can be filtered by:
  - Category
  - Search query
  - Provider verification status (only verified by default)

## User Interface Flow

### For Approved Providers:
```
Login 
  → Profile Tab
    → See "Manage My Services" button
    → Tap to navigate to `/provider-services`
      → View existing services
      → Tap "+" to create new service
        → Fill form
        → Submit
        → Service appears in list
        → Service appears on Home screen for all users
```

### For Clients/Users:
```
Login
  → Home Tab
    → See "Available Services"
    → Tap service card
      → View service details
      → Book appointment
```

## Service Categories
Categories are fetched from: `GET /services/categories/`
- Categories are displayed as selectable chips in the create/edit form
- Each service must belong to exactly one category
- Categories enable filtering and organization

## Key Features

### Service Statistics
Providers can track:
- Number of services created
- Active vs inactive services
- Total bookings received
- Revenue generated
- Average customer rating

### Service Visibility
Services appear on home screen when:
- ✅ Provider is verified/approved
- ✅ Service `is_active = true`
- ✅ Service has valid category
- ✅ Service has price and duration set

### Search & Filtering
Home screen supports:
- Text search (name/description)
- Category filtering
- Multiple filters simultaneously
- Clear all filters option

## Troubleshooting

### "Cannot see Manage Services button"
**Possible causes**:
1. User role is not "provider"
2. Application status is not "approved"
3. User logged in as client

**Solution**: Check application status in Profile tab

### "Services not appearing on home screen"
**Possible causes**:
1. Service is inactive (`is_active = false`)
2. Provider not verified
3. Invalid category assigned

**Solution**: 
- Check service status in Provider Services screen
- Ensure provider is approved
- Verify service has valid category

### "API 404 errors"
**Cause**: Double `/api/v1` in URL

**Solution**: Fixed in latest update. Base URL is now correctly set to `https://mubakulifestyle.com/api/v1` with all endpoints relative to this base.

## Technical Implementation

### State Management
- **Redux Toolkit**: Authentication state, tokens
- **RTK Query**: API calls, caching
- **React Query**: Alternative for future optimization

### API Structure
```typescript
// Service API endpoints
useGetAllServicesQuery()          // Get all services (with filters)
useGetMyServicesQuery()            // Get provider's services
useCreateServiceMutation()         // Create new service
useUpdateServiceMutation()         // Update existing service
useDeleteServiceMutation()         // Delete service
useGetMyServiceStatsQuery()        // Get provider statistics

// Category API endpoints
useGetAllCategoriesQuery()         // Get all categories
```

### Authentication Flow
1. Login → Get JWT tokens
2. Store tokens in Redux
3. Add Bearer token to all API requests
4. Auto-refresh token on 401 errors

## Future Enhancements
- Image uploads for services
- Multiple service images
- Service packages/bundles
- Promotional pricing
- Service reviews and ratings
- Provider profile customization
