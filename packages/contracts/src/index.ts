export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";
export type BoardRole = "OWNER" | "EDITOR" | "COMMENTER" | "VIEWER";
export type UserRole = "USER" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  displayName?: string;
}

export interface AuthSession extends SessionUser {
  role: UserRole;
}

export interface WorkspaceDto {
  id: string;
  name: string;
  ownerId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
}

export interface BoardDto {
  id: string;
  workspaceId: string;
  title: string;
  createdById: string;
  role: BoardRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceInput {
  name: string;
}

export interface CreateBoardInput {
  title: string;
}
