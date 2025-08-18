import { NextRequest, NextResponse } from "next/server";
import { makeAuthedRequest } from "../../utils";
import { SendMessageInput } from "../../../schemas/chat";
import { RFPSheetResponse } from "../../../types/rfp";

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageInput = await request.json();

    const externalRes = await makeAuthedRequest(
      request,
      `${process.env.API_URL}/chats/rfp_sheet/sheet_identification`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );

    const payload: RFPSheetResponse = await externalRes.json();
    return NextResponse.json(payload, { status: externalRes.status });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { status: "ERROR", message: err.message || "Server error" },
      { status: 500 },
    );
  }
}
