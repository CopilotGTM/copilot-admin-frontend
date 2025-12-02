import { REMEMBER_EMAIL_KEY } from "../../../types/constants";

export const getRememberedEmail = (): string => {
  if (globalThis.window === undefined) return "";
  return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
};

export const setRememberedEmail = (email: string): void => {
  if (globalThis.window !== undefined) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  }
};

export const clearRememberedEmail = (): void => {
  if (globalThis.window !== undefined) {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }
};
