
import { lazy, Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

import {
  ArrowUpRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Check,
  LoaderCircle,
} from "lucide-react";

import "./App.css";
import Dashboard from "./components/Dashboard";

const NexusPortal = lazy(() => import("./components/NexusPortal"));

const API = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "blogsphere_token";
const USER_KEY = "blogsphere_user";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  function saveAuthentication(token, user) {
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;

    otherStorage.removeItem(TOKEN_KEY);
    otherStorage.removeItem(USER_KEY);

    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
  }

  async function loadAuthenticatedProfile(token, fallbackUser) {
    const profileResponse = await axios.get(`${API}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setAuthenticatedUser(
      profileResponse.data.user || fallbackUser
    );
  }

  function clearAuthentication() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    try {
      setLoading(true);

      const loginResponse = await axios.post(`${API}/auth/login`, {
        email: normalizedEmail,
        password,
      });

      const { token, user } = loginResponse.data;

      if (!token) {
        throw new Error(
          "The server did not return an authentication token."
        );
      }

      saveAuthentication(token, user);

      await loadAuthenticatedProfile(token, user);
    } catch (err) {
      clearAuthentication();

      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Google sign-in callback
  async function handleGoogleSuccess(credentialResponse) {
    setError("");

    if (!credentialResponse?.credential) {
      setError("Google did not return a valid credential.");
      return;
    }

    try {
      setGoogleLoading(true);

      const response = await axios.post(`${API}/auth/google`, {
        credential: credentialResponse.credential,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error(
          "The server did not return valid authentication details."
        );
      }

      saveAuthentication(token, user);

      await loadAuthenticatedProfile(token, user);
    } catch (err) {
      clearAuthentication();

      setError(
        err.response?.data?.message ||
        err.message ||
        "Google sign-in failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleLogout() {
    clearAuthentication();

    setAuthenticatedUser(null);
    setPassword("");
    setError("");
  }

  if (authenticatedUser) {
    return (
      <Dashboard
        user={authenticatedUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <main className="motion-page">
      <div className="noise-layer" />
      <div className="background-grid" />
      <div className="light-bleed light-bleed-one" />
      <div className="light-bleed light-bleed-two" />

      <header className="top-navigation">
        <a
          className="wordmark"
          href="/"
          aria-label="BlogSphere home"
        >
          <span className="wordmark-icon">b.</span>

          <span>
            blog<span>sphere</span>
          </span>
        </a>

        <div className="navigation-status">
          <span className="live-indicator" />
          NEXUS SYSTEM ONLINE
        </div>
      </header>

      <div className="main-layout">
        <section className="manifesto">
          <motion.div
            className="manifesto-content"
            initial={{ opacity: 0, x: -45 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 1,
              ease: [0.2, 0.8, 0.2, 1],
            }}
          >
            <div className="intro-tag">
              <Sparkles size={15} />
              <span>ENTER A NEW DIMENSION</span>
            </div>

            <h1>
              Ideas move
              <br />
              <span className="headline-outline">
                the world.
              </span>
            </h1>

            <p className="manifesto-copy">
              Think freely. Write boldly. Discover perspectives
              that change the way you see everything.
            </p>

            <div className="artwork">
              <div className="artwork-light" />
              <div className="artwork-grid" />

              <Suspense
                fallback={
                  <div className="portal-loading">
                    INITIALIZING NEXUS...
                  </div>
                }
              >
                <NexusPortal />
              </Suspense>

              <div className="artwork-coordinate coordinate-one">
                01 — NEXUS
              </div>

              <div className="artwork-coordinate coordinate-two">
                REALTIME / 3D
              </div>
            </div>

            <div className="manifesto-bottom">
              <span>READ BEYOND THE ORDINARY</span>
              <span className="manifesto-rule" />
              <span>EST. 2026</span>
            </div>
          </motion.div>
        </section>

        <section className="login-side">
          <motion.div
            className="login-card"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.18,
              ease: [0.2, 0.8, 0.2, 1],
            }}
          >
            <div className="card-topline">
              <span className="micro-label">
                MEMBER ACCESS
              </span>

              <span className="secure-indicator">
                <ShieldCheck size={15} />
                SECURE CONNECTION
              </span>
            </div>

            <div className="login-heading">
              <span className="heading-index">
                01 / WELCOME BACK
              </span>

              <h2>
                Sign in<span>.</span>
              </h2>

              <p>
                Your space is waiting. Pick up where you left off.
              </p>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="form-field">
                <label htmlFor="email">
                  EMAIL ADDRESS
                </label>

                <div className="input-shell">
                  <Mail size={17} />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    autoComplete="off"
                    name="blogsphere-login-email"
                    spellCheck={false}
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="password">
                  PASSWORD
                </label>

                <div className="input-shell">
                  <LockKeyhole size={17} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    name="blogsphere-login-password"
                    required
                    disabled={loading || googleLoading}
                  />

                  <button
                    type="button"
                    className="eye-button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword
                      ? <EyeOff size={17} />
                      : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="remember-control">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) =>
                      setRemember(event.target.checked)
                    }
                  />

                  <span className="remember-box">
                    {remember && <Check size={11} />}
                  </span>

                  Remember me
                </label>

                <span className="private-session">
                  PRIVATE SESSION
                </span>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="login-error"
                    role="alert"
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      y: 0,
                    }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                className="sign-in-button"
                disabled={loading || googleLoading}
                whileHover={
                  loading || googleLoading ? undefined : { y: -3 }
                }
                whileTap={
                  loading || googleLoading ? undefined : { scale: 0.98 }
                }
              >
                <span>
                  {loading
                    ? "VERIFYING ACCESS"
                    : "ENTER BLOGSPHERE"}
                </span>

                {loading
                  ? <LoaderCircle className="loading-icon" size={19} />
                  : <ArrowUpRight size={20} />}
              </motion.button>
            </form>

            <div className="card-separator google-separator">
              <span />
              <small>OR CONTINUE WITH</small>
              <span />
            </div>

            <div className="google-login-wrapper">
              {googleLoading ? (
                <div className="google-loading">
                  <LoaderCircle className="loading-icon" size={18} />
                  VERIFYING GOOGLE ACCOUNT...
                </div>
              ) : (

<GoogleLogin
  onSuccess={handleGoogleSuccess}
  onError={() => {
    setError(
      "Google sign-in was cancelled or could not be completed."
    );
  }}
  theme="outline"
  shape="pill"
  size="large"
  text="continue_with"
  logo_alignment="left"
  width="400"
  useOneTap={false}
/>

              )}
            </div>

            <div className="card-separator">
              <span />
              <small>YOUR STORY CONTINUES HERE</small>
              <span />
            </div>

            <div className="login-card-footer">
              <span>BUILT FOR THE CURIOUS.</span>
              <span>MADE TO BE READ.</span>
            </div>
          </motion.div>

          <div className="side-caption">
            <span>AUTHENTICATE YOURSELF</span>
            <span className="caption-dot" />
            <span>EXPLORE WHAT'S NEXT</span>
          </div>
        </section>
      </div>

      <footer className="bottom-navigation">
        <span>© 2026 BLOGSPHERE</span>
        <span>THINK. WRITE. INSPIRE.</span>
        <span>POWERED BY NEXUS</span>
      </footer>
    </main>
  );
}
