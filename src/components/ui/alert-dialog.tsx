"use client";

import React from "react";
import { Button, CloseButton, Dialog, Portal, Text } from "@chakra-ui/react";

export interface AlertDialogProps {
  trigger: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmColorPalette?: string; // e.g., "red", "purple"
  onConfirm?: () => void | Promise<void>;
}

export default function AlertDialog(props: AlertDialogProps) {
  const {
    trigger,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    cancelLabel = "Cancel",
    confirmLabel = "Delete",
    confirmColorPalette = "red",
    onConfirm,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) {
      setOpen(false);
      return;
    }
    try {
      const maybePromise = onConfirm();
      if (maybePromise && typeof (maybePromise as Promise<void>).then === "function") {
        setIsLoading(true);
        await maybePromise;
      }
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root role="alertdialog" open={open} onOpenChange={(e) => setOpen(!!e.open)}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content p={2} rounded="lg">
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {typeof description === "string" ? <Text>{description}</Text> : description}
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">{cancelLabel}</Button>
              </Dialog.ActionTrigger>
              <Button colorPalette={confirmColorPalette} loading={isLoading} onClick={handleConfirm}>
                {confirmLabel}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
