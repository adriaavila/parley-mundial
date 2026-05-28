import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const join = searchParams.get("join") || "";
  const state = JSON.stringify({ join });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const homeUrl = new URL("/", request.url);
    homeUrl.searchParams.set("error", "Google Client ID not configured en .env.local");
    if (join) {
      homeUrl.searchParams.set("join", join);
    }
    return NextResponse.redirect(homeUrl.toString());
  }

  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/auth/callback/google`;

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", state);
  googleAuthUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(googleAuthUrl.toString());
}
