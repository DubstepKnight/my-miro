import { AuthShell } from "../components/auth-shell";
import { WorkspaceShell } from "../components/workspace-shell";
import { listWorkspaces, me } from "../lib/api";

export default async function HomePage() {
  const user = await me();
  if (!user) {
    return <AuthShell />;
  }

  const workspaces = await listWorkspaces();
  return <WorkspaceShell user={user} initialWorkspaces={workspaces} />;
}
