// pages/api/chats/technical_deck/get_technical_deck.ts

import { NextRequest, NextResponse } from "next/server";
import { makeAuthedRequest } from "../../utils";
import { TDeckResponse } from "../../../types/tdeck";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get("session_id");
    const message_id = searchParams.get("message_id");
    const state = searchParams.get("state");

    // Validate query parameters
    if (!session_id || !message_id) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing session_id or message_id" },
        { status: 400 },
      );
    }

    // Construct the external API URL with query parameters
    const externalUrl = new URL(
      `${process.env.API_URL}/chats/technical_deck/get_technical_deck`,
    );
    externalUrl.searchParams.set("session_id", session_id);
    externalUrl.searchParams.set("message_id", message_id);
    if (state !== null && state !== undefined) {
      externalUrl.searchParams.set("state", state);
    }

    const externalRes = await makeAuthedRequest(
      request,
      externalUrl.toString(),
      {
        method: "GET",
      },
    );

    const payload: TDeckResponse = await externalRes.json();

    return NextResponse.json(payload, { status: externalRes.status });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { status: "ERROR", message: err.message || "Server error" },
      { status: 500 },
    );
  }
}
