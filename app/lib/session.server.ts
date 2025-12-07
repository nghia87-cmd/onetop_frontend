import { createCookieSessionStorage, redirect } from "@remix-run/node";

// Create session storage with HttpOnly cookie
const sessionSecret = process.env.SESSION_SECRET || "default-secret-change-in-production";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    httpOnly: true, // XSS protection - JS cannot access
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secrets: [sessionSecret],
  },
});

/**
 * Get session from request
 */
export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

/**
 * Get user from session or redirect to login
 */
export async function requireAuth(request: Request) {
  const session = await getSession(request);
  const accessToken = session.get("access_token");
  const user = session.get("user");

  if (!accessToken || !user) {
    // Redirect to login with return URL
    const url = new URL(request.url);
    const redirectTo = url.pathname + url.search;
    
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return { accessToken, user, session };
}

/**
 * Create user session after login
 */
export async function createUserSession(
  accessToken: string,
  refreshToken: string,
  user: any,
  redirectTo: string = "/"
) {
  const session = await sessionStorage.getSession();
  
  session.set("access_token", accessToken);
  session.set("refresh_token", refreshToken);
  session.set("user", user);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

/**
 * Destroy session and logout
 */
export async function logout(request: Request) {
  const session = await getSession(request);
  
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

/**
 * Get optional user (for pages that work both logged in/out)
 */
export async function getOptionalUser(request: Request) {
  const session = await getSession(request);
  const user = session.get("user");
  const accessToken = session.get("access_token");

  return user && accessToken ? { user, accessToken } : null;
}
