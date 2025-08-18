import { NextRequest, NextResponse } from "next/server";
import { makeAuthedRequest } from "../../utils";
import { ChatListItem } from "../../../types/chat";

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    const externalRes = await makeAuthedRequest(
      request,
      `${process.env.API_URL}/chats/create_chat`,
      {
        method: "POST",
        body: JSON.stringify({ title }),
      },
    );

    const payload: ChatListItem = await externalRes.json();
    return NextResponse.json(payload, { status: externalRes.status });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { status: "ERROR", message: err.message || "Server error" },
      { status: 500 },
    );
  }
}
