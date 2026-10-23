"use server";

import { FormState, LoginFormSchema, SignupFormSchema } from "@/lib/type";
import { BACKEND_URL } from "@/lib/constants";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/session";

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
