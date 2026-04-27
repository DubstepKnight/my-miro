import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { AuthSession } from "@my-miro/contracts";
import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signAccessToken } from "../common/auth-token.js";
import { PrismaService } from "../prisma.service.js";

interface AuthResponse {
  accessToken: string;
  user: AuthSession;
}

@Injectable()
export class AuthService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async register(input: { email: string; password: string; displayName?: string }): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        displayName: input.displayName?.trim() || null,
        passwordHash
      }
    });

    return this.toAuthResponse(user);
  }

  async login(input: { email: string; password: string }): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.toAuthResponse(user);
  }

  async me(userId: string): Promise<AuthSession> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName ?? undefined,
      role: user.role
    };
  }

  private toAuthResponse(user: User): AuthResponse {
    const session: AuthSession = {
      id: user.id,
      email: user.email,
      displayName: user.displayName ?? undefined,
      role: user.role
    };

    return {
      accessToken: signAccessToken(session),
      user: session
    };
  }
}
