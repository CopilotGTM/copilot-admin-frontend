import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, otp, new_password } = body;

  const apiRes = await fetch(
    `${process.env.API_URL}/apis/auth/user/reset-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, new_password }),
    },
  );

  const data = await apiRes.json();
  return NextResponse.json(data, { status: apiRes.status });
}
