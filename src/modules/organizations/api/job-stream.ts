/**
 * SSE-based job status streaming utility.
 *
 * Browser EventSource doesn't support custom headers (Authorization),
 * so we use streaming fetch() with manual SSE frame parsing.
 */

import type { JobStatusEvent, OrganisationJobStatus } from "../types/organization.types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface JobStreamCallbacks {
  /** Called when job status/progress updates */
  onStatus: (event: JobStatusEvent) => void;
  /** Called when job reaches terminal state (completed/failed/cancelled) */
  onComplete: (event: JobStatusEvent) => void;
  /** Called on stream error (network, auth, etc.) */
  onError: (error: Error, code?: string) => void;
  /** Called when stream is closed (either normally or due to error) */
  onClose?: () => void;
}

export interface JobStreamOptions {
  /** Max reconnection attempts on timeout/recoverable errors (default: 3) */
  maxReconnects?: number;
  /** Delay between reconnection attempts in ms (default: 1000) */
  reconnectDelay?: number;
}

export interface JobStreamController {
  /** Abort the stream */
  abort: () => void;
  /** Check if stream is active */
  isActive: () => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SSE Parser
// ─────────────────────────────────────────────────────────────────────────────

interface SSEMessage {
  event: string;
  data: string;
  id?: string;
  retry?: number;
}

/**
 * Parse SSE frames from a text chunk.
 * SSE format: "event: <name>\ndata: <json>\n\n"
 */
function parseSSEMessages(chunk: string): SSEMessage[] {
  const messages: SSEMessage[] = [];
  const blocks = chunk.split("\n\n").filter(Boolean);

  for (const block of blocks) {
    const lines = block.split("\n");
    const message: SSEMessage = { event: "message", data: "" };

    for (const line of lines) {
      if (line.startsWith(":")) {
        continue;
      }
      if (line.startsWith("event:")) {
        message.event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        const next = line.slice(5).trim();
        message.data = message.data ? `${message.data}\n${next}` : next;
      } else if (line.startsWith("id:")) {
        message.id = line.slice(3).trim();
      } else if (line.startsWith("retry:")) {
        message.retry = parseInt(line.slice(6).trim(), 10);
      }
    }

    if (message.data) {
      messages.push(message);
    }
  }

  return messages;
}

// ─────────────────────────────────────────────────────────────────────────────
// Terminal status check
// ─────────────────────────────────────────────────────────────────────────────

const TERMINAL_STATUSES: OrganisationJobStatus[] = ["completed", "failed", "cancelled"];

function isTerminalStatus(status: OrganisationJobStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

// ─────────────────────────────────────────────────────────────────────────────
// Stream function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stream job status updates via SSE.
 *
 * @param streamUrl - The SSE endpoint URL (from job acceptance payload)
 * @param token - Authorization bearer token
 * @param callbacks - Event handlers for status, complete, error, close
 * @param options - Optional configuration (reconnect attempts, delay)
 * @returns Controller object to abort the stream
 */
export function streamJobStatus(
  streamUrl: string,
  token: string | (() => string | null),
  callbacks: JobStreamCallbacks,
  options: JobStreamOptions = {}
): JobStreamController {
  const { maxReconnects = 3, reconnectDelay = 1000 } = options;

  let abortController = new AbortController();
  let isAborted = false;
  let reconnectCount = 0;
  let buffer = "";
  let lastStatusEvent: JobStatusEvent | null = null;

  const resolveToken = (): string | null => {
    if (typeof token === "function") {
      return token();
    }
    return token;
  };

  const connect = async () => {
    if (isAborted) return;

    try {
      // Resolve full URL
      // streamUrl should be relative like /organisations/jobs/{id}/stream
      // baseUrl (NEXT_PUBLIC_API_BASE_URL) already includes /admin prefix
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const fullUrl = streamUrl.startsWith("http")
        ? streamUrl
        : `${baseUrl}${streamUrl.startsWith("/") ? streamUrl : `/${streamUrl}`}`;

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          ...(resolveToken() ? { Authorization: `Bearer ${resolveToken()}` } : {}),
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
        signal: abortController.signal,
      });

      if (!resolveToken()) {
        throw new Error("Missing access token");
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Read stream
      while (!isAborted) {
        const { done, value } = await reader.read();

        if (done) {
          // Stream ended normally
          callbacks.onClose?.();
          break;
        }

        // Decode chunk and append to buffer
        buffer += decoder.decode(value, { stream: true });
        // Normalize CRLF to LF so SSE frame splitting works on Windows line endings
        buffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

        // Only parse complete SSE frames (terminated by \n\n)
        const lastDoubleNewline = buffer.lastIndexOf("\n\n");
        if (lastDoubleNewline === -1) {
          continue;
        }

        const completeChunk = buffer.slice(0, lastDoubleNewline);
        buffer = buffer.slice(lastDoubleNewline + 2);

        const messages = parseSSEMessages(completeChunk);

        for (const msg of messages) {
          handleSSEMessage(msg);
        }
      }
    } catch (error) {
      if (isAborted) return;

      const err = error instanceof Error ? error : new Error(String(error));

      // Check if we should reconnect
      if (err.name === "AbortError") {
        // Manual abort, don't reconnect
        callbacks.onClose?.();
        return;
      }

      // Attempt reconnect for network errors
      if (reconnectCount < maxReconnects) {
        reconnectCount++;
        console.warn(`[JobStream] Reconnecting (${reconnectCount}/${maxReconnects})...`);
        await new Promise((resolve) => setTimeout(resolve, reconnectDelay));
        // Create new AbortController for reconnect
        abortController = new AbortController();
        connect();
        return;
      }

      // Max reconnects exceeded
      callbacks.onError(err, "max_reconnects");
      callbacks.onClose?.();
    }
  };

  const handleSSEMessage = (msg: SSEMessage) => {
    switch (msg.event) {
      case "status": {
        try {
          const event: JobStatusEvent = JSON.parse(msg.data);
          lastStatusEvent = event;
          callbacks.onStatus(event);

          // Check for terminal status
          if (isTerminalStatus(event.status)) {
            callbacks.onComplete(event);
            // Stream should close after terminal event
          }
        } catch (e) {
          console.error("[JobStream] Failed to parse status event:", e);
        }
        break;
      }

      case "complete": {
        // Per doc: complete is a lightweight terminal signal { message: "job_completed" }
        // Use the last status event for the completion callback
        if (lastStatusEvent && isTerminalStatus(lastStatusEvent.status)) {
          callbacks.onComplete(lastStatusEvent);
        } else if (lastStatusEvent) {
          // Edge case: complete arrived but last status wasn't terminal
          // Mark as completed and call onComplete
          const terminalEvent: JobStatusEvent = {
            ...lastStatusEvent,
            status: "completed",
          };
          callbacks.onComplete(terminalEvent);
        } else {
          // No status received yet, just close
          callbacks.onClose?.();
        }
        // Stop listening after complete
        isAborted = true;
        abortController.abort();
        break;
      }

      case "ping": {
        // Heartbeat - no action needed
        break;
      }

      case "timeout": {
        // Stream timeout - per doc: { message, timeout_seconds, reconnect: true }
        try {
          const timeoutData = JSON.parse(msg.data);
          const shouldReconnect = timeoutData.reconnect === true;

          if (shouldReconnect && reconnectCount < maxReconnects) {
            console.warn("[JobStream] Stream timeout, reconnecting...");
            reconnectCount++;
            abortController.abort();
            abortController = new AbortController();
            setTimeout(() => connect(), reconnectDelay);
          } else {
            callbacks.onError(new Error(timeoutData.message || "Stream timeout"), "timeout");
            callbacks.onClose?.();
          }
        } catch {
          // Fallback if parsing fails
          if (reconnectCount < maxReconnects) {
            reconnectCount++;
            abortController.abort();
            abortController = new AbortController();
            setTimeout(() => connect(), reconnectDelay);
          } else {
            callbacks.onError(new Error("Stream timeout, max reconnects exceeded"), "timeout");
            callbacks.onClose?.();
          }
        }
        break;
      }

      case "error": {
        try {
          const errorData = JSON.parse(msg.data);
          const errorMsg = errorData.message || errorData.error || "Unknown SSE error";
          const errorCode = errorData.code || "sse_error";

          // Per doc: reconnect field indicates if client should reconnect
          const shouldReconnect = errorData.reconnect === true;
          if (shouldReconnect && reconnectCount < maxReconnects) {
            console.warn("[JobStream] Recoverable error, reconnecting...");
            reconnectCount++;
            abortController.abort();
            abortController = new AbortController();
            setTimeout(() => connect(), reconnectDelay);
          } else {
            callbacks.onError(new Error(errorMsg), errorCode);
            callbacks.onClose?.();
          }
        } catch {
          callbacks.onError(new Error(msg.data || "Unknown SSE error"), "sse_error");
          callbacks.onClose?.();
        }
        break;
      }

      default: {
        // Unknown event type - log for debugging
        console.debug("[JobStream] Unknown event type:", msg.event);
      }
    }
  };

  // Start connection
  connect();

  // Return controller
  return {
    abort: () => {
      isAborted = true;
      abortController.abort();
    },
    isActive: () => !isAborted,
  };
}
