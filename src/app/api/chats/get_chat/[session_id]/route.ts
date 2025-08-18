import { NextRequest, NextResponse } from "next/server";
import { makeAuthedRequest } from "../../../utils";
import { MessageResponseData } from "../../../../types/chat";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ session_id: string }> },
) {
  try {
    const { session_id } = await params;

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10"; // Default to 50 to match useChat
    const cursor = searchParams.get("cursor") || ""; // Default to empty string

    // Construct URL with query parameters
    const apiUrl = new URL(`${process.env.API_URL}/chats/get_chat`);
    apiUrl.searchParams.append("session_id", session_id);
    apiUrl.searchParams.append("limit", limit);
    apiUrl.searchParams.append("cursor", cursor);

    const externalRes = await makeAuthedRequest(request, apiUrl.toString(), {
      method: "GET",
    });

    const payload: MessageResponseData = await externalRes.json();

    return NextResponse.json(payload, { status: externalRes.status });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { status: "ERROR", message: err.message || "Server error" },
      { status: 500 },
    );
  }
}
