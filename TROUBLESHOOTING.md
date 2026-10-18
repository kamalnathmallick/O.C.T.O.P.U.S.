# Troubleshooting Guide - User Management Access

## Issue: "Failed to get users" Error

### Root Cause
After updating the role system from 2 roles to 4 roles, existing JWT tokens may not have the correct role information, or you may be logged in with a role that doesn't have access to user management.

---

## Solution Steps

### Step 1: Clear Browser Storage
1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear Local Storage
4. Clear Session Storage
5. Refresh the page

### Step 2: Log Out and Log Back In
1. Click the logout button in the dashboard
2. Return to the login page
3. Select **Admin** or **Manager** role
4. Log in with appropriate credentials:
   - **Admin:** admin@octopus.com / <your-admin-password>
   - **Manager:** manager@octopus.com / <your-manager-password>

### Step 3: Verify Access
After logging in with Admin or Manager:
- Navigate to Users page
- Should now load successfully
- Can view all users in the system

---

## Role-Based Access Control

### User Management Access

| Role | View Users | Create Users | Update Users | Delete Users |
|------|-----------|--------------|--------------|--------------|
| **Admin** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Manager** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Technician** | ❌ No | ❌ No | ❌ No | ❌ No |
| **Operator** | ❌ No | ❌ No | ❌ No | ❌ No |

### Why Technician and Operator Can't Access Users Page
- **Security:** User management is restricted to administrative roles
- **Separation of Duties:** Technicians and Operators focus on equipment, not user administration
- **Data Privacy:** Prevents unauthorized access to user information

---

## Technical Details

### Updated API Endpoints

```typescript
// backend/src/routes/userRoutes.ts

// Now accessible by ADMIN and MANAGER
router.get('/', authorize(['ADMIN', 'MANAGER']), getUsers);
router.get('/operators/numbers', authorize(['ADMIN', 'MANAGER']), getOperatorNumbers);
router.put('/:id', authorize(['ADMIN', 'MANAGER']), updateUser);

// Still ADMIN only
router.post('/operators/numbers', authorize(['ADMIN']), createOperatorNumber);
router.post('/operator', authorize(['ADMIN']), createOperator);
router.delete('/:id', authorize(['ADMIN']), deleteUser);
router.post('/:id/reset-password', authorize(['ADMIN']), resetPassword);
```

### JWT Token Structure

When you log in, the backend generates a JWT token containing:
```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "role": "ADMIN" // or "MANAGER", "TECHNICIAN", "OPERATOR"
}
```

The role in the token determines which API endpoints you can access.

---

## Verification Checklist

After following the solution steps, verify:

- [ ] Logged out completely
- [ ] Cleared browser storage
- [ ] Logged back in as Admin or Manager
- [ ] Can access Users page without errors
- [ ] Can see list of all users
- [ ] Backend server is running on port 5000
- [ ] Frontend server is running on port 3000

---

## Still Having Issues?

### Check Backend Logs
Look at the backend terminal for error messages:
```bash
# Should see successful requests
GET /api/users 200
```

### Check Browser Console
Look for:
- Network errors (Failed to fetch)
- 403 Forbidden errors (wrong role)
- 401 Unauthorized errors (invalid token)

### Verify Database
Ensure users exist with correct roles:
```bash
cd backend
npx prisma studio
# Check users table - should see 4 users with different roles
```

### Restart Servers
If all else fails:
```bash
# Stop both servers (Ctrl+C)

# Restart backend
cd backend
npm run dev

# Restart frontend (in new terminal)
cd frontend
npm run dev
```

---

## Expected Behavior

### For Admin Users:
- ✅ Can access all dashboard pages
- ✅ Can view, create, update, and delete users
- ✅ Can manage operator numbers
- ✅ Can reset passwords
- ✅ Full system access

### For Manager Users:
- ✅ Can access most dashboard pages
- ✅ Can view and update users
- ✅ Can view operator numbers
- ❌ Cannot create or delete users
- ❌ Cannot reset passwords

### For Technician Users:
- ✅ Can access equipment-related pages
- ✅ Can view and update maintenance tasks
- ✅ Can view machines and sensors
- ❌ Cannot access user management

### For Operator Users:
- ✅ Can access basic dashboard pages
- ✅ Can view machines and sensors
- ✅ Can acknowledge alerts
- ❌ Cannot access user management
- ❌ Cannot modify system settings

---

## Quick Test

To quickly test if the fix worked:

1. **Log in as Admin:**
   - Email: admin@octopus.com
   - Password: <your-admin-password>
   - Role: Admin
   - Navigate to Users → Should work ✅

2. **Log in as Manager:**
   - Email: manager@octopus.com
   - Password: <your-manager-password>
   - Role: Manager
   - Navigate to Users → Should work ✅

3. **Log in as Technician:**
   - Email: tech@octopus.com
   - Password: <your-technician-password>
   - Role: Technician
   - Navigate to Users → Should show "Access Denied" or hide menu item

4. **Log in as Operator:**
   - Email: operator@octopus.com
   - Password: <your-operator-password>
   - Role: Operator
   - Navigate to Users → Should show "Access Denied" or hide menu item

---

## Summary

The "Failed to get users" error occurs when:
1. You're logged in with a role that doesn't have access (Technician/Operator)
2. Your JWT token is outdated and doesn't include the correct role
3. You haven't logged out and back in after the role system update

**Solution:** Log out, clear storage, and log back in as Admin or Manager.

---

**Last Updated:** 2026-05-29
**Version:** 2.0.0