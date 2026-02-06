# OAuth Setup Guide - Google & Apple Sign In

This guide will walk you through setting up OAuth credentials for both Google and Apple Sign In.

---

## 📋 Prerequisites

- Google account (Gmail)
- Apple Developer account (for Apple Sign In - requires paid membership $99/year)
- MongoDB database (local or cloud like MongoDB Atlas)

---

## 🔵 Part 1: Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "My OAuth App")
5. Click **"Create"**
6. Wait for the project to be created and select it

### Step 2: Enable Google+ API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"People API"**
3. Click on it and click **"Enable"**

> **Note:** Google+ API is deprecated, but you can also use **"Google Identity API"** or **"People API"** for OAuth.

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: Your application name
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"Save and Continue"**
6. On **"Scopes"** page, click **"Add or Remove Scopes"**
   - Add: `email`, `profile`, `openid`
   - Click **"Update"** → **"Save and Continue"**
7. On **"Test users"** (if in testing mode), add test email addresses
8. Click **"Save and Continue"** → **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Give it a name (e.g., "Web Client")
5. **Authorized JavaScript origins**:
   - Add: `http://localhost:3000`
   - Add your production URL if applicable (e.g., `https://yourdomain.com`)
6. **Authorized redirect URIs**:
   - Add: `http://localhost:3000/auth/google/callback`
   - Add your production callback URL if applicable (e.g., `https://yourdomain.com/auth/google/callback`)
7. Click **"Create"**
8. **IMPORTANT**: Copy the **Client ID** and **Client Secret** immediately
   - You won't be able to see the Client Secret again!

### Step 5: Add Google Credentials to .env

Add these to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

---

## 🍎 Part 2: Apple Sign In Setup

> **Important**: Apple Sign In requires an **Apple Developer account** ($99/year). You cannot set this up without it.

### Step 1: Access Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Sign in with your Apple Developer account
3. Go to **"Certificates, Identifiers & Profiles"**

### Step 2: Create an App ID

1. Click on **"Identifiers"** in the left sidebar
2. Click the **"+"** button to create a new identifier
3. Select **"App IDs"** → Click **"Continue"**
4. Select **"App"** → Click **"Continue"**
5. Fill in:
   - **Description**: Your app name
   - **Bundle ID**: Use reverse domain notation (e.g., `com.yourcompany.yourapp`)
6. Scroll down and check **"Sign In with Apple"** capability
7. Click **"Continue"** → **"Register"**

### Step 3: Create a Service ID

1. Still in **"Identifiers"**, click the **"+"** button again
2. Select **"Services IDs"** → Click **"Continue"**
3. Fill in:
   - **Description**: Your service name (eam., "My OAuth Service")
   - **Identifier**: Use reverse domain notation (e.g., `com.yourcompany.yourapp.service`)
4. Check **"Sign In with Apple"** → Click **"Continue"** → **"Register"**
5. Click on the newly created Service ID
6. Check **"Sign In with Apple"** → Click **"Configure"**
7. **Primary App ID**: Select the App ID you created in Step 2
8. **Website URLs**:
   - **Domains and Subdomains**: `localhost` (for development) or your domain
   - **Return URLs**: 
     - `http://localhost:3000/auth/apple/callback` (for development)
     - `https://yourdomain.com/auth/apple/callback` (for production)
9. Click **"Save"** → **"Continue"** → **"Save"**

**IMPORTANT**: Copy the **Service ID** (Identifier) - this is your `APPLE_CLIENT_ID`

### Step 4: Create a Key for Sign In with Apple

1. Go to **"Keys"** in the left sidebar
2. Click the **"+"** button to create a new key
3. Fill in:
   - **Key Name**: "Sign In with Apple Key" (or any name)
   - Check **"Sign In with Apple"** capability
4. Click **"Continue"** → **"Register"**
5. **IMPORTANT**: 
   - Copy the **Key ID** - this is your `APPLE_KEY_ID`
   - Click **"Download"** to download the `.p8` private key file
   - **You can only download this once!** Save it securely.

### Step 5: Get Your Team ID

1. In the top right corner of Apple Developer Portal, click on your account name
2. Your **Team ID** is displayed there (e.g., `ABC123DEF4`)
3. Copy this - this is your `APPLE_TEAM_ID`

### Step 6: Prepare Apple Private Key

1. Open the downloaded `.p8` file in a text editor
2. Copy the entire contents including:
   ```
   -----BEGIN PRIVATE KEY-----
   [key content here]
   -----END PRIVATE KEY-----
   ```
3. You'll need to format this as a single line with `\n` for newlines in your `.env` file

### Step 7: Add Apple Credentials to .env

Add these to your `.env` file:

```env
APPLE_CLIENT_ID=com.yourcompany.yourapp.service
APPLE_TEAM_ID=ABC123DEF4
APPLE_KEY_ID=XYZ789ABC1
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----"
APPLE_CALLBACK_URL=http://localhost:3000/auth/apple/callback
```

> **Note**: The `APPLE_PRIVATE_KEY` should be in quotes and use `\n` for line breaks, or you can put it all on one line.

---

## 🔐 Part 3: Other Required Environment Variables

### JWT Configuration

Generate a secure random string for JWT secret:

```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env`:
```env
AUTH_JWT_SECRET=your_generated_secret_here
AUTH_JWT_EXPIRATION_TIME=1h
```

### Database Configuration

For MongoDB Atlas (cloud):
```env
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=your_database_name
```

For local MongoDB:
```env
DATABASE_URI=mongodb://localhost:27017
DATABASE_NAME=your_database_name
```

### Optional Configuration

```env
APP_PORT=3000
NODE_ENV=development
SWAGGER_GENERATE_DOCUMENTATION=true
LOG_TO_CONSOLE=true
LOG_TO_FILE=false
```

---

## ✅ Part 4: Create .env File

### Step 1: Create .env.example file

Create a file named `.env.example` in your project root with the following content:

```env
# ============================================
# APPLICATION CONFIGURATION
# ============================================
APP_PORT=3000
NODE_ENV=development
APP_RELEASE=1
APP_REQUEST_LOGGING=true

# ============================================
# DATABASE CONFIGURATION
# ============================================
# MongoDB Connection String
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
# For Local MongoDB: mongodb://localhost:27017
DATABASE_URI=mongodb://localhost:27017
DATABASE_NAME=oauth_app_db

# ============================================
# JWT AUTHENTICATION CONFIGURATION
# ============================================
# Generate a secure random string: openssl rand -base64 32
AUTH_JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
AUTH_JWT_EXPIRATION_TIME=1h
AUTH_MAX_SESSIONS=5
AUTH_ACCESS_TOKEN_RENEW_EXPIRE_TIME=3600000

# ============================================
# GOOGLE OAUTH CONFIGURATION
# ============================================
# Get these from: https://console.cloud.google.com/
# 1. Go to APIs & Services > Credentials
# 2. Create OAuth 2.0 Client ID
# 3. Copy Client ID and Client Secret
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# ============================================
# APPLE OAUTH CONFIGURATION
# ============================================
# Get these from: https://developer.apple.com/
# 1. Create Service ID (this is APPLE_CLIENT_ID)
# 2. Create Key with Sign In with Apple capability (get APPLE_KEY_ID)
# 3. Download .p8 file and copy its content (APPLE_PRIVATE_KEY)
# 4. Get Team ID from your account
# Note: Requires Apple Developer account ($99/year)
APPLE_CLIENT_ID=com.yourcompany.yourapp.service
APPLE_TEAM_ID=ABC123DEF4
APPLE_KEY_ID=XYZ789ABC1
# Private key from .p8 file - use \n for newlines or put on single line
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----"
APPLE_CALLBACK_URL=http://localhost:3000/auth/apple/callback

# ============================================
# SWAGGER DOCUMENTATION CONFIGURATION
# ============================================
SWAGGER_GENERATE_DOCUMENTATION=true
SWAGGER_APP_TITLE=NestJS Fastify OAuth API
SWAGGER_APP_DESCRIPTION=API documentation for NestJS Fastify OAuth project
SWAGGER_APP_VERSION=1
SWAGGER_API_PATH=api

# ============================================
# LOGGING CONFIGURATION
# ============================================
LOG_TO_CONSOLE=true
LOG_TO_FILE=false
LOG_FILE_NAME=logs/application.log
LOG_FILE_FREQUENCY=1d
LOG_FILE_DATE_FORMAT=YYYY-MM-DD
LOG_FILE_RETENTION_DAYS=30d
LOG_FILE_SIZE=100m
# LOG_FILE_EXTENSION=log (optional)
```

### Step 2: Create your .env file

Copy `.env.example` to `.env` and fill in all the actual values:

```bash
cp .env.example .env
```

Then edit `.env` and replace all placeholder values with your actual credentials.

---

## ✅ Part 5: Testing Your Setup

### 2. Start the application

```bash
npm run start:dev
```

### 3. Test Google OAuth

1. Open browser: `http://localhost:3000/auth/google`
2. You should be redirected to Google login
3. After login, you'll be redirected back with a JWT token

### 4. Test Apple OAuth

1. Open browser: `http://localhost:3000/auth/apple`
2. You should be redirected to Apple login
3. After login, you'll be redirected back with a JWT token

### 5. Check Swagger Documentation

1. Open: `http://localhost:3000/api`
2. You can test the endpoints from there

---

## 🚨 Troubleshooting

### Google OAuth Issues

- **"redirect_uri_mismatch"**: Make sure the callback URL in `.env` exactly matches the one in Google Console
- **"invalid_client"**: Check that Client ID and Secret are correct
- **"access_denied"**: Make sure OAuth consent screen is properly configured

### Apple OAuth Issues

- **"invalid_client"**: Verify Service ID, Team ID, and Key ID are correct
- **"invalid_grant"**: Check that the private key is properly formatted with `\n` for newlines
- **"unauthorized_client"**: Ensure the return URL in Apple Developer Portal matches your callback URL
- **Private key format**: Make sure the private key includes the full content with BEGIN/END markers

### General Issues

- **Environment variables not loading**: Make sure `.env` file is in the root directory
- **Database connection errors**: Verify MongoDB is running and connection string is correct
- **Port already in use**: Change `APP_PORT` in `.env` or stop the process using port 3000

---

## 📝 Quick Reference

### Google OAuth Required Values:
- `GOOGLE_CLIENT_ID` - From Google Cloud Console → Credentials
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console → Credentials
- `GOOGLE_CALLBACK_URL` - Your callback endpoint

### Apple OAuth Required Values:
- `APPLE_CLIENT_ID` - Service ID from Apple Developer Portal
- `APPLE_TEAM_ID` - Team ID from Apple Developer Portal
- `APPLE_KEY_ID` - Key ID from the downloaded key
- `APPLE_PRIVATE_KEY` - Content of the .p8 file (with \n for newlines)

---

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Apple Developer Portal](https://developer.apple.com/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)

---

**Need Help?** Check the error logs in your console or log files for specific error messages.

