// components/MarkdownEditor.tsx
import { Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { commands } from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  initialValue: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ initialValue }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <Box
      //maxW="container.lg"
      w={"full"}
      mx="auto"
      //flex={1}
      h={"full"}
      //p={4}
      css={{
        // Custom styles for MDEditor to match Textarea
        "& .w-md-editor": {
          //maxHeight: "400px",
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "gray.200",
          overflow: "hidden",
          boxShadow: "none",
        },
        ".w-md-editor-text": {
          fontSize: "sm",
          lineHeight: "20px",
          fontWeight: "normal",
          color: "gray.800",
          padding: "12px 24px",
          backgroundColor: "white",
        },
        ".w-md-editor-content": {
          maxHeight: "360px", // Account for toolbar height
          overflowY: "auto",
        },
        ".w-md-editor-preview": {
          fontSize: "sm",
          lineHeight: "20px",
          color: "gray.800",
          padding: "12px 24px",
          backgroundColor: "white",
        },
        "& .w-md-editor-toolbar": {
          borderBottom: "1px solid",
          borderColor: "gray.200",
          backgroundColor: "gray.50",
        },
      }}
    >
      <MDEditor
        value={value}
        onChange={(val) => setValue(val || "")}
        height={"100%"}
        preview="edit"
        extraCommands={[commands.codeEdit, commands.codePreview]}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
          //disallowedElements: ["style"],
        }}
        visibleDragbar={false}
        textareaProps={{
          style: {
            fontSize: "14px", // Matches fontSize="sm"
            lineHeight: "20px",
            color: "#1A202C", // Matches gray.800
            padding: "12px 24px",
          },
        }}
        //components={}
      />
    </Box>
  );
};

export default MarkdownEditor;
