// components/CreateOrgDialog.tsx
"use client";

import React, { useEffect, useCallback } from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Input,
  Text,
  IconButton,
  HStack,
  Image,
  Box,
  Separator,
  Textarea,
  InputGroup,
  Badge,
  Icon,
  Stack,
  createListCollection,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
  Progress,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Plus, Trash2, Globe, Link2, Image as ImageIcon, Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { CreateOrganizationRequest } from "@/modules/organizations/types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrganizationSchema, type CreateOrganizationInput } from "@/modules/organizations/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useCreateOrganizationAsync, useCountries, organizationKeys } from "@/modules/organizations/hooks";
import { streamJobStatus, type JobStreamController } from "@/modules/organizations/api";
import useAuthStore from "@/modules/auth/store/auth.store";
import { toaster } from "@/components/ui/toaster";

export interface CreateOrgDialogProps {
  trigger: React.ReactNode;
  /** Called when the job completes successfully (optional, for backwards compat) */
  onSuccess?: () => void;
}

export function CreateOrgDialog({ trigger, onSuccess }: Readonly<CreateOrgDialogProps>) {
  const queryClient = useQueryClient();
  const sectionBorder = useColorModeValue("gray.200", "gray.700");
  const sectionTitle = useColorModeValue("gray.700", "gray.100");
  const helperText = useColorModeValue("gray.500", "gray.400");
  const addButtonBgHover = useColorModeValue("gray.50", "whiteAlpha.100");

  const accessToken = useAuthStore((s) => s.access_token);

  // Job state (SSE tracking)
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [jobProgress, setJobProgress] = React.useState(0);
  const [jobStatus, setJobStatus] = React.useState<
    "pending" | "in_progress" | "completed" | "failed" | "cancelled"
  >("pending");
  const [jobMessage, setJobMessage] = React.useState<string | null>(null);
  const [jobError, setJobError] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const jobStreamRef = React.useRef<JobStreamController | null>(null);

  // Construct stream URL from job_id (don't use backend-provided stream_url)
  const jobStreamUrl = jobId ? `/organisations/jobs/${jobId}/stream` : null;

  // Mutations & queries
  const createOrgMutation = useCreateOrganizationAsync();

  const { data: countriesData } = useCountries();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, errors, isValid },
  } = useForm<CreateOrganizationInput>({
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

  const countryCollection = createListCollection({
    items: countriesData?.countries || [],
    itemToString: (item) => `${item.name} (${item.code})`,
    itemToValue: (item) => item.code,
  });

  const linked_urls = watch("linked_urls") || [];
  const website_urls = watch("website_urls") || [];
  const logo_url = watch("logo_url") || "";
  const domain = watch("domain") || [];

  const [linkedInput, setLinkedInput] = React.useState("");
  const [websiteInput, setWebsiteInput] = React.useState("");
  const [domainInput, setDomainInput] = React.useState("");

  const addLinkedUrl = () => {
    const v = linkedInput.trim();
    if (!v) return;
    setValue("linked_urls", [...linked_urls, v], { shouldValidate: true });
    setLinkedInput("");
  };
  const removeLinkedUrl = (idx: number) => {
    setValue(
      "linked_urls",
      linked_urls.filter((_, i) => i !== idx),
      { shouldValidate: true },
    );
  };

  const addWebsiteUrl = () => {
    const v = websiteInput.trim();
    if (!v) return;
    setValue("website_urls", [...website_urls, v], { shouldValidate: true });
    setWebsiteInput("");
  };
  const removeWebsiteUrl = (idx: number) => {
    setValue(
      "website_urls",
      website_urls.filter((_, i) => i !== idx),
      { shouldValidate: true },
    );
  };

  const addDomain = () => {
    const raw = domainInput.trim();
    if (!raw) return;
    const normalized = raw.startsWith("@") ? raw.slice(1) : raw;
    if (!normalized) return;
    if (domain.includes(normalized)) {
      setDomainInput("");
      return;
    }
    setValue("domain", [...domain, normalized], { shouldValidate: true });
    setDomainInput("");
  };
  const removeDomain = (idx: number) => {
    setValue(
      "domain",
      domain.filter((_, i) => i !== idx),
      { shouldValidate: true },
    );
  };

  // Determine if job is in a terminal state
  const isJobTerminal = jobStatus === "completed" || jobStatus === "failed" || jobStatus === "cancelled";
  const isJobInProgress = jobId && !isJobTerminal;

  // Start SSE stream when job is created
  useEffect(() => {
    if (!isOpen) return;
    if (!jobId || !jobStreamUrl) return;
    if (!accessToken) {
      setJobStatus("failed");
      setJobError("Missing access token");
      return;
    }
    if (isJobTerminal) return;

    // Ensure only one stream is active
    jobStreamRef.current?.abort();
    setJobMessage((m) => m ?? "Connecting to job stream...");

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

  // Handle job completion (will be triggered by SSE in Step 2)
  useEffect(() => {
    if (!jobId || !isJobTerminal) return;

    if (jobStatus === "completed") {
      toaster.create({
        title: "Organization created",
        description: "The organization has been provisioned successfully.",
        duration: 3000,
      });
      // Invalidate organizations list
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      onSuccess?.();
      // Reset and close after a brief delay
      setTimeout(() => {
        reset();
        setJobId(null);
        setJobProgress(0);
        setJobStatus("pending");
        setJobMessage(null);
        setJobError(null);
        jobStreamRef.current?.abort();
        jobStreamRef.current = null;
        setIsOpen(false);
      }, 1000);
    } else {
      toaster.create({
        title: "Organization creation failed",
        description: jobError || "An error occurred during provisioning.",
        type: "error",
        duration: 5000,
      });
    }
  }, [jobId, jobStatus, isJobTerminal, jobError, queryClient, onSuccess, reset]);

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
      setJobStatus(result.status ?? "pending");
      setJobMessage(result.message || "Job submitted, waiting for progress...");
      setJobError(null);
      setJobProgress(0);
    } catch (err) {
      toaster.create({
        title: "Failed to submit",
        description: err instanceof Error ? err.message : "An error occurred",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleOpenChange = useCallback((details: { open: boolean }) => {
    if (!details.open && isJobInProgress) {
      // Don't allow closing while job is in progress
      return;
    }
    setIsOpen(details.open);
    if (!details.open) {
      jobStreamRef.current?.abort();
      jobStreamRef.current = null;
      // Reset state when dialog closes
      reset();
      setJobId(null);
      setJobProgress(0);
      setJobStatus("pending");
      setJobMessage(null);
      setJobError(null);
    }
  }, [isJobInProgress, reset]);

  const formId = "create-org-form";

  // Render job progress UI
  const renderJobProgress = () => {
    if (!jobId) return null;

    return (
      <Stack gap={4} py={6} px={4} align="center">
        {jobStatus === "completed" ? (
          <Icon as={CheckCircle2} boxSize={12} color="green.500" />
        ) : jobStatus === "failed" || jobStatus === "cancelled" ? (
          <Icon as={XCircle} boxSize={12} color="red.500" />
        ) : (
          <Icon as={Loader2} boxSize={12} color="purple.500" className="animate-spin" />
        )}

        <Text fontWeight="semibold" fontSize="lg">
          {jobStatus === "completed"
            ? "Organization Created!"
            : jobStatus === "failed"
            ? "Creation Failed"
            : jobStatus === "cancelled"
            ? "Cancelled"
            : "Creating Organization..."}
        </Text>

        <Text fontSize="sm" color={helperText} textAlign="center">
          {jobStatus === "completed"
            ? "Your organization has been provisioned successfully."
            : jobStatus === "failed"
            ? jobError || "An error occurred during provisioning."
            : jobMessage || "Starting..."}
        </Text>

        {!isJobTerminal && (
          <Box w="full" maxW="sm">
            <Progress.Root value={jobProgress} size="sm" colorPalette="purple">
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
            <Text fontSize="xs" color={helperText} mt={1} textAlign="center">
              {jobProgress}% complete
            </Text>
          </Box>
        )}

        {isJobTerminal && jobStatus === "failed" && (
          <Button
            variant="outline"
            onClick={() => {
              jobStreamRef.current?.abort();
              jobStreamRef.current = null;
              setJobId(null);
              setJobProgress(0);
              setJobStatus("pending");
              setJobMessage(null);
              setJobError(null);
            }}
            mt={2}
          >
            Try Again
          </Button>
        )}
      </Stack>
    );
  };

  return (
    <Dialog.Root
      placement="center"
      scrollBehavior="inside"
      size={"xl"}
      motionPreset="slide-in-bottom"
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content display="flex" flexDirection="column" maxH={{ base: "85vh", md: "80vh" }} rounded="xl" boxShadow="lg">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="8px" right="8px" rounded="full" />
            </Dialog.CloseTrigger>

            <Dialog.Header>
              <Stack gap={1}>
                <Dialog.Title fontSize="lg" fontWeight="bold" lineHeight="28px" color="gray.700">
                  Create Organization
                </Dialog.Title>
                {!jobId && (
                  <Text fontSize="sm" color="gray.500">
                    Provide the organization details. Required fields are marked.
                  </Text>
                )}
              </Stack>
            </Dialog.Header>

            <Separator />

            <Dialog.Body flex="1 1 auto" overflowY="auto">
              {jobId ? (
                renderJobProgress()
              ) : (
              <form id={formId} onSubmit={handleSubmit(onSubmit)}>
                <Stack gap={5}>
                  <Box borderWidth="1px" borderColor={sectionBorder} rounded="lg" p={4}>
                    <Text fontWeight="semibold" color={sectionTitle} mb={3}>
                      Basics
                    </Text>
                    <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                      <FormControl isRequired>
                        <FormLabel>Organization Name</FormLabel>
                        <Input rounded="md" placeholder="Acme Corp" {...register("organisation_name")} />
                        {errors.organisation_name && (
                          <Text color="red.500" fontSize="xs">{errors.organisation_name.message}</Text>
                        )}
                      </FormControl>

                      <Controller
                        control={control}
                        name="country"
                        render={({ field }) => (
                          <FormControl isRequired>
                            <FormLabel>Country</FormLabel>
                            <SelectRoot
                              collection={countryCollection}
                              name={field.name}
                              value={field.value ? [field.value] : []}
                              onValueChange={(details: { value: string[] }) => field.onChange(details.value[0] || "")}
                            >
                              <SelectTrigger w="full" rounded="md">
                                <SelectValueText placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                {countryCollection.items.map((c) => (
                                  <SelectItem item={c} key={c.code}>
                                    {c.name} ({c.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </SelectRoot>
                            {errors.country && (
                              <Text color="red.500" fontSize="xs">{errors.country.message}</Text>
                            )}
                          </FormControl>
                        )}
                      />

                      <FormControl>
                        <FormLabel>Agent name</FormLabel>
                        <Input rounded="md" placeholder="Shield" {...register("agent_name")} />
                        <Text fontSize="xs" color={helperText} mt={1}>
                          Optional display name used in agent contexts.
                        </Text>
                        {errors.agent_name && (
                          <Text color="red.500" fontSize="xs">{errors.agent_name.message}</Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>Sales team size</FormLabel>
                        <Input rounded="md" type="number" min={0} placeholder="50" {...register("sales_team_size", { valueAsNumber: true })} />
                        {errors.sales_team_size && (
                          <Text color="red.500" fontSize="xs">{errors.sales_team_size.message}</Text>
                        )}
                      </FormControl>

                      <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                        <FormControl>
                          <FormLabel>Domains</FormLabel>
                          <HStack gap={2} align="stretch">
                            <Input
                              rounded="md"
                              h="48px"
                              placeholder="acme.com"
                              value={domainInput}
                              onChange={(e) => setDomainInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addDomain();
                                }
                              }}
                            />
                            <IconButton
                              aria-label="Add domain"
                              rounded="md"
                              variant="outline"
                              borderColor={sectionBorder}
                              h="48px"
                              w="48px"
                              minW="48px"
                              onClick={addDomain}
                              _hover={{ bg: addButtonBgHover }}
                            >
                              <Plus size={18} />
                            </IconButton>
                          </HStack>
                          <Text fontSize="xs" color={helperText} mt={1}>
                            Add email domains like <b>acme.com</b>. Press Enter to add.
                          </Text>
                          {errors.domain && (
                            <Text color="red.500" fontSize="xs">{errors.domain.message as string}</Text>
                          )}
                          {domain.length > 0 && (
                            <HStack gap={2} mt={2} flexWrap="wrap">
                              {domain.map((d, idx) => (
                                <HStack key={`${d}-${idx}`}>
                                  <Badge variant="subtle" colorPalette="blue" px={2} py={1} rounded="md">
                                    {d}
                                  </Badge>
                                  <IconButton aria-label="Remove" size="xs" rounded="sm" variant="ghost" onClick={() => removeDomain(idx)}>
                                    <Trash2 size={16} />
                                  </IconButton>
                                </HStack>
                              ))}
                            </HStack>
                          )}
                        </FormControl>
                      </Box>

                      <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                        <FormControl>
                          <FormLabel>Company address</FormLabel>
                          <Input rounded="md" placeholder="123 Market St, San Francisco" {...register("company_address")} />
                          {errors.company_address && (
                            <Text color="red.500" fontSize="xs">{errors.company_address.message}</Text>
                          )}
                        </FormControl>
                      </Box>
                    </Box>
                  </Box>

                  <Box borderWidth="1px" borderColor={sectionBorder} rounded="lg" p={4}>
                    <Text fontWeight="semibold" color={sectionTitle} mb={3}>
                      Links
                    </Text>

                    <Stack gap={4}>
                      <FormControl>
                        <FormLabel>Linked URLs</FormLabel>
                        <HStack gap={2} align="stretch">
                          <InputGroup
                            rounded="md"
                            startElement={
                              <Box w="44px" h="100%" display="flex" alignItems="center" justifyContent="center" pointerEvents="none">
                                <Icon as={Link2} color={helperText} boxSize={"18px"} />
                              </Box>
                            }
                          >
                            <Input
                              rounded="md"
                              h="48px"
                              ps={"56px"}
                              flex={1}
                              placeholder="https://www.linkedin.com/company/acme"
                              value={linkedInput}
                              onChange={(e) => setLinkedInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addLinkedUrl();
                                }
                              }}
                            />
                          </InputGroup>
                          <IconButton
                            aria-label="Add linked url"
                            rounded="md"
                            variant="outline"
                            borderColor={sectionBorder}
                            h="48px"
                            w="48px"
                            minW="48px"
                            onClick={addLinkedUrl}
                            _hover={{ bg: addButtonBgHover }}
                          >
                            <Plus size={18} />
                          </IconButton>
                        </HStack>
                        {errors.linked_urls && (
                          <Text color="red.500" fontSize="xs">{errors.linked_urls.message as string}</Text>
                        )}
                        {linked_urls.length > 0 && (
                          <HStack gap={2} mt={2} flexWrap="wrap">
                            {linked_urls.map((u, idx) => (
                              <HStack key={`${u}-${idx}`}>
                                <Badge variant="subtle" colorPalette="purple" px={2} py={1} rounded="md">{u}</Badge>
                                <IconButton aria-label="Remove" size="xs" rounded="sm" variant="ghost" onClick={() => removeLinkedUrl(idx)}>
                                  <Trash2 size={16} />
                                </IconButton>
                              </HStack>
                            ))}
                          </HStack>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>Website URLs</FormLabel>
                        <HStack gap={2} align="stretch">
                          <InputGroup
                            rounded="md"
                            startElement={
                              <Box w="44px" h="100%" display="flex" alignItems="center" justifyContent="center" pointerEvents="none">
                                <Icon as={Globe} color={helperText} boxSize={"18px"} />
                              </Box>
                            }
                          >
                            <Input
                              rounded="md"
                              h="48px"
                              ps={"56px"}
                              flex={1}
                              placeholder="https://acme.com"
                              value={websiteInput}
                              onChange={(e) => setWebsiteInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addWebsiteUrl();
                                }
                              }}
                            />
                          </InputGroup>
                          <IconButton
                            aria-label="Add website url"
                            rounded="md"
                            variant="outline"
                            borderColor={sectionBorder}
                            h="48px"
                            w="48px"
                            minW="48px"
                            onClick={addWebsiteUrl}
                            _hover={{ bg: addButtonBgHover }}
                          >
                            <Plus size={18} />
                          </IconButton>
                        </HStack>
                        {errors.website_urls && (
                          <Text color="red.500" fontSize="xs">{errors.website_urls.message as string}</Text>
                        )}
                        {website_urls.length > 0 && (
                          <HStack gap={2} mt={2} flexWrap="wrap">
                            {website_urls.map((u, idx) => (
                              <HStack key={`${u}-${idx}`}>
                                <Badge variant="subtle" colorPalette="gray" px={2} py={1} rounded="md">{u}</Badge>
                                <IconButton aria-label="Remove" size="xs" rounded="sm" variant="ghost" onClick={() => removeWebsiteUrl(idx)}>
                                  <Trash2 size={16} />
                                </IconButton>
                              </HStack>
                            ))}
                          </HStack>
                        )}
                      </FormControl>
                    </Stack>
                  </Box>

                  <Box borderWidth="1px" borderColor={sectionBorder} rounded="lg" p={4}>
                    <Text fontWeight="semibold" color={sectionTitle} mb={3}>
                      Branding
                    </Text>

                    <Stack gap={4}>
                      <FormControl>
                        <FormLabel>Summary</FormLabel>
                        <Textarea rounded="md" rows={3} placeholder="Short description of the organization" {...register("summary")} />
                        {errors.summary && (
                          <Text color="red.500" fontSize="xs">{errors.summary.message}</Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>Logo URL</FormLabel>
                        <InputGroup
                          rounded="md"
                          startElement={
                            <Box w="44px" h="100%" display="flex" alignItems="center" justifyContent="center" pointerEvents="none">
                              <Icon as={ImageIcon} color={helperText} boxSize={"18px"} />
                            </Box>
                          }
                        >
                          <Input rounded="md" h="48px" ps={"56px"} placeholder="https://.../logo.png" {...register("logo_url")} />
                        </InputGroup>
                        {errors.logo_url && (
                          <Text color="red.500" fontSize="xs">{errors.logo_url.message}</Text>
                        )}
                        {logo_url && (
                          <Box mt={3}>
                            <Text fontSize="xs" color={helperText} mb={2}>
                              Preview
                            </Text>
                            <Box borderWidth="1px" borderColor={sectionBorder} rounded="lg" p={2} maxW="220px">
                              <Image src={logo_url} alt="Logo preview" width="200px" height="auto" />
                            </Box>
                          </Box>
                        )}
                      </FormControl>
                    </Stack>
                  </Box>
                </Stack>
              </form>
              )}
            </Dialog.Body>

            <Separator />

            <Dialog.Footer>
              {!jobId ? (
                <>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline" p={4} rounded="md">
                      Cancel
                    </Button>
                  </Dialog.ActionTrigger>
                  <Button
                    type="submit"
                    form={formId}
                    bg="purple.600"
                    color="white"
                    rounded="md"
                    lineHeight="24px"
                    p={4}
                    _hover={{ bg: "purple.500" }}
                    loading={isSubmitting || createOrgMutation.isPending}
                    disabled={!isValid}
                  >
                    Create Organization
                  </Button>
                </>
              ) : isJobTerminal && jobStatus === "completed" ? (
                <Button
                  bg="purple.600"
                  color="white"
                  rounded="md"
                  p={4}
                  _hover={{ bg: "purple.500" }}
                  onClick={() => {
                    reset();
                    setJobId(null);
                    setJobProgress(0);
                    setJobStatus("pending");
                    setJobMessage(null);
                    setJobError(null);
                    setIsOpen(false);
                  }}
                >
                  Done
                </Button>
              ) : null}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
