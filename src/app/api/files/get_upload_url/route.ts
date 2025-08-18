import { NextRequest, NextResponse } from "next/server";
import { makeAuthedRequest } from "../../utils";
import { UploadUrlResponse } from "../../../types/file";

export async function POST(request: NextRequest) {
  try {
    const { file_name, file_type, file_size, session_id } =
      await request.json();

    console.log("@@@@@@data", file_name, file_type, file_size, session_id);

    const externalRes = await makeAuthedRequest(
      request,
      `${process.env.API_URL}/chats/upload/get_upload_url`,
      {
        method: "POST",
        body: JSON.stringify({ file_name, file_type, file_size, session_id }),
      },
    );

    const payload: UploadUrlResponse = await externalRes.json();
    return NextResponse.json(payload, { status: externalRes.status });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { status: "ERROR", message: err.message || "Server error" },
      { status: 500 },
    );
  }
}
