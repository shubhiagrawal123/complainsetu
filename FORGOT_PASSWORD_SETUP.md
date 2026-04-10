# Forgot Password Feature - Setup & Testing Guide

## ✅ What Was Fixed

### Backend Changes:
1. **Added Forgot Password Endpoint** (`POST /api/auth/forgot-password`)
   - Accepts email address
   - Generates a temporary reset token (valid for 1 hour)
   - Returns the reset token for testing

2. **Added Reset Password Endpoint** (`POST /api/auth/reset-password`)
   - Accepts reset token and new password
   - Validates token expiration
   - Updates password in database (hashed)

3. **Updated User Model**
   - Added `passwordResetToken` field
   - Added `passwordResetExpire` field
   - Added `generatePasswordResetToken()` method

### Frontend Changes:
1. **Login Page Now Has Forgot Password Flow**
   - Click "Forgot password?" link from login
   - Enter email address
   - System generates and displays reset token
   - Enter token and new password to reset

## 🔄 How to Use (Testing)

### Step 1: Start the Server
```bash
cd backend
npm start
```

### Step 2: Open the App
- Go to your app and click **Login**
- Click **"Forgot password?"** link

### Step 3: Enter Email
- Enter the email of the account you want to reset
- Click **"Send Reset Link"**

### Step 4: Copy Reset Token
- System will display the reset token on screen
- Copy the token from the yellow box

### Step 5: Reset Password
1. Paste the token in the "Reset Token" field
2. Enter your **new password** (minimum 6 characters)
3. Confirm the new password
4. Click **"Reset Password"**

### Step 6: Login with New Password
- You'll be redirected to login
- Enter your email and **new password**
- You should now be able to login! ✅

## 💡 Testing Scenarios

### Scenario 1: Reset Password Works
```
1. Email: your@email.com
2. Get reset token
3. Enter new password: "password123"
4. Try to login with new password → Should work ✅
```

### Scenario 2: Old Password Doesn't Work
```
1. After reset, try old password
2. Should get "Invalid credentials" → Correct ✅
```

### Scenario 3: Invalid Token
```
1. Use a wrong/expired token
2. Should get "Invalid or expired reset token" error → Correct ✅
```

## 🚀 Production Notes

**IMPORTANT:** In the current testing version:
- Reset token is displayed on screen (for testing)
- In production, **NEVER show the token on screen**
- Instead, send token via email using nodemailer

### For Production Email Reset:
1. Uncomment email sending code in `backend/routes/authRoutes.js`
2. Update email template with reset link/token
3. Remove the `resetToken` from response body
4. Use your own domain for password reset link

## 📋 API Documentation

### Forgot Password Endpoint
```
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response (Success):
{
  "message": "Password reset token generated...",
  "resetToken": "abc123xyz...",
  "expiresIn": "1 hour"
}

Response (Error):
{
  "message": "User not found with this email."
}
```

### Reset Password Endpoint
```
POST http://localhost:5000/api/auth/reset-password
Content-Type: application/json

{
  "resetToken": "abc123xyz...",
  "newPassword": "newpassword123"
}

Response (Success):
{
  "message": "Password reset successful! You can now login with your new password."
}

Response (Error):
{
  "message": "Invalid or expired reset token."
}
```

## ✨ Features Implemented

✅ Password reset token generation  
✅ Token expiration (1 hour)  
✅ Password validation (min 6 chars)  
✅ Password hashing with bcrypt  
✅ Frontend UI for forgot password flow  
✅ Error handling for invalid/expired tokens  
✅ Success messages & redirects  

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "User not found" error | Check email is registered in system |
| Token expired | Note: Tokens expire after 1 hour, request new one |
| Password not updating | Check password length is min 6 characters |
| Can't login after reset | Try exact new password you set, check caps lock |

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** ✅ Ready for Testing
