import { NextResponse } from "next/server";
import { register } from "../../../../lib/api";
import { AUTH_COOKIE_NAME } from "../../../../lib/auth-cookie";

interface RegisterBody {
  email: string;
  password: string;
  displayName?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  let auth;
  try {
    auth = await register(body);
  } catch (error) {
    const statusMatch = /(\d+)$/.exec(String(error));
    const status = statusMatch ? Number(statusMatch[1]) : 400;
    return NextResponse.json({ message: "Registration failed" }, { status });
  }

  const response = NextResponse.json({ user: auth.user });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: auth.accessToken,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
