"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

/**
 * Drop-in replacement for the old Chakra createToaster API.
 *
 * All existing consumers call `toaster.create({ title, description, type, duration })`.
 * This wrapper maps that shape onto Sonner's `toast[type](title, { description })`.
 */
type ToastOpts = {
  title?: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info" | "loading";
  duration?: number;
  action?: { label: string; onClick?: () => void };
};

type ShorthandOpts = { description?: string; duration?: number };

function buildOptions(opts: ToastOpts | ShorthandOpts) {
  const { description, duration } = opts;
  const action = "action" in opts ? opts.action : undefined;
  const options: Parameters<typeof sonnerToast>[1] = {
    description,
    duration,
    action: action
      ? { label: action.label, onClick: action.onClick ?? (() => {}) }
      : undefined,
  };
  return options;
}

export const toaster = {
  create(opts: ToastOpts) {
    const options = buildOptions(opts);
    switch (opts.type) {
      case "success":
        return sonnerToast.success(opts.title, options);
      case "error":
        return sonnerToast.error(opts.title, options);
      case "warning":
        return sonnerToast.warning(opts.title, options);
      case "info":
        return sonnerToast.info(opts.title, options);
      case "loading":
        return sonnerToast.loading(opts.title, options);
      default:
        return sonnerToast(opts.title, options);
    }
  },
  /** Shorthand: toaster.success("title"), toaster.success("title", { description }), or toaster.success({ title, description }) */
  success(titleOrOpts: string | ToastOpts, opts?: ShorthandOpts) {
    if (typeof titleOrOpts === "object") {
      return sonnerToast.success(titleOrOpts.title, buildOptions(titleOrOpts));
    }
    return sonnerToast.success(titleOrOpts, buildOptions(opts ?? {}));
  },
  error(titleOrOpts: string | ToastOpts, opts?: ShorthandOpts) {
    if (typeof titleOrOpts === "object") {
      return sonnerToast.error(titleOrOpts.title, buildOptions(titleOrOpts));
    }
    return sonnerToast.error(titleOrOpts, buildOptions(opts ?? {}));
  },
  warning(titleOrOpts: string | ToastOpts, opts?: ShorthandOpts) {
    if (typeof titleOrOpts === "object") {
      return sonnerToast.warning(titleOrOpts.title, buildOptions(titleOrOpts));
    }
    return sonnerToast.warning(titleOrOpts, buildOptions(opts ?? {}));
  },
  info(titleOrOpts: string | ToastOpts, opts?: ShorthandOpts) {
    if (typeof titleOrOpts === "object") {
      return sonnerToast.info(titleOrOpts.title, buildOptions(titleOrOpts));
    }
    return sonnerToast.info(titleOrOpts, buildOptions(opts ?? {}));
  },
  loading(titleOrOpts: string | ToastOpts, opts?: ShorthandOpts) {
    if (typeof titleOrOpts === "object") {
      return sonnerToast.loading(titleOrOpts.title, buildOptions(titleOrOpts));
    }
    return sonnerToast.loading(titleOrOpts, buildOptions(opts ?? {}));
  },
};

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        className: "text-sm",
      }}
    />
  );
}
