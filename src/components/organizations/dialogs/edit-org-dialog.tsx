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
  createListCollection,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Plus, Trash2, Globe, Link2, Image as ImageIcon } from "lucide-react";
import type { OrganizationListItem, UpdateOrganizationRequest, OrganizationDetail } from "@/modules/organizations/types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrganizationSchema, type CreateOrganizationInput } from "@/modules/organizations/schemas";
import { useQuery } from "@tanstack/react-query";
import { getCountries } from "@/modules/organizations/api";
import { useColorModeValue } from "@/components/ui/color-mode";

export interface EditOrgDialogProps {
  trigger: React.ReactNode;
  org: OrganizationListItem;
  onUpdate: (
    organisation_id: string,
    payload: UpdateOrganizationRequest,
  ) => Promise<OrganizationDetail>;
}

export default function EditOrgDialog({ trigger, org, onUpdate }: Readonly<EditOrgDialogProps>) {
  const sectionBorder = useColorModeValue("gray.200", "gray.700");
  const sectionTitle = useColorModeValue("gray.700", "gray.100");
  const helperText = useColorModeValue("gray.500", "gray.400");
  const addButtonBgHover = useColorModeValue("gray.50", "whiteAlpha.100");

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
      organisation_name: org.organisation_name ?? "",
      agent_name: org.agent_name ?? "",
      domain: org.domain ?? [],
      country: org.country ?? "",
      sales_team_size: org.sales_team_size ?? 0,
      company_address: org.company_address ?? "",
      linked_urls: org.linked_urls ?? [],
      website_urls: org.website_urls ?? [],
      summary: org.summary ?? "",
      logo_url: org.logo_url ?? "",
    },
  });

  const { data: countriesData } = useQuery({
    queryKey: ["countries"],
    queryFn: () => getCountries(),
  });

  const countryCollection = createListCollection({
    items: countriesData?.countries || [],
    itemToString: (item) => `${item.name} (${item.code})`,
    itemToValue: (item) => item.code,
  });

  const original = React.useRef({
    organisation_name: org.organisation_name ?? "",
    agent_name: org.agent_name ?? "",
    domain: org.domain ?? [],
    country: org.country ?? "",
    sales_team_size: org.sales_team_size ?? 0,
    company_address: org.company_address ?? "",
    linked_urls: org.linked_urls ?? [],
    website_urls: org.website_urls ?? [],
    summary: org.summary ?? "",
    logo_url: org.logo_url ?? "",
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
    original.current = {
      organisation_name: res.organisation_name ?? data.organisation_name,
      agent_name: res.agent_name ?? data.agent_name ?? "",
      domain: res.domain ?? data.domain ?? [],
      country: res.country ?? data.country,
      sales_team_size: res.sales_team_size ?? data.sales_team_size,
      company_address: res.company_address ?? data.company_address,
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
                        {logo_url && (
                          <Box mt={3}>
                            <Text fontSize="xs" color={helperText} mb={2}>
                              Preview
                            </Text>
                            <Box borderWidth="1px" borderColor={sectionBorder} rounded="lg" p={2} maxW="220px">
                              <Image src={logo_url} alt="Logo" width="200px" height="auto" />
                            </Box>
                          </Box>
                        )}
                        {errors.logo_url && (
                          <Text color="red.500" fontSize="xs">{errors.logo_url.message}</Text>
                        )}
                      </FormControl>
                    </Stack>
                  </Box>
                </Stack>
              </form>
            </Dialog.Body>

            <Separator />

            <Dialog.Footer>
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
                loading={isSubmitting}
                disabled={!isValid}
              >
                Update Organization
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
