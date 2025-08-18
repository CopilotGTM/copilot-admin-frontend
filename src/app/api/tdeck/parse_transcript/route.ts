import { NextRequest, NextResponse } from "next/server";
import { makeAuthedRequest } from "../../utils";
import { FormattedTranscriptResponse } from "../../../types/tdeck";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get("session_id");
    const teachnical_deck_message_id = searchParams.get(
      "teachnical_deck_message_id",
    );

    // Validate query parameters
    if (!session_id || !teachnical_deck_message_id) {
      return NextResponse.json(
        {
          status: "ERROR",
          message: "Missing session_id or teachnical_deck_message_id",
        },
        { status: 400 },
      );
    }

    // Construct the external API URL with query parameters
    const externalUrl = new URL(
      `${process.env.API_URL}/chats/transcript/parse_transcript`,
    );
    externalUrl.searchParams.set("session_id", session_id);
    externalUrl.searchParams.set(
      "teachnical_deck_message_id",
      teachnical_deck_message_id,
    );

    const externalRes = await makeAuthedRequest(
      request,
      externalUrl.toString(),
      {
        method: "GET",
      },
    );

    const payload: FormattedTranscriptResponse = await externalRes.json();

    return NextResponse.json(payload, { status: externalRes.status });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { status: "ERROR", message: err.message || "Server error" },
      { status: 500 },
    );
  }
}
