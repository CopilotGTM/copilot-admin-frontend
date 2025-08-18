/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import { Box } from "@chakra-ui/react";
import type { DocumentEditorProps } from "@onlyoffice/document-editor-react";
import React from "react";

// Dynamically load the onlyoffice editor on the client only
const DocumentEditor = dynamic(
  () =>
    import("@onlyoffice/document-editor-react").then(
      (mod) => mod.DocumentEditor,
    ),
  { ssr: false },
);

export interface OnlyOfficeEditorProps {
  config?: DocumentEditorProps["config"];
  token?: { value: string };
  onSave?: (url: string) => void;
  onError?: (error: any) => void;
}

function OnlyOfficeEditor({
  config,
  token,
  onSave,
  onError,
}: OnlyOfficeEditorProps) {
  const defaultConfig: DocumentEditorProps["config"] = {
    document: {
      fileType: "pptx",
      key: "unique-document-key",
      title: "Document Title",
      url: "", // URL to load the document from
    },
    documentType: "pptx",
    editorConfig: {
      mode: "edit",
      lang: "en-US",
      callbackUrl: "", // URL to save the document to
      customization: {
        chat: false,
        comments: true,
        feedback: false,
        forcesave: false,
      },
    },
    height: "100%",
    width: "100%",
  };

  console.log("@@@@@@token", token);

  const handleDocumentReady = () => {
    console.log("Document loaded successfully");
  };

  const handleDocumentStateChange = (event: object) => {
    console.log("Document state changed:", event);
  };

  const handleDocumentSave = (event: object) => {
    console.log("Document saved:", event);
    if (
      onSave &&
      "url" in event &&
      typeof (event as { url: string }).url === "string"
    ) {
      onSave((event as { url: string }).url);
    }
  };

  const handleError = (event: object) => {
    console.error("OnlyOffice error:", event);
    if (onError) {
      onError(event);
    }
  };

  const editorConfig = {
    ...defaultConfig,
    ...config,
    token: token?.value,
  };

  return (
    <Box h="full" w="full">
      <DocumentEditor
        id="onlyoffice-editor"
        documentServerUrl={process.env.NEXT_PUBLIC_ONLYOFFICE_URL || ""}
        config={editorConfig}
        events_onDocumentReady={handleDocumentReady}
        events_onDocumentStateChange={handleDocumentStateChange}
        events_onRequestSaveAs={handleDocumentSave}
        events_onError={handleError}
      />
    </Box>
  );
}

export default React.memo(OnlyOfficeEditor);
