import {
  FileUpload,
  Flex,
  Icon,
  IconButton,
  Span,
  Text,
} from "@chakra-ui/react";
import { CloudUpload, Plus } from "lucide-react";
import { useMemo } from "react";
import { AttachmentMetadata } from "../app/types/file";
//import { useMutation } from "@tanstack/react-query";
import { getUploadUrl, uploadFileToSignedUrl } from "../lib/file";
// import { FileUploadInput } from "../app/schemas/chat";
import { allowedRFPFileTypes, allowedDeckFileTypes } from "../lib/CONSTANTS";
import { MessageType } from "../app/types/chat";

// CustomDropZone component
interface CustomFileUploadProps {
  sessionId: string;
  setUploadedFiles: React.Dispatch<React.SetStateAction<AttachmentMetadata[]>>;
  fileUploadType?: "IconButton" | "DropZone";
  acceptedFiles: File[];
  setAcceptedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setUploadingFiles: React.Dispatch<React.SetStateAction<Set<string>>>;
  label?: string;
  messageType: MessageType;
}

export const CustomFileUpload = ({
  sessionId,
  setUploadedFiles,
  fileUploadType = "DropZone",
  acceptedFiles,
  setAcceptedFiles,
  setUploadingFiles,
  label = "Transcript or Call Recording",
  messageType = "GENERAL_MESSAGE",
}: CustomFileUploadProps) => {
  //const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  //const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  //const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  /* // Mutation for getting upload URL
  const uploadMutation = useMutation({
    mutationFn: getUploadUrl,
    onSuccess: async (data, variables) => {
      const file = acceptedFiles.find((f) => f.name === variables.file_name);
      if (file) {
        uploadFileMutation.mutate({ upload_url: data.upload_url, file });
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("Upload URL error:", error);
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        acceptedFiles.forEach((file) => newSet.delete(file.name));
        return newSet;
      });
    },
  });

  // Mutation for file upload
  const uploadFileMutation = useMutation({
    mutationFn: uploadFileToSignedUrl,
    onSuccess: (_data, variables) => {
      const file = variables.file;
      const newFileMetadata: AttachmentMetadata = {
        filename: file.name,
        url: variables.upload_url.split("?")[0] as string, // Cast to HttpUrl
        mimetype: file.type,
        size_bytes: file.size,
        uploaded_at: new Date().toISOString(),
        metadata: {},
      };

      setUploadedFiles((prev) => {
        const updatedFiles = [...prev, newFileMetadata];
        return updatedFiles;
      });

      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(file.name);
        return newSet;
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any, variables) => {
      console.error("File upload error:", error);
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(variables.file.name);
        return newSet;
      });
    },
  }); */

  const handleFileUpload = (details: { files: File[] }) => {
    const validFiles = details.files.filter(
      (file) => file.size <= 50 * 1024 * 1024,
    );

    if (validFiles.length !== details.files.length) {
      alert("Some files exceed 50 MB limit");
    }

    if (validFiles.length > 0) {
      setAcceptedFiles((prev) => [...prev, ...validFiles]);
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        validFiles.forEach((file) => newSet.add(file.name));
        return newSet;
      });

      // validFiles.forEach((file) => {
      //   const fileData: FileUploadInput = {
      //     file_name: file.name,
      //     file_type: file.type,
      //     file_size: file.size,
      //     session_id: sessionId,
      //   };
      //   uploadMutation.mutate(fileData);
      // });

      // 🚀 instead of uploadMutation.mutate(...), do your two calls in an async IIFE
      validFiles.forEach((file) => {
        (async () => {
          try {
            // 1) get the signed URL for *this* file
            const { upload_url } = await getUploadUrl({
              session_id: sessionId,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
            });

            // 2) upload *this* file to that URL
            await uploadFileToSignedUrl({ upload_url, file });

            // 3) on success, push into your parent state
            const newMeta: AttachmentMetadata = {
              filename: file.name,
              url: upload_url.split("?")[0],
              mimetype: file.type,
              size_bytes: file.size,
              uploaded_at: new Date().toISOString(),
              metadata: {},
            };
            setUploadedFiles((prev) => [...prev, newMeta]);
          } catch (err) {
            console.error("upload failed for", file.name, err);
          } finally {
            // 4) always remove from “uploading” set
            setUploadingFiles((prev) => {
              const s = new Set(prev);
              s.delete(file.name);
              return s;
            });
          }
        })();
      });
    }
  };

  const allowedFileTypes = useMemo(() => {
    if (messageType === "RFP_SHEET") {
      return allowedRFPFileTypes;
    } else if (messageType === "TECHNICAL_DECK") {
      return allowedDeckFileTypes;
    } else {
      return [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/*",
      ];
    }
  }, [messageType]);

  return (
    <>
      {fileUploadType === "DropZone" && acceptedFiles.length === 0 ? (
        <FileUpload.Root
          w="full"
          bg="white"
          alignItems="stretch"
          maxFiles={10}
          accept={allowedFileTypes.join(",")}
          onFileAccept={handleFileUpload}
        >
          <FileUpload.HiddenInput />
          <FileUpload.Dropzone
            py={"15px"}
            px={"24px"}
            gap={"24px"}
            borderRadius={"12px"}
            minH={20}
            borderColor={"gray.200"}
          >
            <Flex
              gap={"24px"}
              alignItems={"center"}
              justifyContent={"start"}
              w="full"
            >
              <Icon size="md" boxSize={7} color="fg.muted">
                <CloudUpload />
              </Icon>
              <FileUpload.DropzoneContent textAlign={"start"}>
                <Flex flexDirection={"column"}>
                  <Text
                    fontSize={"sm"}
                    fontWeight={"normal"}
                    lineHeight={"20px"}
                    color={"gray.800"}
                  >
                    Click here to upload (or) drag and drop{" "}
                    <Span fontWeight={"bold"}>{label}</Span>
                  </Text>
                  <Text
                    fontSize={"xs"}
                    lineHeight={"16px"}
                    fontWeight={"normal"}
                    color="gray.400"
                  >
                    {`${messageType === "RFP_SHEET" ? "EXCEL" : messageType === "TECHNICAL_DECK" ? "PDF OR DOCX" : "PDF, DOCX OR IMAGE"} file up to 50 MB`}
                  </Text>
                </Flex>
              </FileUpload.DropzoneContent>
            </Flex>
          </FileUpload.Dropzone>
          {/* <FileUpload.List clearable /> */}
        </FileUpload.Root>
      ) : fileUploadType === "IconButton" ? (
        <FileUpload.Root
          maxFiles={10}
          accept={allowedFileTypes.join(",")}
          onFileAccept={handleFileUpload}
        >
          <FileUpload.HiddenInput />
          <FileUpload.Trigger asChild>
            <IconButton
              aria-label="Upload files"
              variant="ghost"
              rounded={"full"}
              size={"md"}
              color={"gray.500"}
              //disabled={isLoading || messageType === "TECHNICAL_DECK"}
            >
              <Plus />
            </IconButton>
          </FileUpload.Trigger>
          {/* <FileUpload.List /> */}
          {/* Custom File List */}
        </FileUpload.Root>
      ) : null}

      {/* <ConfirmationDialog
        title="Technical Deck"
        description={`Let’s start the process of technical deck creation.`}
        confirmButton="Create Technical Deck"
        onConfirm={() => setConfirmShowDialog(false)}
        onCancel={() => setConfirmShowDialog(false)}
        isOpen={showConfirmDialog}
      /> */}
    </>
  );
};
