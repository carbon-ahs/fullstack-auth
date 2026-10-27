# Developer Note

## Main source

- yt: https://youtu.be/Y9KNU2MnO-o?si=fgv34fCioGrNFl4L
- gh: https://github.com/vahid-nejad/NestJS-NextJS-Authentication-Turborepo

## Links

- Tailwind Installation with turborepo: https://tailwindcss.com/docs/installation/framework-guides/nextjs

## Daily Log

- 13-10-2026: https://youtu.be/Y9KNU2MnO-o?si=-4zsT65-6pYX4WJU&t=784
- 14-10-2026: https://youtu.be/Y9KNU2MnO-o?si=xahDXeqp4ihs2fJY&t=1751
- 15-10-2026: https://youtu.be/Y9KNU2MnO-o?si=GmLrIFn7WPcEaEjg&t=2939
- 16-10-2026: https://youtu.be/Y9KNU2MnO-o?si=Jp_YIFYX6axdeCPb&t=3828
- 17-10-2026: https://youtu.be/Y9KNU2MnO-o?si=clMFwSBnNA5Zjboy&t=4607
- 19-10-2026: https://youtu.be/Y9KNU2MnO-o?si=YzDPTQbs4jWcK22T&t=6611
- 20-10-2026: https://youtu.be/Y9KNU2MnO-o?si=6PEwauXq-i8yVn_9&t=7080
- 22-10-2026: https://youtu.be/Y9KNU2MnO-o?si=XrYzcWheRKsVTNDO&t=7818
- 23-10-2026: https://youtu.be/Y9KNU2MnO-o?si=RfOLJnsHDikPHU7C&t=10480
- 24-10-2026: https://youtu.be/Y9KNU2MnO-o?si=-OQojUxBeUkb2dfq&t=12321
- 25-10-2026: https://youtu.be/Y9KNU2MnO-o?si=qHwKGM-Wnrw56S1E&t=12631
- 25-10-2026: https://youtu.be/Y9KNU2MnO-o?si=DNdgSLV7ShQ8EBbf&t=12954

## Gotcha

### Installation

- Turbo latest gives error, refer to this chat for install in any
  machine https://chatgpt.com/share/6acdfb62-5074-83e8-9282-587f31fd87c6
- Latest Turbo and NestJs uses different TypeScript version. it courses error. fix in monorepo

### Other

- env variables works in Next, but it needs prefix `NEXT_PUBLIC_`
- must use parenthesis in if statement. else there will be race condition and give weird unrelated errors
- For force refresh need to use `a` tag instead of `Link`.
- No need of `import "dotenv/config"` in Next.js. But its mandatory in NestJs.
- Leading '/' is very important. without it gives weird error `redirect("/auth/signin");`
- jwt strategy gives a type error. have a look in source and current implementation.
- in this project only refresh token is hashed and saved to db. in prod both tokens should be saved this way to
  invalidate

## Need to more learn

- Types in TypeScript
- Sometime imports are .ts sometime .js why?
- There is a temporary type in `web/lib/authFetch.ts` need to study that file
-

## Used Commands

### to pull db tables as prisma schema

```
npx prisma contract infer
```

```
npx prisma contract emit
npm install -D @nestjs/schematics@12.0.6

```

### Prisma schema to local DB

```
npx prisma db update
```

### NVM (a thing like fvm)

```
nvm install 24.21.0                   
nvm use 24.21.0
```

### Tailwind

```
npm install tailwindcss @tailwindcss/postcss postcss
```

### Shad/CN

```
npm install tailwindcss @tailwindcss/postcss postcss
```

### Mix

```
nest g res auth --no-spec
nest g res user --no-spec

# For dto machanism 
npm i -D class-validator class-transformer

# password hasing
npm i argon2

# Passport library for auth
npm i @nestjs/passport passport passport-local
npm i -D @types/passport-local

# guards
nest g gu auth/guards/local-auth
nest g gu auth/guards/jwt-auth
nest g gu auth/guards/refresh-auth


# Jose for encripting JWT token
npm i jose

# jwt
npm i @nestjs/jwt @nestjs/config

# JWT tocken generation
openssl rand -base64 32

# Passport JWT library for auth with jwt
npm i passport-jwt
npm i -D @types/passport-jwt

```

## Chat Ref

- https://chatgpt.com/share/6ae07d95-2dc4-83e8-8404-ec498fa66fbc

## Used Prompts

My next app cannot update session. I tested my api though postman, it is working well. help

```
export const authFetch = async (
  url: string | URL,
  options: FetchOptions = {},
) => {
  const session = await getSession();
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${session?.accessToken}`,
  };

  let response = await fetch(url, options);
  if (response.status === 401) {
    if (!session?.refreshToken) {
      throw new Error("Refresh token not found in session.");
    }
    const newAccessToken = await refreshToken(session.refreshToken);

    if (newAccessToken) {
      options.headers.Authorization = `Bearer ${newAccessToken}`;
      response = await fetch(url, options);
    }
  }
  return response;
};


export const refreshToken = async (oldRefreshToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: oldRefreshToken }),
    });

    if (!response.ok) {
      // 2nd time gives error here
      throw new Error("Backend refresh failed: " + response.statusText);
    }

    const { accessToken, refreshToken } = await response.json();

    const updateTokens = await fetch(`${APP_URL}/api/auth/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, refreshToken }),
    });

    if (!updateTokens.ok) {
      const errorText = await updateTokens.text();
      console.error("API route error response:", errorText);

      throw new Error(
        `Session update failed (${updateTokens.status}): ${updateTokens.statusText}`,
      );
    }
    return accessToken;
  } catch (error) {
    console.error("Token refresh error: ", error);
    return null;
  }
};


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


export async function updateTokens({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookieSession = (await cookies()).get("session")?.value;

  if (!cookieSession) {
    throw new Error("Session cookie is missing");
  }

  const { payload } = await jwtVerify<Session>(
    cookieSession,
    ENCODED_SECRET_KEY,
  );

  const newPayload = {
    user: {
      ...payload.user,
    },
    accessToken,
    refreshToken,
  };

  await createSession(newPayload);
}

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
```