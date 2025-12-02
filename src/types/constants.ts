// Application constants

export const allowedDeckFileTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const allowedRFPFileTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const CHAT_LIST_LIMIT = 50;
export const CHAT_LIMIT = 10;

export const REMEMBER_EMAIL_KEY = "cg_remember_email" as const;
export const TOKEN_COOKIE_KEY = "cg_auth" as const;
