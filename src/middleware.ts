import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Server-only env vars (do NOT prefix with NEXT_PUBLIC_)
const USER = process.env.BASIC_AUTH_USER;
const PASS = process.env.BASIC_AUTH_PASSWORD;

function unauthorized(message = "Unauthorized") {
  return new Response(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Protected"',
    },
  });
}

export function middleware(req: NextRequest) {
  console.log("Middleware: Checking Basic Auth");
  // If credentials are not set in environment, skip auth (convenience for local dev)
  if (!USER || !PASS) {
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const base64 = auth.split(" ")[1];
    // Use atob (available in the Edge runtime / browser-like environment)
    const decoded = atob(base64);
    const [user, pass] = decoded.split(":");

    if (user === USER && pass === PASS) {
      return NextResponse.next();
    }

    return unauthorized("Invalid credentials");
  } catch (e) {
    return new Response("Invalid authorization header", { status: 400 });
  }
}

// Exclude common static and API routes from basic auth
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
