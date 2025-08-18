// src/core/rest-client/rest-client.tanStack.ts
import { QueryClient } from "@tanstack/react-query";

const restTanStackClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default restTanStackClient;
