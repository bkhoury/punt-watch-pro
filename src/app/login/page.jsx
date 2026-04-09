"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail, signUpWithEmail, resetPassword } from "@/src/lib/firebase/auth.js";
import { updateUserDoc } from "@/src/lib/firebase/firestore.js";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null); // "coach" | "player"
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") {
        if (!role) { setError("Please select a role."); return; }
        const cred = await signUpWithEmail(email, password);
        await updateUserDoc(cred.user.uid, { role, email });
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

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setRole(null);
    setResetSent(false);
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>
          {mode === "signup" ? "Create Account" : mode === "reset" ? "Reset Password" : "Sign In"}
        </h1>

        {resetSent ? (
          <p className="login-success">Password reset email sent. Check your inbox.</p>
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

            {mode === "signup" && (
              <div className="role-picker">
                <p className="role-picker__label">I am a...</p>
                <div className="role-picker__options">
                  <button
                    type="button"
                    className={`role-option ${role === "player" ? "role-option--active" : ""}`}
                    onClick={() => setRole("player")}
                  >
                    <span className="role-option__title">Player</span>
                    <span className="role-option__desc">Upload and manage your own reps</span>
                  </button>
                  <button
                    type="button"
                    className={`role-option ${role === "coach" ? "role-option--active" : ""}`}
                    onClick={() => setRole("coach")}
                  >
                    <span className="role-option__title">Coach</span>
                    <span className="role-option__desc">View and manage a roster of players</span>
                  </button>
                </div>
              </div>
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
              <button onClick={() => switchMode("signup")}>Create an account</button>
              <button onClick={() => switchMode("reset")}>Forgot password?</button>
            </>
          )}
          {(mode === "signup" || mode === "reset") && (
            <button onClick={() => switchMode("signin")}>Back to sign in</button>
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
