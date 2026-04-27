import { cookies } from "next/headers";
import type { AuthSession, BoardDto, WorkspaceDto } from "@my-miro/contracts";
import { AUTH_COOKIE_NAME } from "./auth-cookie";

const apiBase = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

interface AuthResponse {
  accessToken: string;
  user: AuthSession;
}

async function readCookieToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value;
}

async function authHeader(token?: string): Promise<Record<string, string>> {
  const value = token ?? (await readCookieToken());
  return value ? { authorization: `Bearer ${value}` } : {};
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export async function register(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${apiBase}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error(`Failed to register: ${response.status}`);
  }

  return parseJson<AuthResponse>(response);
}

export async function login(input: { email: string; password: string }): Promise<AuthResponse> {
  const response = await fetch(`${apiBase}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error(`Failed to login: ${response.status}`);
  }

  return parseJson<AuthResponse>(response);
}

export async function me(token?: string): Promise<AuthSession | null> {
  const response = await fetch(`${apiBase}/auth/me`, {
    headers: await authHeader(token),
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  return parseJson<AuthSession>(response);
}

export async function listWorkspaces(token?: string): Promise<WorkspaceDto[]> {
  const response = await fetch(`${apiBase}/workspaces`, {
    headers: await authHeader(token),
    cache: "no-store"
  });
  if (!response.ok) return [];
  return parseJson<WorkspaceDto[]>(response);
}

export async function createWorkspace(name: string, token?: string): Promise<WorkspaceDto> {
  const response = await fetch(`${apiBase}/workspaces`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(await authHeader(token)) },
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    throw new Error(`Failed to create workspace: ${response.status}`);
  }

  return parseJson<WorkspaceDto>(response);
}

export async function listBoards(workspaceId: string, token?: string): Promise<BoardDto[]> {
  const response = await fetch(`${apiBase}/workspaces/${workspaceId}/boards`, {
    headers: await authHeader(token),
    cache: "no-store"
  });

  if (!response.ok) return [];
  return parseJson<BoardDto[]>(response);
}

export async function createBoard(workspaceId: string, title: string, token?: string): Promise<BoardDto> {
  const response = await fetch(`${apiBase}/workspaces/${workspaceId}/boards`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(await authHeader(token)) },
    body: JSON.stringify({ title })
  });

  if (!response.ok) {
    throw new Error(`Failed to create board: ${response.status}`);
  }

  return parseJson<BoardDto>(response);
}
