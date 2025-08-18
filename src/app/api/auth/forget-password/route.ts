import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { email } = body;

  const apiRes = await fetch(
    `${process.env.API_URL}/apis/auth/user/forgot-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
  );

  const data = await apiRes.json();
  return NextResponse.json(data, { status: apiRes.status });
}
