import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateStr = searchParams.get("state") || "{}";

  if (!code) {
    return NextResponse.json({ error: "Authorization code missing" }, { status: 400 });
  }

  let state: { join?: string } = {};
  try {
    state = JSON.parse(stateStr);
  } catch {
    // Ignore state parsing errors
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  const inviteCode = state.join || "";

  if (!clientId || !clientSecret || !convexUrl) {
    const homeUrl = new URL("/", request.url);
    homeUrl.searchParams.set("error", "OAuth environment variables missing");
    if (inviteCode) {
      homeUrl.searchParams.set("join", inviteCode);
    }
    return NextResponse.redirect(homeUrl.toString());
  }

  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/auth/callback/google`;

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();
    if (tokens.error) {
      return NextResponse.json({ error: tokens.error_description || "Token exchange failed" }, { status: 500 });
    }

    // Fetch user profile from Google using the access token
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo = await userInfoResponse.json();

    if (!userInfo.email) {
      return NextResponse.json({ error: "Failed to retrieve user email" }, { status: 500 });
    }

    // Instantiate Convex HTTP Client and call Google Auth Mutation
    const convex = new ConvexHttpClient(convexUrl);
    const result = await convex.mutation(api.users.loginOrSignupWithGoogle, {
      email: userInfo.email,
      name: userInfo.name || userInfo.given_name || "Mundialero",
    });

    // Redirect the browser back to the homepage, passing the session token and invite code
    const responseUrl = new URL("/", request.url);
    responseUrl.searchParams.set("token", result.sessionToken);
    if (inviteCode) {
      responseUrl.searchParams.set("join", inviteCode);
    }

    return NextResponse.redirect(responseUrl.toString());
  } catch (error) {
    console.error("Google OAuth Callback Error:", error);
    return NextResponse.json({ error: "Internal server error during Google OAuth" }, { status: 500 });
  }
}
