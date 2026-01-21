# Admin System Setup

This document explains how to create and manage admin users in the system.

## Overview

The system now includes a proper admin management system with:
- Database-backed admin users (no more hardcoded credentials)
- JWT-based authentication
- Role-based access control (SUPER_ADMIN, ADMIN, MODERATOR)
- Secure password hashing with bcrypt
- Session management

## Admin Roles

- **SUPER_ADMIN**: Can create other admins, full system access
- **ADMIN**: Standard admin access to all features
- **MODERATOR**: Limited admin access (future implementation)

## Creating the First Admin

### Method 1: Using the Script (Recommended)

1. Navigate to the project root directory
2. Run the admin creation script:
   ```bash
   node scripts/create-admin.js
   ```
3. Follow the prompts to enter:
   - Admin email
   - Admin name  
   - Admin password (minimum 8 characters)

The script will create a SUPER_ADMIN user who can then create other admins.

### Method 2: Direct Database Insert

If you have direct database access, you can manually insert an admin:

```sql
INSERT INTO admins (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin_' || generate_random_uuid(),
  'admin@yourdomain.com',
  'System Administrator',
  '$2a$12$hashedPasswordHere', -- Use bcrypt to hash your password
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);
```

## Admin API Endpoints

### Login
```
POST /api/v1/admin/login
Content-Type: application/json

{
  "email": "admin@yourdomain.com",
  "password": "yourpassword"
}
```

### Create New Admin (SUPER_ADMIN only)
```
POST /api/v1/admin/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "email": "newadmin@yourdomain.com",
  "name": "New Admin",
  "password": "securepassword",
  "role": "ADMIN"
}
```

### Validate Token
```
GET /api/v1/admin/validate
Authorization: Bearer <jwt_token>
```

### Logout
```
POST /api/v1/admin/logout
Authorization: Bearer <jwt_token>
```

## Environment Variables

Make sure your `.env` file includes:
```
JWT_SECRET=your-super-secret-jwt-key-here
```

## Security Notes

1. **Always use HTTPS in production**
2. **Use strong JWT secrets** (at least 32 characters)
3. **Passwords are hashed with bcrypt** (cost factor 12)
4. **JWT tokens expire after 24 hours**
5. **Sessions are tracked in the database** for better security

## Migration

The admin system requires the following database tables:
- `admins` - Admin user accounts
- `admin_sessions` - Active admin sessions

Run the migration:
```bash
cd apps/backend
npx prisma db push
```

## Troubleshooting

### "Admin with this email already exists"
- Check if the admin already exists in the database
- Use a different email address

### "Invalid email or password"
- Verify the email and password are correct
- Check if the admin account is active (`isActive = true`)

### "Super Admin access required"
- Only SUPER_ADMIN users can create other admins
- Make sure you're using a SUPER_ADMIN token

### Database connection issues
- Verify your `DATABASE_URL` in the `.env` file
- Ensure the database is running and accessible