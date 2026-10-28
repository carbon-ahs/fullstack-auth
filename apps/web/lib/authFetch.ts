"use server";

import { getSession } from "@/lib/session";

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Fetch a backend resource with the current access token.
 *
 * Token refresh is handled proactively by `proxy.ts` so the refreshed session
 * cookie can be persisted before the page renders. If a 401 still happens (for
 * example the access token expired between the proxy and this call), the
 * response is returned as-is and the next request will refresh it.
 */
export const authFetch = async (
  url: string | URL,
  options: FetchOptions = {},
) => {
  const session = await getSession();
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${session?.accessToken}`,
  };

  return fetch(url, options);
};
