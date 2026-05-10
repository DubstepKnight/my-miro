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

export interface BoardViewport {
  x: number;
  y: number;
  zoom: number;
}

export type BoardElement = StickyNoteElement | FreehandPathElement;

export interface BoardElementBase {
  id: string;
  type: "note" | "path";
  x: number;
  y: number;
  zIndex: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface StickyNoteElement extends BoardElementBase {
  type: "note";
  width: number;
  height: number;
  text: string;
  color: string;
}

export interface FreehandPathElement extends BoardElementBase {
  type: "path";
  points: Array<{ x: number; y: number }>;
  stroke: string;
  strokeWidth: number;
}

export interface BoardDocument {
  schemaVersion: 1;
  viewport: BoardViewport;
  elements: Record<string, BoardElement>;
}
