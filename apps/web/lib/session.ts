"use server";

import { jwtVerify, SignJWT } from "jose";
import { ENCODED_SECRET_KEY, SESSION_SECRET_KEY } from "@/lib/constants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export type Session = {
  user: {
    id: string;
    name: string;
  };
  // accessToken : {};
  // refreshToken : {};
};

export async function createSession(payload: Session) {
  const seven_days_in_millisecond = 7 * 24 * 60 * 60 * 1000;
  const expiredAt = new Date(Date.now() + seven_days_in_millisecond);

  const session = await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(ENCODED_SECRET_KEY);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiredAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) {
    return null;
  }
  try {

  const {payload} = await jwtVerify(cookie, ENCODED_SECRET_KEY, {
    algorithms: ["HS256"],
  });
  return payload as Session;
  } catch (error) {
    console.error("Failed To varify:" + error);
    redirect("/auth/signin");
  }
}

export async function deleteSession() {
  (await cookies()).delete("session");
}
