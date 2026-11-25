# BlogSphere — Frontend Architecture Documentation

## 1. Project Overview

BlogSphere is a modern blogging platform frontend developed using React and Vite.

The frontend provides an interactive user interface for authentication, profile management, blog discovery, article creation, and dashboard operations.

The visual experience combines modern UI styling, animations, and a 3D Nexus Portal.

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend component development |
| Vite 8 | Development server and production build |
| React DOM | Rendering React components |
| Axios | Backend API communication |
| React Router DOM | Routing library dependency |
| Framer Motion | UI animations and transitions |
| GSAP | Advanced animation |
| Three.js | 3D graphics |
| React Three Fiber | React integration for Three.js |
| Drei | Three.js helper components |
| Postprocessing | Visual effects |
| Lenis | Smooth scrolling |
| Lucide React | Interface icons |
| Google OAuth | Google sign-in integration |

## 3. Frontend Folder Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── Dashboard.css
│   │   ├── NexusPortal.jsx
│   │   └── NexusPortalScene.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── dist/
├── node_modules/
├── src_backup_20261123_134647/
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## 4. Application Entry Point

File: `src/main.jsx`

Responsibilities:

- Imports React and React DOM.
- Imports the main App component.
- Loads global CSS.
- Reads the Google OAuth client ID from the Vite environment.
- Initializes Google OAuth using `GoogleOAuthProvider`.
- Renders the application inside React Strict Mode.

The application requires `VITE_GOOGLE_CLIENT_ID` to be configured.

## 5. Main Application Component

File: `src/App.jsx`

The App component manages the main authentication interface and dashboard rendering.

### Main Responsibilities

- Email and password login.
- Google sign-in.
- Authentication state management.
- Remember-me functionality.
- Token and user information storage.
- Loading and error states.
- User profile retrieval.
- Logout functionality.
- Conditional rendering of the dashboard.
- Lazy loading of the Nexus Portal.

### Authentication State

React `useState` manages:

- Email
- Password
- Remember-me preference
- Password visibility
- Login loading state
- Google login loading state
- Error messages
- Authenticated user information

### Authentication Storage

The application uses:

| Storage | Purpose |
|---|---|
| localStorage | Persistent authentication when Remember Me is enabled |
| sessionStorage | Session-based authentication when Remember Me is disabled |

Storage keys:

- `blogsphere_token`
- `blogsphere_user`

The application removes authentication information from the alternative storage location when saving a new session.

## 6. Authentication Integration

The frontend communicates with the backend through Axios.

### Email and Password Login

Endpoint:

`POST /api/auth/login`

The frontend:

1. Reads email and password.
2. Normalizes the email address.
3. Sends login credentials to the backend.
4. Receives the authentication token and user information.
5. Stores the authentication information.
6. Retrieves the latest user profile.
7. Displays the dashboard after successful authentication.

### Google Login

Endpoint:

`POST /api/auth/google`

The frontend uses:

- `@react-oauth/google`
- `GoogleOAuthProvider`
- `GoogleLogin`

Google authentication flow:

1. User selects Google sign-in.
2. Google returns a credential.
3. The frontend sends the credential to the backend.
4. The backend processes Google authentication.
5. The frontend receives the JWT and user information.
6. Authentication information is stored.
7. The user profile is retrieved.

## 7. Dashboard Architecture

File: `src/components/Dashboard.jsx`

The dashboard is the main authenticated application interface.

The dashboard component receives:

- `user` — authenticated user information.
- `onLogout` — logout callback.

The dashboard provides the authenticated user with access to the platform's blog and profile functionality.

Dashboard styling is maintained in:

`src/components/Dashboard.css`

## 8. Nexus Portal Architecture

Files:

- `src/components/NexusPortal.jsx`
- `src/components/NexusPortalScene.jsx`

The Nexus Portal provides the application's 3D visual experience.

### Technologies

- Three.js
- React Three Fiber
- Drei
- Postprocessing
- Framer Motion

### Performance Strategy

The Nexus Portal is lazy-loaded using React `lazy()`.

The component is rendered through React `Suspense`, which provides a loading fallback while the 3D component loads.

This helps separate the 3D experience from the initial application bundle.

## 9. Animation Architecture

BlogSphere combines multiple animation technologies.

### Framer Motion

Used for:

- Login page entrance animations.
- Content transitions.
- Interactive button effects.
- Animated error messages.
- UI state transitions.

### GSAP

Included for advanced animation capabilities.

### Three.js

Provides the underlying 3D graphics capabilities.

### Lenis

Included for smooth scrolling capabilities.

## 10. API Communication

The frontend communicates with the Express backend using Axios.

Base API prefix:

`/api`

The Vite development server proxies API requests to:

`http://localhost:5001`

This allows the frontend to use relative API paths during local development.

## 11. Vite Configuration

File: `vite.config.js`

### Development Server

| Setting | Value |
|---|---|
| Development port | 5173 |
| Strict port | Enabled |
| API proxy | `/api` |
| Backend target | `http://localhost:5001` |

### Preview Server

| Setting | Value |
|---|---|
| Preview port | 4173 |
| Strict port | Enabled |

## 12. Styling Architecture

The frontend uses separate stylesheets for different responsibilities.

| File | Purpose |
|---|---|
| `index.css` | Global styles |
| `App.css` | Main application and login interface |
| `Dashboard.css` | Dashboard interface |

This separation helps organize the application's visual structure.

## 13. Build and Development Commands

Navigate to the frontend directory:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start development server:

```powershell
npm run dev
```

Create production build:

```powershell
npm run build
```

Run ESLint:

```powershell
npm run lint
```

Preview production build:

```powershell
npm run preview
```

## 14. Frontend Quality and Performance

The application uses:

- Lazy loading for the Nexus Portal.
- Suspense loading fallback.
- Vite production bundling.
- Separate CSS files.
- React component-based architecture.
- Optimized 3D rendering implementation.

Previously recorded Lighthouse results:

| Metric | Result |
|---|---:|
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 82 |
| Mobile Performance | 69 |
| Cumulative Layout Shift | 0 |

These are recorded development measurements, not guaranteed scores for every deployment.

## 15. Frontend Architecture Summary

The frontend follows a component-based React architecture.

Its main responsibilities are:

- User authentication.
- Session management.
- Dashboard rendering.
- API integration.
- Interactive user interface.
- Animation and visual effects.
- 3D Nexus Portal rendering.

---

**Project:** BlogSphere
**Module:** Frontend Architecture
**Framework:** React
**Build Tool:** Vite
**Visual Technologies:** Framer Motion, GSAP, Three.js
**Documentation Status:** Initial architecture reference