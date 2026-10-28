"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  signSession,
  verifySessionToken,
  type Session,
} from "@/lib/session-jwt";

export type { Session } from "@/lib/session-jwt";

export async function createSession(payload: Session) {
  const session = await signSession(payload);

  (await cookies()).set(SESSION_COOKIE_NAME, session, SESSION_COOKIE_OPTIONS);
}

export async function getSession() {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return null;
  }
  try {
    return await verifySessionToken(cookie);
  } catch (error) {
    console.error("Failed To varify:" + error);
    redirect("/auth/signin");
  }
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export async function updateTokensV0({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookieSession = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!cookieSession) {
    return null;
  }
  const payload = await verifySessionToken(cookieSession);

  if (!payload) {
    throw new Error("Could not find session");
  }

  const newPayload = {
    user: {
      ...payload.user,
    },
    accessToken,
    refreshToken,
  };

  await createSession(newPayload);
}

export async function updateTokens({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookieSession = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!cookieSession) {
    throw new Error("Session cookie is missing");
  }

  const payload = await verifySessionToken(cookieSession);

  if (!payload) {
    throw new Error("Could not find session");
  }

  const newPayload: Session = {
    user: {
      ...payload.user,
    },
    accessToken,
    refreshToken,
  };

  await createSession(newPayload);
}
