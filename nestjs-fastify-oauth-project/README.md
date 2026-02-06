# NestJS Fastify OAuth Project

A NestJS backend application built with Fastify and OAuth authentication (Google & Apple Sign In).

## Features

- ✅ **Fastify** - High-performance HTTP server
- ✅ **OAuth Authentication** - Google and Apple Sign In (no username/password)
- ✅ **JWT Tokens** - Secure access tokens
- ✅ **MongoDB** - Database with Mongoose
- ✅ **Swagger Documentation** - API documentation
- ✅ **Structured Logging** - Pino logger with file rotation
- ✅ **Request Validation** - Class-validator
- ✅ **Response Transformation** - Standardized API responses
- ✅ **Rate Limiting** - Throttler protection
- ✅ **CORS** - Cross-origin resource sharing

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or remote)
- Google OAuth credentials
- Apple OAuth credentials (optional)

## Installation

1. Clone or navigate to the project directory:
```bash
cd nestjs-fastify-oauth-project
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (see `.env.example` for template):
```bash
# Create .env file manually or copy from .env.example
```

4. **📖 Follow the detailed setup guide**: See [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md) for complete step-by-step instructions on:
   - Setting up Google OAuth credentials
   - Setting up Apple OAuth credentials
   - Configuring all environment variables
   - Testing your setup

## Quick Setup Overview

### Generate JWT Secret
```bash
node scripts/generate-jwt-secret.js
```

### Required Environment Variables
- Database connection (MongoDB)
- JWT secret (generate using script above)
- Google OAuth credentials (Client ID & Secret)
- Apple OAuth credentials (Service ID, Team ID, Key ID, Private Key)

> **For detailed instructions**, see [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md)

## Running the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/apple` - Initiate Apple OAuth login
- `GET /auth/apple/callback` - Apple OAuth callback
- `GET /auth/profile` - Get current user profile (requires JWT)

### Users

- `GET /users` - Get all users (requires JWT)
- `GET /users/:id` - Get user by ID (requires JWT)
- `POST /users` - Create user
- `PATCH /users/:id` - Update user (requires JWT)
- `DELETE /users/:id` - Delete user (requires JWT)

## Swagger Documentation

Once the app is running, access Swagger UI at:
```
http://localhost:3000/api
```

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── guards/          # Auth guards
│   ├── strategies/       # OAuth strategies (Google, Apple, JWT)
│   └── auth.controller.ts
├── user/                # User module
│   ├── dto/            # Data transfer objects
│   ├── schemas/        # Mongoose schemas
│   └── user.controller.ts
├── config/              # Configuration classes
├── config-module/       # Custom config module
├── helpers/             # Helper utilities
│   ├── response-mapping/
│   └── schema-transform/
└── main.ts              # Application entry point
```

## Environment Variables

See `.env.example` for all required environment variables.

## Key Differences from Express Version

1. **Fastify Adapter** - Uses `@nestjs/platform-fastify` instead of Express
2. **Request/Response** - FastifyRequest and FastifyReply instead of Express types
3. **CORS** - Uses `@fastify/cors` plugin
4. **Performance** - Fastify is faster than Express

## Development

```bash
# Run in development mode with watch
npm run start:dev

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## License

UNLICENSED



