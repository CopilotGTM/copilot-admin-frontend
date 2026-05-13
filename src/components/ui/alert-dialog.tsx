"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

export interface AlertDialogProps {
  trigger: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmColorPalette?: string;
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
  const isDestructive = confirmColorPalette === "red" || confirmColorPalette === "destructive";

  const handleConfirm = async () => {
    if (!onConfirm) {
      setOpen(false);
      return;
    }

    try {
      setIsLoading(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {typeof description === "string" ? <DialogDescription>{description}</DialogDescription> : description}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button type="button" variant={isDestructive ? "destructive" : "default"} disabled={isLoading} onClick={handleConfirm}>
            {isLoading ? <Spinner data-icon="inline-start" size="sm" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}