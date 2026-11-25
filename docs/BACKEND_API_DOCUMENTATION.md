# BlogSphere — Backend API Documentation

## 1. Project Overview

BlogSphere is a full-stack blogging platform powered by Node.js, Express.js, and MongoDB.

The backend provides REST API endpoints for:
- User registration and login
- Google authentication
- Blog creation and management
- Published blog discovery
- User profile management
- Authentication and authorization

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MongoDB | Database |
| Mongoose | MongoDB object modelling |
| JSON Web Token (JWT) | Authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| Helmet | HTTP security headers |
| express-rate-limit | Request rate limiting |

## 3. Base URL

**Development URL:**

`http://localhost:5001`

**API prefix:**

`/api`

All API endpoints listed below use the `/api` prefix.

## 4. Authentication API

Base route: `/api/auth`

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Log in using email and password |
| POST | `/api/auth/google` | Public | Authenticate using Google |

### Registration

**Endpoint:** `POST /api/auth/register`

Request body:

```json
{
  "name": "Example User",
  "email": "user@example.com",
  "password": "your-password"
}
```

Validation:
- Name must contain 2–50 characters.
- Email must be valid.
- Password must contain 8–128 characters.

### Login

**Endpoint:** `POST /api/auth/login`

Request body:

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

Validation:
- Email must be valid.
- Password is required.

### Google Login

**Endpoint:** `POST /api/auth/google`

This endpoint handles Google authentication.

The exact request payload is determined by the Google login controller.

## 5. Blog API

Base route: `/api/blogs`

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/api/blogs` | Public | Retrieve published blogs |
| GET | `/api/blogs/mine` | Required | Retrieve the authenticated user's blogs |
| GET | `/api/blogs/:slug` | Public | Retrieve a published blog by slug |
| POST | `/api/blogs` | Required | Create a blog |
| PATCH | `/api/blogs/:id` | Required | Update an owned blog |
| DELETE | `/api/blogs/:id` | Required | Delete an owned blog |

### Published Blogs

**Endpoint:** `GET /api/blogs`

Retrieves published blog posts.

The controller supports pagination, category filtering, and search.

### My Blogs

**Endpoint:** `GET /api/blogs/mine`

Returns blog posts belonging to the authenticated user.

### Retrieve Blog by Slug

**Endpoint:** `GET /api/blogs/:slug`

Retrieves an individual published article using its slug.

### Create Blog

**Endpoint:** `POST /api/blogs`

Requires authentication.

The blog controller requires the article's title, excerpt, and content. It also supports publication status and other blog model fields.

### Update Blog

**Endpoint:** `PATCH /api/blogs/:id`

Requires authentication.

Only the owner of the blog can update it.

### Delete Blog

**Endpoint:** `DELETE /api/blogs/:id`

Requires authentication.

Only the owner of the blog can delete it.

## 6. User Profile API

Base route: `/api/users`

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/api/users/me` | Required | Retrieve own profile |
| PATCH | `/api/users/me` | Required | Update own profile |

### Get Profile

**Endpoint:** `GET /api/users/me`

Returns the authenticated user's profile information.

### Update Profile

**Endpoint:** `PATCH /api/users/me`

Supports updating the following profile fields:

- Name
- Bio
- Avatar

## 7. Authentication Header

Protected endpoints require a valid JWT access token.

Include the token in the HTTP request header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Do not share access tokens or store them in public repositories.

## 8. Error Handling

The backend uses HTTP status codes to communicate request results.

| Status | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Invalid request or validation failure |
| 401 | Authentication required or invalid |
| 404 | Resource not found |
| 409 | Duplicate resource conflict |
| 500 | Internal server error |

The actual response body depends on the endpoint and error condition.

## 9. Security Features

The backend includes:

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes
- Blog ownership verification
- Input validation
- Helmet security headers
- API rate limiting
- Environment-based configuration
- Centralized error handling

## 10. Running the Backend

Navigate to the backend directory:

```powershell
cd backend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Run automated tests:

```powershell
npm test
```

Check dependency vulnerabilities:

```powershell
npm audit
```

## 11. Environment Configuration

Create a private `.env` file using `.env.example` as a template.

The backend uses environment configuration for:

- Server port
- Node environment
- Frontend client URL
- Google Client ID
- MongoDB connection string
- JWT secret
- JWT expiration

Never publish actual credentials, database connection strings, or JWT secrets.

---

**Project:** BlogSphere
**Module:** Backend API
**Framework:** Express.js
**Database:** MongoDB
**Documentation Status:** Initial API reference
