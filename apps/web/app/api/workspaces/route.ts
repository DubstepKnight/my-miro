import { NextResponse } from "next/server";
import { createWorkspace } from "../../../lib/api";

export async function POST(request: Request) {
  const body = (await request.json()) as { name: string };
  const workspace = await createWorkspace(body.name);
  return NextResponse.json(workspace);
}
