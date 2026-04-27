"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function AuthShell() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (!response.ok) {
        setError("Invalid credentials");
        return;
      }

      router.refresh();
    });
  }

  async function onRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          displayName: displayName || undefined
        })
      });

      if (!response.ok) {
        setError("Failed to register");
        return;
      }

      router.refresh();
    });
  }

  return (
    <main>
      <h1>my-miro</h1>
      <p>Sign in with email/password to access your workspaces.</p>
      <div className="auth-grid">
        <section className="card">
          <h2>Login</h2>
          <form onSubmit={onLogin}>
            <div className="form-stack">
              <input
                type="email"
                placeholder="you@company.com"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
                minLength={8}
                maxLength={128}
              />
              <button type="submit" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2>Register</h2>
          <form onSubmit={onRegister}>
            <div className="form-stack">
              <input
                placeholder="Display name (optional)"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={120}
              />
              <input
                type="email"
                placeholder="you@company.com"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password (min 8)"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                required
                minLength={8}
                maxLength={128}
              />
              <button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create account"}
              </button>
            </div>
          </form>
        </section>
      </div>
      {error ? <p>{error}</p> : null}
    </main>
  );
}
