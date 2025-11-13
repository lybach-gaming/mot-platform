# User Preferences Implementation (Locale & Timezone)

## Overview
This document outlines the implementation of user preferences for locale and timezone across the MOT platform.

## Implementation Summary

### 1. Affiliate API (NestJS + TypeORM + PostgreSQL)

#### Database Schema
- **Migration**: `1760500000000-AddMissingUserColumns.ts`
  - Added `timezone` column (varchar, nullable)
  - Added `country` column (varchar, nullable)
  - Added `referral_slug` column (varchar, nullable, unique)
  - Added `payout_currency` column (varchar, nullable)
  - Added `privacy` column (json, nullable)
  - Created unique index on `referral_slug`

#### Entity Updates
- **File**: `affiliate-api/src/app/user/user.entity.ts`
  - Existing fields: `locale` (default: 'en'), `timezone`
  - Both fields are already defined in the UserEntity

#### Service Layer
- **File**: `affiliate-api/src/app/user/user.service.ts`
  - `UpdateSettingsDto` interface includes both `locale` and `timezone`
  - `updateSettings()` method handles preference updates

#### API Endpoints
- **File**: `affiliate-api/src/app/user/user.controller.ts`
  - `GET /user/me/preferences` - Get user preferences
  - `PATCH /user/me/preferences` - Update user preferences

### 2. Main API (NestJS + Knex + MySQL)

#### Database Schema
- **Migration**: `20251104_add_locale_timezone_to_users.js`
  - Added `locale` column (varchar(10), default: 'en')
  - Added `timezone` column (varchar(50), nullable)

#### Schema Constants
- **File**: `api/src/core/database/schemas/users.schema.ts`
  - Added `LOCALE` and `TIMEZONE` fields to `USERS_SCHEMA.FIELDS`

#### Type Definitions
- **File**: `api/src/core/database/types/users.type.ts`
  - Added `locale?: string` and `timezone?: string` to `IUser` interface

#### Service Layer
- **File**: `api/src/app/account/account.service.ts`
  - Added `updateUserPreferences()` method to update locale and timezone
  - Updated `getUserById()` to include locale and timezone in the query

#### API Endpoints
- **File**: `api/src/app/account/account.controller.ts`
  - `PATCH /v2/update-user-preferences` - Update user preferences

#### DTOs
- **File**: `api/src/app/account/dto/update-user-preferences.dto.ts`
  - Created `UpdateUserPreferencesDto` with validation for locale and timezone

### 3. Influencer Web (Next.js + React + TypeScript)

#### Type Definitions
- **File**: `influencer-web/src/types/user.ts`
  - Added `country?: string` and `timezone?: string` to `User` interface
  - Added `country?: string` and `timezone?: string` to `CreateUserRequest` interface
  - Added `timezone?: string` to `UserSettings` interface

#### UI Components
- **File**: `influencer-web/src/components/UserSettings.tsx`
  - Added "Regional Preferences" section
  - Added timezone selector with popular timezone options
  - Includes 15 common timezones (US, Europe, Asia, Australia, UTC)
  - User-friendly labels (e.g., "Eastern Time (ET)", "Tokyo (JST)")

#### Hooks
- **File**: `influencer-web/src/hooks/useUser.ts`
  - Updated `useUserSettings()` hook to include timezone in the settings object

## Features

### Locale Support
- **Default**: English ('en')
- **Available Languages**:
  - English (en)
  - Spanish (es)
  - French (fr)
  - German (de)
  - Japanese (ja)
  - Korean (ko)
  - Chinese (zh)

### Timezone Support
- **Available Timezones**:
  - America/New_York (Eastern Time)
  - America/Chicago (Central Time)
  - America/Denver (Mountain Time)
  - America/Los_Angeles (Pacific Time)
  - Europe/London (GMT/BST)
  - Europe/Paris (CET/CEST)
  - Europe/Berlin (CET/CEST)
  - Asia/Tokyo (JST)
  - Asia/Seoul (KST)
  - Asia/Shanghai (CST)
  - Asia/Hong_Kong (HKT)
  - Asia/Singapore (SGT)
  - Australia/Sydney (AEDT/AEST)
  - Pacific/Auckland (NZDT/NZST)
  - UTC

## API Usage Examples

### Affiliate API

#### Get User Preferences
```bash
GET /user/me/preferences
Authorization: Bearer <token>
```

#### Update User Preferences
```bash
PATCH /user/me/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "locale": "en",
  "timezone": "America/New_York"
}
```

### Main API

#### Update User Preferences
```bash
PATCH /v2/update-user-preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "locale": "en",
  "timezone": "America/Los_Angeles"
}
```

## Migration Instructions

### Affiliate API (PostgreSQL)
```bash
cd affiliate-api
npm run migration:run
```

### Main API (MySQL)
```bash
cd api
npx knex migrate:latest
```

## Testing

All files have been checked for ESLint compliance:
- ✅ No linter errors found
- ✅ All TypeScript types are properly defined
- ✅ All React components follow best practices

## Notes

1. **Backward Compatibility**: Both `locale` and `timezone` fields are optional/nullable, ensuring backward compatibility with existing users.

2. **Default Values**: 
   - `locale` defaults to 'en' (English)
   - `timezone` is nullable (no default)

3. **Frontend Integration**: The UI components are ready to use but will need to be connected to actual API endpoints once the user authentication is integrated.

4. **Extensibility**: The implementation is designed to be easily extended with additional locales and timezones as needed.

## Future Enhancements

1. Add more language options based on user demand
2. Implement automatic timezone detection based on browser/IP
3. Add locale-specific formatting for dates, numbers, and currencies
4. Implement i18n/internationalization library integration
5. Add user preferences persistence in browser localStorage/sessionStorage
6. Create admin panel for managing available locales and timezones

