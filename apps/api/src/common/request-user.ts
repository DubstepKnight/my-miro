import type { Request } from "express";
import type { AuthSession } from "@my-miro/contracts";
import { parseBearerToken, verifyAccessToken } from "./auth-token.js";

export function getRequestUser(request: Request): AuthSession {
  const token = parseBearerToken(request.header("authorization") ?? undefined);
  return verifyAccessToken(token);
}
