"use server";

import { FormState, LoginFormSchema, SignupFormSchema } from "@/lib/type";
import { BACKEND_URL } from "@/lib/constants";
import { redirect } from "next/navigation";
import { createSession, updateTokens } from "@/lib/session";
import { requestTokenRefresh } from "@/lib/session-jwt";

export async function signUp(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  // await delay(3000);

  const validationFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validationFields.success) {
    return { error: validationFields.error.flatten().fieldErrors };
  }

  const response = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validationFields.data),
  });

  if (response.ok) {
    redirect("/auth/signin");
  } else {
    return {
      message:
        response.status === 409 ? "User already in DB" : response.statusText,
    };
  }
}

export async function signIn(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const validationFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validationFields.success) {
    return { error: validationFields.error.flatten().fieldErrors };
  }

  const response = await fetch(`${BACKEND_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validationFields.data),
  });

  if (response.ok) {
    const result = await response.json();

    await createSession({
      user: { id: result.id, name: result.name },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    redirect("/");
  } else {
    return {
      message:
        response.status === 401 ? "Invalid credentials." : response.statusText,
    };
  }
}

/**
 * Refresh the backend tokens and persist them in the session cookie.
 *
 * This writes a cookie, so it only works from a Server Action or a Route
 * Handler. Automatic refresh during page rendering is handled by `proxy.ts`,
 * which is the only place that can safely persist a rotated refresh token
 * while a Server Component is rendering.
 */
export const refreshToken = async (oldRefreshToken: string) => {
  try {
    const tokens = await requestTokenRefresh(oldRefreshToken);
    await updateTokens(tokens);
    return tokens.accessToken;
  } catch (error) {
    console.error("Token refresh error: ", error);
    return null;
  }
};
