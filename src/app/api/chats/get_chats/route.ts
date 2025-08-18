import { NextRequest, NextResponse } from "next/server";
import { makeAuthedRequest } from "../../utils";
import { ChatListResponseData } from "../../../types/chat";

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10"; // Default to 10 if not provided
    const cursor = searchParams.get("cursor") || ""; // Default to empty string if not provided

    // Construct URL with query parameters
    const apiUrl = new URL(`${process.env.API_URL}/chats/get_chats`);
    apiUrl.searchParams.append("limit", limit);
    apiUrl.searchParams.append("cursor", cursor);

    const externalRes = await makeAuthedRequest(request, apiUrl.toString(), {
      method: "GET",
    });

    const payload: ChatListResponseData = await externalRes.json();
    return NextResponse.json(payload, { status: externalRes.status });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { status: "ERROR", message: err.message || "Server error" },
      { status: 500 },
    );
  }
}
