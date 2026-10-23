"use server";

import { getSession } from "@/lib/session";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/authFetch";

export const getProfileV0 = async () => {
  const session = await getSession();
  const response = await fetch(`${BACKEND_URL}/auth/protected`, {
    headers: {
      authorization: `Bearer ${session?.accessToken}`,
    },
  });
  const result = await response.json();
  return result;
};

export const getProfile = async () => {
  const response = await authFetch(`${BACKEND_URL}/auth/protected`);
  return response.json();
};
