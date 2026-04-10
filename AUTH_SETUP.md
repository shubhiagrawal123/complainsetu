# Authentication Setup Guide

## Backend Setup

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables:**
   Add these to your `.env` file in the backend folder:
   ```
   JWT_SECRET=your_super_secret_jwt_key_here
   MONGO_URI=your_mongodb_connection_string
   ```

3. **Start Backend:**
   ```bash
   npm start
   ```

## Frontend Setup

The authentication system is already integrated. The login/signup page includes:

- **Toggle between Login/Signup:** Users can switch between modes
- **Form Validation:** Client-side validation for passwords, emails
- **JWT Token Storage:** Secure token storage in localStorage
- **Protected Routes:** Dashboard and admin routes require authentication
- **Auto-redirect:** Successful login redirects to dashboard

## Features

- **Login Page:** `/login`
- **Protected Dashboard:** `/dashboard` (requires login)
- **Protected Admin:** `/admin` (requires admin role)
- **User Registration:** Create new accounts
- **Password Hashing:** Secure bcrypt password storage
- **JWT Authentication:** Token-based authentication

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

## Usage

1. Visit `/login` to access the login/signup page
2. New users can click "Sign Up" to create an account
3. Existing users can sign in with their credentials
4. After login, users are redirected to the dashboard
5. Admin users can access the admin panel

The system automatically checks for existing authentication on app load and protects sensitive routes.