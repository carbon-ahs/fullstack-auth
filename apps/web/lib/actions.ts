"use server";

import { getSession } from "@/lib/session";
import { BACKEND_URL } from "@/lib/constants";

export const getProfile = async () => {
  const session = await getSession();
  const response = await fetch(`${BACKEND_URL}/auth/protected`, {
    headers: {
      authorization: `Bearer ${session?.accessToken}`,
    },
  });
  const result = await response.json();
  return result;
};
