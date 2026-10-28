import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  isAccessTokenExpiring,
  requestTokenRefresh,
  signSession,
  verifySessionToken,
  type Session,
} from "@/lib/session-jwt";

const PROTECTED_PATHS = ["/profile"];

type Tokens = { accessToken: string; refreshToken: string };

/**
 * The backend rotates the refresh token on every refresh, so two concurrent
 * requests must not both use the old one. Share the in-flight request and keep
 * the result briefly for late arrivals.
 */
const REFRESH_RESULT_TTL_MS = 10_000;
const refreshesInFlight = new Map<string, Promise<Tokens>>();
const refreshedTokens = new Map<
  string,
  { tokens: Tokens; expiresAt: number }
>();

function refreshOnce(refreshToken: string) {
  const cached = refreshedTokens.get(refreshToken);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.tokens);
  }

  const pending = refreshesInFlight.get(refreshToken);
  if (pending) {
    return pending;
  }

  const request = requestTokenRefresh(refreshToken)
    .then((tokens) => {
      refreshedTokens.set(refreshToken, {
        tokens,
        expiresAt: Date.now() + REFRESH_RESULT_TTL_MS,
      });
      return tokens;
    })
    .finally(() => {
      refreshesInFlight.delete(refreshToken);
    });

  refreshesInFlight.set(refreshToken, request);
  return request;
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function nextWithSession(request: NextRequest, token: string) {
  // Make the new token visible to the current render as well as to the browser.
  request.cookies.set(SESSION_COOKIE_NAME, token);
  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return response;
}

function clearSession(request: NextRequest, redirectToSignIn: boolean) {
  request.cookies.delete(SESSION_COOKIE_NAME);
  const response = redirectToSignIn
    ? NextResponse.redirect(new URL("/auth/signin", request.nextUrl))
    : NextResponse.next({ request: { headers: request.headers } });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = isProtectedPath(pathname);
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return isProtected
      ? NextResponse.redirect(new URL("/auth/signin", request.nextUrl))
      : NextResponse.next();
  }

  let session: Session;
  try {
    session = await verifySessionToken(token);
  } catch {
    return clearSession(request, isProtected);
  }

  if (!isAccessTokenExpiring(session.accessToken)) {
    return NextResponse.next();
  }

  try {
    const tokens = await refreshOnce(session.refreshToken);
    const newSession = await signSession({
      user: session.user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    return nextWithSession(request, newSession);
  } catch (error) {
    console.error("Session refresh failed:", error);
    return clearSession(request, isProtected);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
