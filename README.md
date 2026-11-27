# 🌐 BlogSphere

### Ideas move the world.

**A modern full-stack blogging platform to create, publish, manage, and discover ideas.**

<p align="center">
  <a href="https://blogsphere-fullstack.onrender.com">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-BlogSphere-16a34a?style=for-the-badge" alt="Live Demo" />
  </a>
  <a href="https://github.com/Sudharsan180105/BlogSphere">
    <img src="https://img.shields.io/badge/Source_Code-GitHub-181717?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React.js-Frontend-61DAFB?style=flat&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=flat&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-API-000000?style=flat&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Render-Deployed-46E3B7?style=flat&logo=render&logoColor=black" />
</p>

---

## 📌 Overview

**BlogSphere** is a full-stack blogging application developed to provide users with a modern digital space to express their ideas, share knowledge, and publish articles.

Built with React.js, Node.js, Express.js, and MongoDB, the application combines an interactive user interface with secure authentication and powerful blog management functionality.

The project demonstrates practical full-stack development, REST API integration, database management, authentication, responsive design, and cloud deployment.

## 🚀 Live Demo

| Resource | Link |
|---|---|
| 🌐 Live Application | [Open BlogSphere](https://blogsphere-fullstack.onrender.com) |
| 💻 GitHub Repository | [View Source Code](https://github.com/Sudharsan180105/BlogSphere) |
| ⚙️ API Health Check | [Check API Status](https://blogsphere-fullstack.onrender.com/api/health) |

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Secure email and password authentication |
| 🌐 Google Login | Sign in using Google OAuth |
| 👤 User Dashboard | Personalized dashboard for users |
| ✍️ Create Blogs | Write and publish blog articles |
| 📝 Edit Blogs | Update existing blog posts |
| 🗑️ Delete Blogs | Remove blog posts |
| 📚 Public Blog Listing | Explore published articles |
| 🔎 Article Retrieval | Access individual blog articles |
| 🎨 Modern UI | Interactive and responsive interface |
| 🎬 Animations | Engaging visual effects and transitions |
| 🛡️ API Security | Authentication middleware and rate limiting |

## 🛠️ Technology Stack

**Frontend**
- React.js
- JavaScript
- Vite
- CSS
- Framer Motion
- GSAP
- Three.js

**Backend**
- Node.js
- Express.js
- REST API
- Mongoose

**Database & Authentication**
- MongoDB Atlas
- JSON Web Token (JWT)
- Google OAuth

**Development & Deployment**
- Git and GitHub
- ESLint
- Node.js Test Runner
- Render

## 🏗️ System Architecture

```text
             ┌──────────────────┐
             │    USER / CLIENT │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │   REACT FRONTEND │
             │   Vite + CSS     │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │  EXPRESS SERVER  │
             │   Node.js API    │
             └────────┬─────────┘
                      │
             ┌────────┴─────────┐
             ▼                  ▼
    ┌────────────────┐  ┌────────────────┐
    │ Authentication │  │  Blog Services │
    │ JWT / Google   │  │ CRUD Operations│
    └────────────────┘  └────────┬───────┘
                                 │
                                 ▼
                       ┌──────────────────┐
                       │   MONGODB ATLAS  │
                       │     Database     │
                       └──────────────────┘
```

**Production hosting:** Render serves both the React production build and Express API from a single web service.

## 📂 Project Structure

```text
BlogSphere/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   ├── index.html
│   └── vite.config.js
│
├── docs/
├── .gitignore
└── README.md
```

## 💻 Getting Started

Follow these instructions to run BlogSphere on your local machine.

### Prerequisites

- Node.js and npm
- Git
- MongoDB Atlas account
- Google Cloud project with OAuth 2.0 credentials

### 1. Clone the Repository

```bash
git clone https://github.com/Sudharsan180105/BlogSphere.git
```

```bash
cd BlogSphere
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory.

Use `.env.example` as a reference:

```env
PORT=5001
NODE_ENV=development
CLIENT_URLS=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
JWT_EXPIRES_IN=7d
```

Replace the placeholder values with your own credentials.

Start the backend:

```bash
npm run dev
```

Backend runs at:

`http://localhost:5001`

### 3. Configure the Frontend

Open another terminal from the project root:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at:

`http://localhost:5173`

### 4. Access the Application

Open your browser:

**http://localhost:5173**

Make sure both frontend and backend servers are running.

## 🔌 API Endpoints

| Endpoint | Purpose |
|---|---|
| `/api/health` | Application and database health |
| `/api/auth` | Authentication operations |
| `/api/users` | User profile operations |
| `/api/blogs` | Blog management operations |

## 🧪 Testing

Run the backend test suite:

```bash
npm --prefix backend test
```

Run frontend linting:

```bash
npm --prefix frontend run lint
```

Generate the production frontend build:

```bash
npm --prefix frontend run build
```

## ☁️ Deployment

BlogSphere is deployed on **Render**, with MongoDB Atlas as its cloud database.

### Production Build Command

```bash
npm install --prefix backend && npm install --include=dev --prefix frontend && npm run build --prefix frontend
```

### Production Start Command

```bash
npm start --prefix backend
```

### Production Environment

Configure the following variables in the Render dashboard:

- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `GOOGLE_CLIENT_ID`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_API_URL`
- `CLIENT_URLS`

Keep all credentials private. Vite environment variables prefixed with `VITE_` are included in the browser build, so only public configuration such as the Google OAuth Client ID belongs there.

## 🔒 Security

- Environment files are excluded from version control.
- Sensitive credentials are stored in deployment environment variables.
- JWT-based authentication protects authorized operations.
- Google OAuth provides external authentication.
- API rate limiting helps protect endpoints.
- MongoDB Atlas access is restricted through network access rules.

## 🎯 Project Goals

- Build a complete full-stack web application.
- Develop responsive and interactive user interfaces.
- Implement secure user authentication.
- Design and integrate RESTful APIs.
- Manage application data using MongoDB.
- Test application functionality.
- Deploy and verify a live production application.

## 👨‍💻 Developer

**Sudharsan L**

Computer Science and Engineering  
Full-Stack Developer

- GitHub: [Sudharsan180105](https://github.com/Sudharsan180105)
- Repository: [BlogSphere](https://github.com/Sudharsan180105/BlogSphere)

---

<p align="center">
  <strong>Built with ❤️ and modern web technologies.</strong>
  <br />
  <em>BlogSphere — Ideas move the world.</em>
</p>
