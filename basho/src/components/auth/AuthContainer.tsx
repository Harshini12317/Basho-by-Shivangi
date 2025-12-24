"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiUser, FiX } from "react-icons/fi";
import AuthBackground from "./AuthBackground";
import "./auth.css";
import { signIn } from "next-auth/react";


export default function AuthContainer() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
  });

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-background-wrapper">
        <AuthBackground />
      </div>

      {/* Close */}
      <button className="close-btn" onClick={() => router.push("/")}>
        <FiX size={22} />
      </button>

      <div className={`auth-container ${isSignup ? "active" : ""}`}>
        {/* LOGIN */}
        <div className="form-panel login">
          <h2>Welcome Back</h2>

          <div className="relative">
            <FiUser className="input-icon" />
            <input
              placeholder="Username"
              value={loginData.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLoginData({ ...loginData, username: e.target.value })
              }
            />
          </div>

          <div className="relative">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />
          </div>

          <button>Sign In</button>

          <div className="or-separator">
            <span>or</span>
          </div>

          {/* Google Button */}
          <button
  type="button"
  className="social-btn"
  onClick={() => signIn("google")}
>
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.5-5.1 3.5-3.1 0-5.6-2.6-5.6-5.8s2.5-5.8 5.6-5.8c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.6 2.8 14.5 2 12 2 6.9 2 2.8 6.1 2.8 11.5S6.9 21 12 21c6.9 0 8.6-4.9 8.6-7.4 0-.5-.1-.9-.1-1.3H12z"
    />
    <path
      fill="#34A853"
      d="M3.7 14.3l2.9-2.2c.8 2.2 2.8 3.7 5.4 3.7v3.5c-3.6 0-6.8-2.1-8.3-5z"
    />
    <path
      fill="#4285F4"
      d="M20.6 9.5h-8.6v3.6h5.1c-.4 1.9-2 3.5-5.1 3.5v3.5c4.9 0 8.6-3.4 8.6-8.6 0-.7-.1-1.3-.2-2z"
    />
    <path
      fill="#FBBC05"
      d="M6.6 12c0-.6.1-1.2.3-1.7L4 8.1C3.4 9.3 3 10.6 3 12c0 1.4.4 2.7 1 3.9l2.9-2.2c-.2-.5-.3-1.1-.3-1.7z"
    />
  </svg>
  <span>Continue with Google</span>
</button>


          <p>
            Don’t have an account?{" "}
            <span className="link" onClick={() => setIsSignup(true)}>
              Sign up
            </span>
          </p>
        </div>

        {/* SIGNUP */}
        <div className="form-panel signup">
          <h2>Create Account</h2>

          <div className="relative">
            <FiUser className="input-icon" />
            <input
              placeholder="Username"
              value={signupData.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSignupData({ ...signupData, username: e.target.value })
              }
            />
          </div>

          <div className="relative">
            <FiMail className="input-icon" />
            <input
              placeholder="Email"
              value={signupData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
            />
          </div>

          <div className="relative">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
            />
          </div>

          <button>Sign Up</button>

          <p>
            Already have an account?{" "}
            <span className="link" onClick={() => setIsSignup(false)}>
              Sign in
            </span>
          </p>
        </div>

        {/* OVERLAY */}
        <div className="overlay-panel">
          <h2>{isSignup ? "Welcome!" : "Hello Friend!"}</h2>
          <p>
            {isSignup
              ? "Sign in to continue your journey"
              : "Start your creative journey with us"}
          </p>
          <button onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
