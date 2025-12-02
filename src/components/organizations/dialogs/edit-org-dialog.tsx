/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Input,
  Text,
  IconButton,
  HStack,
  Box,
  Separator,
  Textarea,
  InputGroup,
  Badge,
  Icon,
  Stack,
  Image,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Plus, Trash2, Globe, Link2, Image as ImageIcon } from "lucide-react";
import type { OrganizationListItem, UpdateOrganizationRequest, OrganizationDetail } from "@/modules/organizations/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrganizationSchema, type CreateOrganizationInput } from "@/modules/organizations/schemas";

export interface EditOrgDialogProps {
  trigger: React.ReactNode;
  org: OrganizationListItem;
  onUpdate: (
    organisation_id: string,
    payload: UpdateOrganizationRequest,
  ) => Promise<OrganizationDetail>;
}

export default function EditOrgDialog({ trigger, org, onUpdate }: Readonly<EditOrgDialogProps>) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, errors, isValid },
  } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    mode: "onChange",
    defaultValues: {
      organisation_name: org.organisation_name ?? "",
      country: org.country ?? "",
      sales_team_size: org.sales_team_size ?? 0,
      company_address: org.company_address ?? "",
      billing_address: org.billing_address ?? "",
      linked_urls: org.linked_urls ?? [],
      website_urls: org.website_urls ?? [],
      summary: org.summary ?? "",
      logo_url: org.logo_url ?? "",
    },
  });

  const original = React.useRef({
    organisation_name: org.organisation_name ?? "",
    country: org.country ?? "",
    sales_team_size: org.sales_team_size ?? 0,
    company_address: org.company_address ?? "",
    billing_address: org.billing_address ?? "",
    linked_urls: org.linked_urls ?? [],
    website_urls: org.website_urls ?? [],
    summary: org.summary ?? "",
    logo_url: org.logo_url ?? "",
  });

  const linked_urls = watch("linked_urls") || [];
  const website_urls = watch("website_urls") || [];
  const logo_url = watch("logo_url") || "";

  const [linkedInput, setLinkedInput] = React.useState("");
  const [websiteInput, setWebsiteInput] = React.useState("");

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

  function buildChangedPayload(values: CreateOrganizationInput): UpdateOrganizationRequest {
    const changed: UpdateOrganizationRequest = {};
    const keys = Object.keys(original.current) as (keyof CreateOrganizationInput)[];
    for (const key of keys) {
      const prevVal = original.current[key] as unknown;
      const currVal = values[key] as unknown;
      const equal = Array.isArray(prevVal) || Array.isArray(currVal)
        ? JSON.stringify(prevVal) === JSON.stringify(currVal)
        : prevVal === currVal;
      if (!equal) {
        // Coerce number field
        if (key === "sales_team_size") {
          (changed as any)[key] = Number(currVal as number);
        } else {
          (changed as any)[key] = currVal as any;
        }
      }
    }
    return changed;
  }

  const onSubmit = async (data: CreateOrganizationInput) => {
    const payload = buildChangedPayload(data);
    const res = await onUpdate(org.organisation_id, payload);
    // Refresh original with latest
    original.current = {
      organisation_name: res.organisation_name ?? data.organisation_name,
      country: res.country ?? data.country,
      sales_team_size: res.sales_team_size ?? data.sales_team_size,
      company_address: res.company_address ?? data.company_address,
      billing_address: (res as any).billing_address ?? data.billing_address,
      linked_urls: res.linked_urls ?? data.linked_urls,
      website_urls: res.website_urls ?? data.website_urls,
      summary: res.summary ?? data.summary,
      logo_url: res.logo_url ?? data.logo_url,
    };
    reset(original.current);
    return res;
  };

  const formId = `edit-org-form-${org.organisation_id}`;

  return (
    <Dialog.Root placement="center" scrollBehavior="inside" size={"xl"} motionPreset="slide-in-bottom">
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
                  Edit Organization
                </Dialog.Title>
                <Text fontSize="sm" color="gray.500">
                  Update the organization details and save changes.
                </Text>
              </Stack>
            </Dialog.Header>

            <Separator />

            <Dialog.Body flex="1 1 auto" overflowY="auto">
              <form id={formId} onSubmit={handleSubmit(onSubmit)}>
                <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl isRequired>
                    <FormLabel>Organization Name</FormLabel>
                    <Input rounded="md" placeholder="New Test Org" {...register("organisation_name")} />
                    {errors.organisation_name && (
                      <Text color="red.500" fontSize="xs">{errors.organisation_name.message}</Text>
                    )}
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Country</FormLabel>
                    <Input rounded="md" placeholder="USA" {...register("country")} />
                    {errors.country && (
                      <Text color="red.500" fontSize="xs">{errors.country.message}</Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Sales team size</FormLabel>
                    <Input rounded="md" type="number" min={0} placeholder="50" {...register("sales_team_size", { valueAsNumber: true })} />
                    {errors.sales_team_size && (
                      <Text color="red.500" fontSize="xs">{errors.sales_team_size.message}</Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Company address</FormLabel>
                    <Input rounded="md" placeholder="123 Test Street, Test City" {...register("company_address")} />
                    {errors.company_address && (
                      <Text color="red.500" fontSize="xs">{errors.company_address.message}</Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Billing address</FormLabel>
                    <Input rounded="md" placeholder="123 Test Street, Test City" {...register("billing_address")} />
                    {errors.billing_address && (
                      <Text color="red.500" fontSize="xs">{errors.billing_address.message}</Text>
                    )}
                  </FormControl>

                  {/* Linked URLs */}
                  <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormControl>
                      <FormLabel>Linked URLs</FormLabel>
                      <HStack gap={2}>
                        <InputGroup
                          rounded="md"
                          startElement={
                            <Button disabled variant="ghost" w="48px" h="48px" rounded="md">
                              <Icon as={Link2} color="gray.400" />
                            </Button>
                          }
                        >
                          <Input
                            rounded="md"
                            flex={1}
                            placeholder="https://www.linkedin.com/company/test"
                            value={linkedInput}
                            onChange={(e) => setLinkedInput(e.target.value)}
                          />
                        </InputGroup>
                        <IconButton aria-label="Add linked url" rounded="md" onClick={addLinkedUrl}>
                          <Plus />
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
                              <IconButton aria-label="Remove" size="xs" rounded="sm" onClick={() => removeLinkedUrl(idx)}>
                                <Trash2 />
                              </IconButton>
                            </HStack>
                          ))}
                        </HStack>
                      )}
                    </FormControl>
                  </Box>

                  {/* Website URLs */}
                  <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormControl>
                      <FormLabel>Website URLs</FormLabel>
                      <HStack gap={2}>
                        <InputGroup
                          rounded="md"
                          startElement={
                            <Button disabled variant="ghost" w="48px" h="48px" rounded="md">
                              <Icon as={Globe} color="gray.400" />
                            </Button>
                          }
                        >
                          <Input
                            rounded="md"
                            flex={1}
                            placeholder="https://www.test.com"
                            value={websiteInput}
                            onChange={(e) => setWebsiteInput(e.target.value)}
                          />
                        </InputGroup>
                        <IconButton aria-label="Add website url" rounded="md" onClick={addWebsiteUrl}>
                          <Plus />
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
                              <IconButton aria-label="Remove" size="xs" rounded="sm" onClick={() => removeWebsiteUrl(idx)}>
                                <Trash2 />
                              </IconButton>
                            </HStack>
                          ))}
                        </HStack>
                      )}
                    </FormControl>
                  </Box>

                  {/* Summary */}
                  <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormControl>
                      <FormLabel>Summary</FormLabel>
                      <Textarea rounded="md" rows={3} placeholder="This is a test organization." {...register("summary")} />
                      {errors.summary && (
                        <Text color="red.500" fontSize="xs">{errors.summary.message}</Text>
                      )}
                    </FormControl>
                  </Box>

                  {/* Logo URL */}
                  <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormControl>
                      <FormLabel>Logo URL</FormLabel>
                      <InputGroup
                        rounded="md"
                        startElement={
                          <Button disabled variant="ghost" w="48px" h="48px" rounded="md">
                            <Icon as={ImageIcon} color="gray.400" />
                          </Button>
                        }
                      >
                        <Input rounded="md" placeholder="https://www.test.com/logo.png" {...register("logo_url")} />
                      </InputGroup>
                      {logo_url && (
                        <Box mt={3}>
                          <Text fontSize="sm" color="gray.500" mb={2}>
                            Preview
                          </Text>
                          <Box borderWidth="1px" rounded="lg" p={2} maxW="220px">
                            <Image src={logo_url} alt="Logo preview" width="200px" height="auto" />
                          </Box>
                        </Box>
                      )}
                    </FormControl>
                  </Box>
                </Box>
              </form>
            </Dialog.Body>

            <Separator />

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" p={4} rounded="md">
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button type="submit" form={formId} bg="purple.600" color="white" rounded="md" lineHeight="24px" p={4} _hover={{ bg: "purple.500" }} loading={isSubmitting} disabled={!isValid}>
                Update Organization
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
