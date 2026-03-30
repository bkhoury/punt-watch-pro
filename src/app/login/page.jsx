"use client";

import { useState } from "react";
import { useRouter, redirect } from "next/navigation";
import { signInWithEmail, signUpWithEmail, resetPassword } from "@/src/lib/firebase/auth.js";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  console.log("On Login Page", { mode, email, password });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password);
      } else if (mode === "signin") {
        await signInWithEmail(email, password);
      } else if (mode === "reset") {
        await resetPassword(email);
        setResetSent(true);
        return;
      }
      router.push("/punter");
    } catch (err) {
      setError(friendlyError(err.code));
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>
          {mode === "signup" ? "Create Account" : mode === "reset" ? "Reset Password" : "Sign In"}
        </h1>

        {resetSent ? (
          <p className="login-success">
            Password reset email sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            {mode !== "reset" && (
              <>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </>
            )}

            {error && <p className="login-error">{error}</p>}

            <button type="submit">
              {mode === "signup" ? "Create Account" : mode === "reset" ? "Send Reset Email" : "Sign In"}
            </button>
          </form>
        )}

        <div className="login-links">
          {mode === "signin" && (
            <>
              <button onClick={() => { setMode("signup"); setError(""); }}>
                Create an account
              </button>
              <button onClick={() => { setMode("reset"); setError(""); }}>
                Forgot password?
              </button>
            </>
          )}
          {(mode === "signup" || mode === "reset") && (
            <button onClick={() => { setMode("signin"); setError(""); setResetSent(false); }}>
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/invalid-email": return "Invalid email address.";
    case "auth/user-not-found": return "No account found with that email.";
    case "auth/wrong-password": return "Incorrect password.";
    case "auth/email-already-in-use": return "An account with that email already exists.";
    case "auth/weak-password": return "Password must be at least 6 characters.";
    case "auth/too-many-requests": return "Too many attempts. Try again later.";
    default: return "Something went wrong. Please try again.";
  }
}
