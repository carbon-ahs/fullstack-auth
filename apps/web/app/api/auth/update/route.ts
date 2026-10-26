import { NextRequest } from "next/server";
import { updateTokens } from "@/lib/session";

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { accessToken, refreshToken } = body;
//   if (!accessToken || !refreshToken) {
//     return new Response("Provide tokens.", { status: 401 });
//   }
//   await updateTokens({ accessToken, refreshToken });
//   return new Response("ok", { status: 200 });
// }

export async function POST(req: NextRequest) {
  const { accessToken, refreshToken } = await req.json();

  if (!accessToken || !refreshToken) {
    return Response.json(
      { message: "Provide tokens." },
      { status: 400 },
    );
  }

  if (!req.cookies.get("session")?.value) {
    return Response.json(
      { message: "Session cookie missing from request." },
      { status: 401 },
    );
  }

  try {
    await updateTokens({ accessToken, refreshToken });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to update session:", error);

    return Response.json(
      { message: "Failed to update session." },
      { status: 500 },
    );
  }
}
