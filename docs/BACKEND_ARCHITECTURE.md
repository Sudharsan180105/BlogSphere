# BlogSphere — Backend Architecture Documentation

## 1. Architecture Overview

BlogSphere follows a modular backend architecture using Node.js, Express.js, and MongoDB.

The backend separates application responsibilities into configuration, middleware, routes, controllers, models, and utilities.

### Architecture Layers

1. Client Layer — React frontend communicates with the backend through REST APIs.
2. Server Layer — Express.js handles HTTP requests and responses.
3. Middleware Layer — Handles security, authentication, request parsing, logging, and rate limiting.
4. Routing Layer — Directs requests to the appropriate controllers.
5. Controller Layer — Implements application business logic.
6. Model Layer — Defines MongoDB document structures using Mongoose.
7. Database Layer — Stores users and blog articles in MongoDB.

## 2. Backend Technology Stack

| Technology | Responsibility |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | HTTP server and routing |
| MongoDB | NoSQL database |
| Mongoose | Database modelling and operations |
| JWT | User authentication |
| bcryptjs | Password hashing |
| Helmet | HTTP security headers |
| CORS | Cross-origin request configuration |
| Morgan | Development request logging |
| express-rate-limit | API request limiting |
| dotenv | Environment configuration |

## 3. Project Structure

```text
backend/
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── blogController.js
│   └── userController.js
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│   ├── Blog.js
│   └── User.js
│
├── routes/
│   ├── authRoutes.js
│   ├── blogRoutes.js
│   └── userRoutes.js
│
├── tests/
│   └── api.test.js
│
├── utils/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

## 4. Server Initialization

The main entry point is `server.js`.

Its responsibilities include:

- Loading environment variables.
- Creating the Express application.
- Configuring Helmet and CORS.
- Parsing JSON and URL-encoded requests.
- Enabling development request logging.
- Configuring general API rate limiting.
- Configuring additional authentication rate limiting.
- Registering API route groups.
- Handling unknown routes.
- Handling application errors.
- Connecting to MongoDB before starting the HTTP server.
- Performing graceful shutdown.

### Server Configuration

| Configuration | Value |
|---|---|
| Backend port | 5001 |
| Frontend development URL | http://localhost:5173 |
| JSON request size limit | 1 MB |
| General API limit | 100 requests per 15 minutes |
| Authentication limit | 10 unsuccessful requests per 15 minutes |
| MongoDB connection timeout | 10 seconds |

The server starts listening only after the MongoDB connection succeeds.

## 5. Database Connection

File: `config/db.js`

The application uses Mongoose to connect to MongoDB.

Connection configuration is supplied through the `MONGODB_URI` environment variable.

The connection process:

1. Checks whether the MongoDB URI is configured.
2. Attempts to connect to MongoDB.
3. Uses a 10-second server selection timeout.
4. Logs successful connection information.
5. Exits the application if the connection fails.

## 6. Middleware Architecture

### Helmet

Adds HTTP security headers.

### CORS

Allows cross-origin requests from the configured frontend URL and enables credentials.

### Express JSON Parser

Processes JSON request bodies with a 1 MB size limit.

### Morgan

Logs HTTP requests in development mode.

### API Rate Limiting

General API requests are limited to 100 requests per 15-minute window.

Authentication routes have an additional limit of 10 unsuccessful requests per 15-minute window.

### Authentication Middleware

File: `middleware/authMiddleware.js`

The `protect` middleware secures private API endpoints.

Authentication flow:

1. Reads the Authorization header.
2. Checks the Bearer token format.
3. Extracts the JWT.
4. Checks that the JWT secret is configured.
5. Verifies the token using `jwt.verify`.
6. Checks that the decoded payload contains a user ID.
7. Finds the corresponding user in MongoDB.
8. Verifies that the account is active.
9. Attaches the authenticated user to `req.user`.
10. Passes control to the next middleware or controller.

Invalid, missing, expired, or inactive-user credentials are rejected.

## 7. Controller Architecture

Controllers contain the business logic for each API group.

### Authentication Controller

File: `controllers/authController.js`

Responsibilities:

- User registration.
- Email and password login.
- Google authentication.
- Password hashing and verification.
- JWT generation.
- Authentication-related error handling.

### Blog Controller

File: `controllers/blogController.js`

Responsibilities:

- Creating blog articles.
- Retrieving published blogs.
- Searching and filtering articles.
- Retrieving the authenticated user's articles.
- Retrieving articles by slug.
- Updating owned articles.
- Deleting owned articles.
- Managing article publication status and view counts.

### User Controller

File: `controllers/userController.js`

Responsibilities:

- Retrieving the authenticated user's profile.
- Updating permitted profile fields.
- Validating profile information.
- Returning safe user information.

## 8. Database Models

The application uses two primary Mongoose models.

### User Model

File: `models/User.js`

| Field | Type | Description |
|---|---|---|
| name | String | User's display name |
| email | String | Unique email address |
| password | String | Hashed password; excluded from normal queries |
| googleId | String | Optional unique Google account identifier |
| authProvider | String | local, google, or both |
| avatar | String | Profile image reference |
| bio | String | User biography |
| role | String | user or admin |
| isActive | Boolean | Account activation status |
| timestamps | Date | Creation and update timestamps |

Password and Google ID fields are excluded from normal Mongoose query results using `select: false`.

### Blog Model

File: `models/Blog.js`

| Field | Type | Description |
|---|---|---|
| title | String | Article title |
| slug | String | Unique URL-friendly identifier |
| excerpt | String | Short article description |
| content | String | Full article content |
| coverImage | String | Article cover image reference |
| category | String | Article category |
| tags | Array | Article tags |
| status | String | draft or published |
| author | ObjectId | Reference to the User model |
| readingTime | Number | Estimated reading time in minutes |
| views | Number | Article view count |
| publishedAt | Date | Publication timestamp |
| timestamps | Date | Creation and update timestamps |

The Blog model calculates estimated reading time before validation, using approximately 200 words per minute.

## 9. Database Relationship

BlogSphere uses a one-to-many relationship between User and Blog.

- One user can create multiple blog articles.
- Each blog article belongs to one user.
- The `author` field in the Blog model references the User model through MongoDB ObjectId.

### Relationship Diagram

```text
┌──────────────────┐
│       USER       │
├──────────────────┤
│ _id              │
│ name             │
│ email            │
│ password         │
│ role             │
│ authProvider     │
└────────┬─────────┘
         │
         │ One-to-Many
         │
         ▼
┌──────────────────┐
│       BLOG       │
├──────────────────┤
│ _id              │
│ title            │
│ slug             │
│ content          │
│ category         │
│ status           │
│ author           │
│ views            │
└──────────────────┘
```

## 10. Request Lifecycle

A typical protected API request follows this sequence:

1. React frontend sends an HTTP request.
2. Express receives the request.
3. Global middleware processes security, CORS, and request parsing.
4. API rate limiting is applied.
5. Express identifies the matching route.
6. Authentication middleware validates the JWT when required.
7. The controller executes business logic.
8. Mongoose communicates with MongoDB.
9. The controller sends a JSON response.
10. The frontend processes the response.

## 11. Error Handling

The application includes:

- Request validation.
- Authentication error handling.
- Unknown-route handling.
- Centralized Express error handling.
- Appropriate HTTP response codes.
- Production-safe generic server error messages.

Detailed server error messages are restricted to development mode by the global error handler.

## 12. Security Architecture

Implemented security mechanisms include:

- JWT authentication.
- bcryptjs password hashing.
- Protected routes.
- Active-account verification.
- Blog ownership verification.
- Input validation.
- Helmet security headers.
- CORS origin restrictions.
- API rate limiting.
- Authentication rate limiting.
- Environment-based secrets.
- Production-safe error messages.

## 13. Application Health Monitoring

Endpoint:

`GET /api/health`

Returns application information, database connection state, environment, and timestamp.

The endpoint is used to check the API's operational status.

## 14. Graceful Shutdown

The server listens for `SIGTERM` and `SIGINT` signals.

During shutdown:

1. The HTTP server stops accepting new connections.
2. MongoDB disconnects.
3. Shutdown completion is logged.
4. The Node.js process exits.

## 15. Backend Quality Verification

The following checks have been completed:

| Verification | Result |
|---|---|
| Automated API tests | 14 passed |
| JavaScript syntax checks | 11 passed |
| npm dependency audit | 0 vulnerabilities |
| Blog ownership security tests | Passed |
| Backend structure inspection | Completed |

These results reflect the recorded development QA checks.

---

**Project:** BlogSphere
**Module:** Backend Architecture
**Runtime:** Node.js
**Framework:** Express.js
**Database:** MongoDB
**ODM:** Mongoose
**Documentation Status:** Initial architecture reference