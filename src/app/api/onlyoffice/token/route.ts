/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import type { DocumentEditorProps } from "@onlyoffice/document-editor-react";

export async function POST(request: NextRequest) {
  try {
    // Read your secret from env
    const secret = process.env.ONLYOFFICE_JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { status: "ERROR", message: "ONLYOFFICE_JWT_SECRET is not defined." },
        { status: 500 },
      );
    }

    // Expect { config: <ONLYOFFICE editor config> }
    const { config } = (await request.json()) as {
      config: DocumentEditorProps["config"];
    };

    // Sign the config payload
    const token = jwt.sign(config, secret, { algorithm: "HS256" });

    // Return { token: string }
    return NextResponse.json({ token }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { status: "ERROR", message: err.message ?? "Server error" },
      { status: 500 },
    );
  }
}
