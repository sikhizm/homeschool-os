import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { getSql } from "@/lib/db";
import { chapterRequest } from "@/lib/planning/chapter-request";
const send = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
async function handle(request: Request, write: boolean) {
  if (write && request.headers.get("origin") !== new URL(request.url).origin)
    return send({ error: "Same-origin request required." }, 403);
  const { data } = await auth.getSession();
  if (!data?.user) return send({ error: "Sign in required." }, 401);
  return chapterRequest(getSql(), data.user.id, request, write);
}
async function run(request: Request, write: boolean) {
  try {
    return await handle(request, write);
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "23505")
      return send(
        { error: "This chapter already has a task on that day." },
        409,
      );
    return send(
      {
        error:
          "Chapter planning unavailable. Check the connection and migration 012.",
      },
      503,
    );
  }
}
export const GET = (request: Request) => run(request, false);
export const POST = (request: Request) => run(request, true);
