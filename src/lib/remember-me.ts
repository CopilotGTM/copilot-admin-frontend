export const REMEMBER_EMAIL_KEY = "cg_remember_email" as const;

export const getRememberedEmail = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
};

export const setRememberedEmail = (email: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  }
};

export const clearRememberedEmail = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }
}; 