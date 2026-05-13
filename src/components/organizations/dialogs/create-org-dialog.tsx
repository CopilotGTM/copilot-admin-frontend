"use client";

import React, { useCallback, useEffect } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toaster } from "@/components/ui/toaster";
import type { CreateOrganizationRequest, OrganisationJobStatus } from "@/modules/organizations/types";
import { createOrganizationSchema, type CreateOrganizationInput } from "@/modules/organizations/schemas";
import { organizationKeys, useCountries, useCreateOrganizationAsync } from "@/modules/organizations/hooks";
import { streamJobStatus, type JobStreamController } from "@/modules/organizations/api";
import useAuthStore from "@/modules/auth/store/auth.store";
import { OrganizationFormFields } from "./organization-form-fields";

export interface CreateOrgDialogProps {
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

const initialJobStatus: OrganisationJobStatus = "pending";

export function CreateOrgDialog({ trigger, onSuccess }: Readonly<CreateOrgDialogProps>) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.access_token);
  const createOrgMutation = useCreateOrganizationAsync();
  const { data: countriesData } = useCountries();

  const [isOpen, setIsOpen] = React.useState(false);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [jobProgress, setJobProgress] = React.useState(0);
  const [jobStatus, setJobStatus] = React.useState<OrganisationJobStatus>(initialJobStatus);
  const [jobMessage, setJobMessage] = React.useState<string | null>(null);
  const [jobError, setJobError] = React.useState<string | null>(null);
  const jobStreamRef = React.useRef<JobStreamController | null>(null);

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    mode: "onChange",
    defaultValues: {
      organisation_name: "",
      agent_name: "",
      domain: [],
      country: "",
      sales_team_size: 0,
      company_address: "",
      linked_urls: [],
      website_urls: [],
      summary: "",
      logo_url: "",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = form;

  const jobStreamUrl = jobId ? `/organisations/jobs/${jobId}/stream` : null;
  const isJobTerminal = jobStatus === "completed" || jobStatus === "failed" || jobStatus === "cancelled";
  const isJobInProgress = Boolean(jobId && !isJobTerminal);
  const formId = "create-org-form";

  const resetJobState = useCallback(() => {
    jobStreamRef.current?.abort();
    jobStreamRef.current = null;
    setJobId(null);
    setJobProgress(0);
    setJobStatus(initialJobStatus);
    setJobMessage(null);
    setJobError(null);
  }, []);

  useEffect(() => {
    if (!isOpen || !jobId || !jobStreamUrl || isJobTerminal) return;

    if (!accessToken) {
      setJobStatus("failed");
      setJobError("Missing access token");
      return;
    }

    jobStreamRef.current?.abort();
    setJobMessage((message) => message ?? "Connecting to job stream...");

    jobStreamRef.current = streamJobStatus(
      jobStreamUrl,
      () => useAuthStore.getState().access_token,
      {
        onStatus: (event) => {
          setJobProgress(Number.isFinite(event.progress) ? Math.max(0, Math.min(100, event.progress)) : 0);
          setJobStatus(event.status);
          setJobMessage(event.status_message ?? null);
          setJobError(event.error_message ?? null);
        },
        onComplete: (event) => {
          setJobProgress(Number.isFinite(event.progress) ? Math.max(0, Math.min(100, event.progress)) : 0);
          setJobStatus(event.status);
          setJobMessage(event.status_message ?? null);
          setJobError(event.error_message ?? null);
          jobStreamRef.current?.abort();
          jobStreamRef.current = null;
        },
        onError: (error) => {
          setJobStatus("failed");
          setJobError(error.message);
          setJobMessage(null);
          jobStreamRef.current?.abort();
          jobStreamRef.current = null;
        },
      },
      { maxReconnects: 3, reconnectDelay: 1000 },
    );

    return () => {
      jobStreamRef.current?.abort();
      jobStreamRef.current = null;
    };
  }, [accessToken, isJobTerminal, isOpen, jobId, jobStreamUrl]);

  useEffect(() => {
    if (!jobId || !isJobTerminal) return;

    if (jobStatus === "completed") {
      toaster.create({
        title: "Organization created",
        description: "The organization has been provisioned successfully.",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      onSuccess?.();

      setTimeout(() => {
        reset();
        resetJobState();
        setIsOpen(false);
      }, 1000);
      return;
    }

    toaster.create({
      title: "Organization creation failed",
      description: jobError || "An error occurred during provisioning.",
      type: "error",
      duration: 5000,
    });
  }, [jobError, jobId, jobStatus, isJobTerminal, onSuccess, queryClient, reset, resetJobState]);

  const onSubmit = async (data: CreateOrganizationInput) => {
    const payload: CreateOrganizationRequest = {
      organisation_name: data.organisation_name,
      agent_name: data.agent_name,
      domain: data.domain ?? [],
      country: data.country,
      sales_team_size: Number(data.sales_team_size ?? 0),
      company_address: data.company_address,
      linked_urls: data.linked_urls ?? [],
      website_urls: data.website_urls ?? [],
      summary: data.summary,
      logo_url: data.logo_url,
    };

    try {
      const result = await createOrgMutation.mutateAsync(payload);
      setJobId(result.job_id);
      setJobStatus(result.status ?? initialJobStatus);
      setJobMessage(result.message || "Job submitted, waiting for progress...");
      setJobError(null);
      setJobProgress(0);
    } catch (error) {
      toaster.create({
        title: "Failed to submit",
        description: error instanceof Error ? error.message : "An error occurred",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && isJobInProgress) return;
    setIsOpen(open);
    if (!open) {
      reset();
      resetJobState();
    }
  }, [isJobInProgress, reset, resetJobState]);

  const renderJobProgress = () => {
    if (!jobId) return null;

    const isFailed = jobStatus === "failed" || jobStatus === "cancelled";

    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-8 text-center">
        {jobStatus === "completed" ? (
          <CheckCircle2 className="size-12 text-signal-success" />
        ) : isFailed ? (
          <XCircle className="size-12 text-signal-risk" />
        ) : (
          <Loader2 className="size-12 animate-spin text-brand-primary" />
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-fg-primary">
            {jobStatus === "completed"
              ? "Organization Created"
              : jobStatus === "failed"
                ? "Creation Failed"
                : jobStatus === "cancelled"
                  ? "Cancelled"
                  : "Creating Organization"}
          </h3>
          <p className="text-sm text-fg-secondary">
            {jobStatus === "completed"
              ? "Your organization has been provisioned successfully."
              : isFailed
                ? jobError || "An error occurred during provisioning."
                : jobMessage || "Starting..."}
          </p>
        </div>

        {!isJobTerminal ? (
          <div className="w-full">
            <Progress value={jobProgress} />
            <div className="mt-2 text-xs text-fg-muted">{jobProgress}% complete</div>
          </div>
        ) : null}

        {isFailed ? (
          <Button type="button" variant="outline" onClick={resetJobState}>
            Try Again
          </Button>
        ) : null}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent showCloseButton={!isJobInProgress} className="max-h-[85dvh] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="px-6 py-5">
          <DialogTitle>Create Organization</DialogTitle>
          {!jobId ? (
            <DialogDescription>Provide the organization details. Required fields are marked.</DialogDescription>
          ) : null}
        </DialogHeader>
        <Separator />

        <div className="overflow-y-auto px-6 py-5">
          {jobId ? (
            renderJobProgress()
          ) : (
            <form id={formId} onSubmit={handleSubmit(onSubmit)}>
              <OrganizationFormFields form={form} countries={countriesData?.countries} />
            </form>
          )}
        </div>

        <DialogFooter>
          {!jobId ? (
            <>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form={formId} disabled={!isValid || isSubmitting || createOrgMutation.isPending}>
                {isSubmitting || createOrgMutation.isPending ? <Spinner data-icon="inline-start" size="sm" /> : null}
                Create Organization
              </Button>
            </>
          ) : isJobTerminal && jobStatus === "completed" ? (
            <Button
              type="button"
              onClick={() => {
                reset();
                resetJobState();
                setIsOpen(false);
              }}
            >
              Done
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}