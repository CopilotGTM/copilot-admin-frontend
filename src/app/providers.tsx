import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";
import ChakraProvider from "./chakra-provider";
import RestQueryClientProvider from "../components/HOC/restQueryClientProvider/RestQueryClientProvider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <RestQueryClientProvider>
      <ChakraProvider>{children}</ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </RestQueryClientProvider>
  );
}
