import { NextRequest } from "next/server";

export async function makeAuthedRequest(
  request: NextRequest,
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const cookies = request.cookies;

  if (!cookies) {
    throw new Error("Missing cookies");
  }

  /* let cookieHeader = "";

  try {
    // Just make sure it's valid JSON
    JSON.parse(authStorage);
    cookieHeader = `auth-storage=${encodeURIComponent(authStorage)};`;
  } catch (e) {
    console.error("Failed to parse auth-storage cookie:", e);
    throw new Error("Invalid auth-storage cookie format");
  } */

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: `${cookies}`,
      "Content-Type": "application/json",
    },
  });
}
