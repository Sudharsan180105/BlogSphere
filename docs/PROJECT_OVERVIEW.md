# BlogSphere — Project Overview

## 1. Project Introduction

BlogSphere is a full-stack blogging platform built to let users create, manage, discover, and read blog articles through a modern web interface.

The application uses a React-based frontend and a Node.js/Express backend. MongoDB is used for persistent data storage through Mongoose.

The frontend includes an animated sign-in experience called Nexus Portal and a dashboard for the main blogging activities.

## 2. Project Objectives

- Provide account registration and sign-in.
- Support email/password authentication and Google sign-in.
- Allow authenticated users to create and manage their own blog articles.
- Allow visitors to discover and read published articles.
- Provide profile viewing and editing.
- Protect user-specific operations with authentication and ownership checks.
- Deliver a responsive interface with animated and 3D visual elements.

## 3. Main Features

### Authentication
- Email and password registration.
- Email and password login.
- Google sign-in integration.
- Remember-me session handling.
- Authenticated profile retrieval.
- Logout and client-side session cleanup.

### Blog Management
- Create blog articles.
- Retrieve published articles.
- Retrieve the signed-in user's own articles.
- Read an individual published article.
- Update and delete articles, subject to ownership checks.
- Support draft and published statuses.
- Support article categories, tags, excerpts, cover images, and reading-time metadata.

### Discovery and Reading
- Browse published blogs.
- Search and category filtering through the blog API.
- Open an individual article using its slug.
- Track article views through the article retrieval endpoint.

### User Profile
- Retrieve the authenticated user's profile.
- Update supported profile fields, including name, bio, and avatar.

### User Interface
- Dashboard overview.
- My Stories.
- Writing Studio.
- Article reading page.
- Discover and Search.
- Profile and Settings.
- Nexus Portal animated 3D login experience.

## 4. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 | Component-based user interface |
| Frontend tooling | Vite 8 | Development server and production build |
| Styling and animation | CSS, Framer Motion, GSAP | Interface styling and animation |
| 3D experience | Three.js, React Three Fiber, Drei | 3D login experience |
| Visual effects | Postprocessing | 3D scene effects |
| Smooth scrolling | Lenis | Smooth scrolling |
| Icons | Lucide React | Interface icons |
| API communication | Axios | HTTP requests from frontend |
| Backend | Node.js and Express | REST API |
| Database | MongoDB | Persistent application data |
| ODM | Mongoose | MongoDB models and database operations |
| Authentication | JSON Web Token and bcryptjs | Token-based authentication and password hashing |
| Google sign-in | Google OAuth integration | Google authentication |
| Security middleware | Helmet, CORS, express-rate-limit | HTTP security configuration and request limiting |
| Validation | express-validator | Request input validation |

## 5. Application Architecture

BlogSphere follows a frontend/backend architecture.

### Frontend

The React application runs through Vite. It manages the authentication interface, dashboard views, user interactions, and API communication.

Important frontend files include:

- `src/main.jsx` — application entry point and Google OAuth provider.
- `src/App.jsx` — authentication flow and main application rendering.
- `src/components/Dashboard.jsx` — dashboard interface.
- `src/components/NexusPortal.jsx` — lazy-loaded 3D login experience.
- `vite.config.js` — development server and API proxy configuration.

### Backend

The Express application exposes REST API routes for authentication, users, and blogs.

Main backend areas:

- `config/` — database connection configuration.
- `controllers/` — request handling and application logic.
- `middleware/` — authentication and request middleware.
- `models/` — Mongoose data models.
- `routes/` — API route definitions.
- `tests/` — automated API tests.
- `server.js` — Express application setup and server startup.

### Database Models

The application includes User and Blog models.

The User model stores account and profile information. The Blog model stores article information and its author reference.

## 6. Project Directory Structure

The main project is organized into separate frontend and backend applications, along with documentation.

```text
Project-1-BlogSphere/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── docs/
    ├── PROJECT_OVERVIEW.md
    ├── BACKEND_API_DOCUMENTATION.md
    ├── BACKEND_ARCHITECTURE.md
    └── FRONTEND_ARCHITECTURE.md
```

Note: Keep the documentation files in the `docs` directory already created in your project. The exact folder location should match your existing project organization.

## 7. Local Development Configuration

The current local development configuration uses:

| Service | Address |
|---|---|
| Frontend development server | `http://localhost:5173` |
| Backend API server | `http://localhost:5001` |
| Frontend API base path | `/api` |
| Vite API proxy target | `http://localhost:5001` |
| Vite production preview | Port `4173` |

The Vite development server forwards requests beginning with `/api` to the backend server.

## 8. Environment Variables

The backend uses environment variables for configuration. The frontend uses a Vite environment variable for the Google OAuth client ID.

### Backend environment variables

Configure these in the backend `.env` file:

- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `GOOGLE_CLIENT_ID`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### Frontend environment variable

- `VITE_GOOGLE_CLIENT_ID`

Use your own valid credentials in local environment files. Never commit `.env` files, database credentials, OAuth secrets, or JWT secrets to a public repository.

Use `.env.example` to document required variable names with safe placeholder values only.

## 9. Local Setup

Open two PowerShell terminals.

### Terminal 1 — Backend

Move into the backend directory:

```powershell
cd path\to\Project-1-BlogSphere\backend
```

Install dependencies:

```powershell
npm install
```

Create/configure the backend `.env` file using the required variable names listed above.

Start the backend in development mode:

```powershell
npm run dev
```

### Terminal 2 — Frontend

Move into the frontend directory:

```powershell
cd path\to\Project-1-BlogSphere\frontend
```

Install dependencies:

```powershell
npm install
```

Configure `VITE_GOOGLE_CLIENT_ID` in the frontend environment file.

Start the frontend:

```powershell
npm run dev
```

Open `http://localhost:5173` in your browser.

The backend must be running on port `5001` for API requests to work.

## 10. Useful Development Commands

### Backend

```powershell
npm run dev
npm test
npm audit
```

### Frontend

```powershell
npm run dev
npm run build
npm run lint
npm run preview
```

Run commands from the relevant `backend` or `frontend` directory.

## 11. API Overview

The backend API is grouped into three areas:

| Area | Base path | Purpose |
|---|---|---|
| Authentication | `/api/auth` | Registration and sign-in |
| Users | `/api/users` | Authenticated profile operations |
| Blogs | `/api/blogs` | Blog discovery and article management |

For endpoint methods, request details, and response information, see `BACKEND_API_DOCUMENTATION.md`.

## 12. Security Notes

- Passwords are handled using bcryptjs.
- Protected API routes require a valid Bearer token.
- The authentication middleware checks the token and active user.
- Blog update and delete operations check article ownership.
- Request validation is applied to authentication inputs.
- Helmet, CORS configuration, and rate limiting are included in the backend.
- Environment secrets must remain outside source control.

## 13. Testing and Quality Checks

The backend includes automated API tests using Node.js's built-in test runner.

The recorded backend test run completed 14 tests with no failures. Backend JavaScript syntax checks also passed for the files included in that check. A backend `npm audit` run reported zero vulnerabilities at the time it was checked.

Frontend production build and application QA checks were previously completed. Lighthouse results recorded during QA included Accessibility 100, Best Practices 100, SEO 82, and a mobile Performance score of 69. These are historical test results and may vary between runs and environments.

## 14. Documentation Index

| Document | Description |
|---|---|
| `PROJECT_OVERVIEW.md` | Project purpose, features, stack, setup, and quality notes |
| `BACKEND_API_DOCUMENTATION.md` | Backend API endpoint reference |
| `BACKEND_ARCHITECTURE.md` | Backend structure and implementation architecture |
| `FRONTEND_ARCHITECTURE.md` | Frontend structure, authentication, API integration, and UI architecture |

## 15. Current Project Status

BlogSphere has completed its main application implementation and a substantial round of frontend and backend quality checks.

Remaining project-closeout work should include reviewing the documentation against the final source tree, checking environment-example files and ignore rules, deciding whether temporary QA data should be removed, and completing the final project README.

Do not initialize or push the Git repository until the agreed four-project portfolio is complete.

## 16. Conclusion

BlogSphere is a full-stack blogging application combining a React frontend, Express REST API, and MongoDB database. It includes authentication, blog publishing and management, user profiles, discovery and reading features, and an animated 3D sign-in experience.

This overview is intended as the starting point for understanding, installing, and maintaining Project 1 of the internship portfolio.
