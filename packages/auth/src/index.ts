import type { SessionUser } from "@my-miro/contracts";

export function readSessionUser(headers: Headers): SessionUser {
  const id = headers.get("x-user-id") ?? "demo-user";
  const email = headers.get("x-user-email") ?? "demo@my-miro.local";
  const displayName = headers.get("x-user-name") ?? "Demo User";

  return { id, email, displayName };
}
