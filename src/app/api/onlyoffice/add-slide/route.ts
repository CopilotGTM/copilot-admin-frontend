// app/api/onlyoffice/add-slide/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const { sourceUrl } = (await request.json()) as { sourceUrl?: string };
  if (!sourceUrl) {
    return NextResponse.json(
      { error: "sourceUrl is required" },
      { status: 400 },
    );
  }

  const docServer = process.env.ONLYOFFICE_DOC_SERVER!; // e.g. "http://localhost"
  const scriptUrl = `${process.env.NEXT_PUBLIC_HOST}/scripts/add-slide.docbuilder`;

  // Sign your "inbox" JWT so /docbuilder will accept this request
  const token = jwt.sign(
    // for HTTP API, the token payload should mirror the body you send
    { payload: { async: false, url: scriptUrl } },
    process.env.ONLYOFFICE_JWT_SECRET!,
    { algorithm: "HS256" },
  );

  // Build the JSON body the HTTP API expects:
  const body = {
    async: false,
    url: scriptUrl,
    // you could also pass arguments here if you had a dynamic script that used them
  };

  const resp = await fetch(`${docServer}/docbuilder?async=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return NextResponse.json({ error: err }, { status: resp.status });
  }

  const result = await resp.json();
  // result.urls will now contain { "samplepptx.pptx": "/ConvertService.ashx?filetype=pptx&key=…" }
  const fileName = "samplepptx.pptx";
  const fileUrl = result.urls?.[fileName];
  if (!fileUrl) {
    return NextResponse.json(
      { error: `No URL returned for ${fileName}`, detail: result },
      { status: 500 },
    );
  }

  // Make it absolute if it isn’t already
  const downloadUrl = fileUrl.startsWith("http")
    ? fileUrl
    : `${docServer}${fileUrl}`;

  return NextResponse.json({ url: downloadUrl });
}
