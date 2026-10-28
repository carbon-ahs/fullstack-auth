import { decodeJwt, jwtVerify, SignJWT } from "jose";
import { BACKEND_URL, ENCODED_SECRET_KEY } from "@/lib/constants";

export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type Session = {
  user: {
    id: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
};

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

/**
 * Sign the session payload into the cookie value. Pure: does not touch
 * `next/headers`, so it can also be used from `proxy.ts`.
 */
export async function signSession(payload: Session) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(ENCODED_SECRET_KEY);
}

/** Verify a raw session cookie value. Throws when it is invalid/expired. */
export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify<Session>(token, ENCODED_SECRET_KEY, {
    algorithms: ["HS256"],
  });

  return payload as Session;
}

/**
 * The access token is a backend JWT signed with JWT_SECRET, which the web app
 * does not have. We only need to know when it expires, so decode it without
 * verifying the signature (the backend still verifies it on every call).
 */
export function isAccessTokenExpiring(accessToken: string, leewaySeconds = 5) {
  try {
    const { exp } = decodeJwt(accessToken);
    if (!exp) {
      return true;
    }
    return exp * 1000 - Date.now() <= leewaySeconds * 1000;
  } catch {
    return true;
  }
}

/** Ask the backend for a fresh token pair. This also rotates the refresh token. */
export async function requestTokenRefresh(refreshToken: string) {
  const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Backend refresh failed (${response.status}): ${response.statusText}`,
    );
  }

  const body = await response.json();

  return {
    accessToken: body.accessToken as string,
    refreshToken: body.refreshToken as string,
  };
}
