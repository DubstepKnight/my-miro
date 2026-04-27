import { UnauthorizedException } from "@nestjs/common";
import type { AuthSession } from "@my-miro/contracts";
import type { UserRole } from "@my-miro/contracts";
import jwt from "jsonwebtoken";

interface AccessTokenPayload {
  sub: string;
  email: string;
  displayName?: string;
  role: UserRole;
}

function readJwtSecret(): string {
  return process.env.JWT_SECRET ?? process.env.AUTH_SECRET ?? "replace_me";
}

export function signAccessToken(user: AuthSession): string {
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role
  };

  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
  return jwt.sign(payload, readJwtSecret(), {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"]
  });
}

export function parseBearerToken(value: string | undefined): string {
  if (!value) {
    throw new UnauthorizedException("Missing Authorization header");
  }

  const [scheme, token] = value.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedException("Invalid Authorization header");
  }

  return token;
}

export function verifyAccessToken(token: string): AuthSession {
  try {
    const payload = jwt.verify(token, readJwtSecret()) as AccessTokenPayload;
    return {
      id: payload.sub,
      email: payload.email,
      displayName: payload.displayName,
      role: payload.role
    };
  } catch {
    throw new UnauthorizedException("Invalid or expired token");
  }
}
