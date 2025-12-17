import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const USER = process.env.BASIC_AUTH_USER;
const PASS = process.env.BASIC_AUTH_PASSWORD;
const AUTH_COOKIE_NAME = "auth_session";
const AUTH_TOKEN = process.env.AUTH_TOKEN || "super_secret_token789";

// Cookie จะอยู่ได้นานขึ้น
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 วัน

function unauthorized(message = "Unauthorized") {
  return new Response(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Protected"',
    },
  });
}

export function middleware(req: NextRequest) {
  if (!USER || !PASS) {
    return NextResponse.next();
  }

  const authCookie = req.cookies.get(AUTH_COOKIE_NAME);
  if (authCookie?.value === AUTH_TOKEN) {
    return NextResponse.next();
  }

  // ถ้าไม่มี cookie ให้ตรวจสอบ Basic Auth
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const base64 = auth.split(" ")[1];
    const decoded = atob(base64);
    const [user, pass] = decoded.split(":");

    if (user === USER && pass === PASS) {
      // ถ้า login สำเร็จ ให้ set cookie
      const response = NextResponse.next();
      response.cookies.set(AUTH_COOKIE_NAME, AUTH_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
      return response;
    }

    return unauthorized("Invalid credentials");
  } catch (e) {
    return new Response("Invalid authorization header", { status: 400 });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
