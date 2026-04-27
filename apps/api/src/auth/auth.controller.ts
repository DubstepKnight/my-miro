import { Body, Controller, Get, Inject, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { getRequestUser } from "../common/request-user.js";
import { AuthService } from "./auth.service.js";
import { LoginDto, RegisterDto } from "./dto.js";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() body: RegisterDto) {
    return this.authService.register({
      email: body.email,
      password: body.password,
      displayName: body.displayName
    });
  }

  @Post("login")
  async login(@Body() body: LoginDto) {
    return this.authService.login({
      email: body.email,
      password: body.password
    });
  }

  @Get("me")
  async me(@Req() request: Request) {
    const user = getRequestUser(request);
    return this.authService.me(user.id);
  }
}
