import { Icon } from "@chakra-ui/react";
import { JSX } from "react";
import { FaFileExcel, FaFileWord, FaFilePdf } from "react-icons/fa"; // Icons for file types

// Map file extensions to icons
export const fileIconMap: { [key: string]: JSX.Element } = {
  xlsx: <Icon as={FaFileExcel} color="green.500" />,
  docx: <Icon as={FaFileWord} color="blue.500" />,
  pdf: <Icon as={FaFilePdf} color="red.500" />,
};

// Function to get file extension
export const getFileExtension = (fileName: string) => {
  return fileName.split(".").pop()?.toLowerCase() || "";
};
