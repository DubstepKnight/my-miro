"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AuthSession, WorkspaceDto } from "@my-miro/contracts";

interface WorkspaceShellProps {
  user: AuthSession;
  initialWorkspaces: WorkspaceDto[];
}

export function WorkspaceShell({ user, initialWorkspaces }: WorkspaceShellProps) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onCreateWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        setError("Failed to create workspace");
        return;
      }

      setName("");
      router.refresh();
    });
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <main>
      <h1>my-miro workspace launcher</h1>
      <p>
        Signed in as <strong>{user.displayName ?? user.email}</strong> ({user.role})
      </p>
      <p>
        <button className="secondary" type="button" onClick={onLogout}>
          Logout
        </button>
      </p>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h2>Create workspace</h2>
        <form className="row" onSubmit={onCreateWorkspace}>
          <input
            placeholder="Design Team"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={1}
            maxLength={120}
          />
          <button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create"}
          </button>
        </form>
        {error ? <p>{error}</p> : null}
      </section>

      <section className="card">
        <h2>Your workspaces</h2>
        {initialWorkspaces.length === 0 ? <p>No workspaces yet.</p> : null}
        <ul>
          {initialWorkspaces.map((workspace) => (
            <li key={workspace.id}>
              <a href={`/workspaces/${workspace.id}`}>{workspace.name}</a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
