# Admin Dashboard - Setup & Authentication Guide

## 🔐 Admin Authentication Overview

The Admin Dashboard is now **protected** and only accessible to users with the `admin` role. 

### Default Admin Credentials:
- **Email:** `patelyash47597@gmail.com`
- **Password:** `admin@123` (will be set during setup)

---

## 📋 Setup Instructions

### Step 1: Run Backend Setup Script
Before accessing the admin dashboard, you must initialize the admin user.

In your terminal, navigate to the backend directory and run:

```bash
cd backend
node setupAdmin.js
```

**Expected Output:**
```
🔐 Starting admin setup...
✅ Connected to MongoDB
📝 Creating new admin user...
✅ Admin user created!

============================================================
✅ ADMIN SETUP COMPLETE!
============================================================
Email: patelyash47597@gmail.com
Password: admin@123
Role: admin
============================================================

📌 You can now login to the Admin Dashboard at /admin
   with these credentials.
```

### Step 2: Start Backend Server
```bash
npm start
```
The server should start on `http://localhost:5000`

### Step 3: Start Frontend App
```bash
npm run dev
```
The app should start on `http://localhost:5173` (or similar)

### Step 4: Login to Admin Dashboard
1. Go to your app and click **Login**
2. Enter admin credentials:
   - **Email:** `patelyash47597@gmail.com`
   - **Password:** `admin@123`
3. Click **Login**
4. You'll be redirected to `/admin` dashboard ✅

---

## 🚀 Usage

### Admin Dashboard Features:
✅ View all complaints  
✅ Filter by category and status  
✅ Update complaint status  
✅ View complaint details  
✅ Pagination support  

### Access Control:
- ✅ Only `patelyash47597@gmail.com` can access admin dashboard
- ✅ Regular users cannot access `/admin` route
- ✅ Attempting to access `/admin` without admin role shows "Access Denied" message
- ✅ Non-authenticated users are redirected to login

---

## 🔄 Changing Admin Password

### Option 1: Using Forgot Password Flow
1. Go to Login page  
2. Click "Forgot password?"
3. Enter `patelyash47597@gmail.com`
4. Use the reset token to set new password
5. Login with new password

### Option 2: Running Setup Script Again
```bash
cd backend
# Edit setupAdmin.js to change the adminPassword variable
# Change line: const adminPassword = "admin@123"; 
# to your new password

node setupAdmin.js
```

---

## 🛡️ Security Features

✅ **Password Hashing**: Passwords are hashed with bcrypt (10 salt rounds)  
✅ **JWT Authentication**: Secure token-based authentication  
✅ **Role-Based Access Control**: Admin role required for /admin route  
✅ **Email Validation**: User must have exact email match  
✅ **Password Reset**: Temporary tokens with 1-hour expiration  

---

## 🧪 Testing Admin Access

### Test Case 1: Admin Login (Should Work)
```
Email: patelyash47597@gmail.com
Password: admin@123
Expected: Redirected to /admin dashboard ✅
```

### Test Case 2: Regular User Tries Admin Access (Should Fail)
```
Email: user@example.com
Password: userpassword123
Action: Try accessing /admin manually
Expected: Shows "Access Denied" message ✅
```

### Test Case 3: Non-Authenticated Access (Should Redirect)
```
Action: Go to /admin without login
Expected: Redirected to /login ✅
```

### Test Case 4: Logout & Re-login
```
Action: Login as admin → Use dashboard → Logout → Try to access /admin
Expected: Redirected to /login ✅
```

---

## 📝 API Endpoints

### Admin Setup Endpoint
```
POST /api/auth/setup-admin
Content-Type: application/json

{
  "email": "patelyash47597@gmail.com",
  "password": "admin@123"
}

Response (Success):
{
  "message": "Admin user setup successful!",
  "admin": {
    "_id": "...",
    "email": "patelyash47597@gmail.com",
    "role": "admin"
  }
}
```

### Login Endpoint (Admin)
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "patelyash47597@gmail.com",
  "password": "admin@123"
}

Response (Success):
{
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "name": "Admin Dashboard",
    "email": "patelyash47597@gmail.com",
    "role": "admin"
  }
}
```

---

## 📂 Modified Files

| File | Change |
|------|--------|
| `backend/routes/authRoutes.js` | Added `POST /api/auth/setup-admin` endpoint |
| `backend/setupAdmin.js` | New script to initialize admin user |
| `src/App.jsx` | Protected `/admin` route with `adminOnly={true}` |
| `src/components/ProtectedRoute.jsx` | Enhanced error handling for non-admin users |

---

## ⚠️ Important Notes

1. **Run Setup Script FIRST** before trying to login as admin
2. **Email is case-insensitive** (patelyash47597@gmail.com works the same as PATELYASH47597@GMAIL.COM)
3. **Password is case-sensitive**
4. **Tokens expire after 7 days** - user will need to re-login
5. To add more admins, edit setupAdmin.js and modify the adminEmail variable

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Access Denied" when trying to access /admin | Run `node setupAdmin.js` first to create admin user |
| "Invalid credentials" when logging in | Check email/password match exactly, verify setup script ran |
| Redirected to login page when accessing /admin | Make sure you're logged in with admin account |
| Can't see admin dashboard after login | Clear browser cache and refresh, or re-run setup script |
| "Email is already registered" error | The admin email must be unique in database |

---

## 🎯 Next Steps

1. ✅ Run backend setup script (`node setupAdmin.js`)
2. ✅ Start backend server (`npm start`)
3. ✅ Start frontend (`npm run dev`)  
4. ✅ Login as admin with `patelyash47597@gmail.com` and `admin@123`
5. ✅ Access `/admin` dashboard

---

**Status:** ✅ Admin Dashboard Authentication Enabled  
**Version:** 1.0  
**Last Updated:** 2024
