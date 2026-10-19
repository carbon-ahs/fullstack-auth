import "dotenv/config";

export const BACKEND_URL = process.env["NEXT_PUBLIC_BACKEND_URL"]!;
export const SESSION_SECRET_KEY = process.env["SESSION_SECRET_KEY"]!;
export const ENCODED_SECRET_KEY = new TextEncoder().encode(SESSION_SECRET_KEY);