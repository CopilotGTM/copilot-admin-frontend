"use client";

import React from "react";
import { Globe, Image as ImageIcon, Link2, Plus, Trash2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CreateOrganizationInput } from "@/modules/organizations/schemas";
import type { Country } from "@/modules/organizations/types";

interface OrganizationFormFieldsProps {
  form: UseFormReturn<CreateOrganizationInput>;
  countries?: Country[];
}

function FieldShell({
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className ? `flex flex-col gap-2 ${className}` : "flex flex-col gap-2"}>
      <span className="text-sm font-medium text-fg-secondary">
        {label}
        {required ? <span className="ml-1 text-signal-risk">*</span> : null}
      </span>
      {children}
      {hint ? <span className="text-xs text-fg-muted">{hint}</span> : null}
      {error ? <span className="text-xs text-signal-risk">{String(error)}</span> : null}
    </label>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface-primary p-4">
      <h3 className="mb-4 text-sm font-semibold text-fg-primary">{title}</h3>
      {children}
    </section>
  );
}

function IconInput({
  icon: Icon,
  ...props
}: React.ComponentProps<typeof Input> & { icon: React.ElementType }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
      <Input className="pl-9" {...props} />
    </div>
  );
}

function RemovableBadges({
  items,
  onRemove,
  variant = "secondary",
}: {
  items: string[];
  onRemove: (index: number) => void;
  variant?: React.ComponentProps<typeof Badge>["variant"];
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex max-w-full items-center gap-1">
          <Badge variant={variant} className="h-auto max-w-full whitespace-normal break-all py-1">
            {item}
          </Badge>
          <Button type="button" variant="ghost" size="icon-xs" onClick={() => onRemove(index)} aria-label="Remove">
            <Trash2 />
          </Button>
        </span>
      ))}
    </div>
  );
}

function AddableTextList({
  label,
  placeholder,
  value,
  onValueChange,
  onAdd,
  items,
  onRemove,
  error,
  hint,
  icon,
  variant,
}: {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  onAdd: () => void;
  items: string[];
  onRemove: (index: number) => void;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ElementType;
  variant?: React.ComponentProps<typeof Badge>["variant"];
}) {
  const InputComponent = icon ? IconInput : Input;

  return (
    <FieldShell label={label} error={error} hint={hint}>
      <div className="flex gap-2">
        <InputComponent
          icon={icon as React.ElementType}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
        />
        <Button type="button" variant="outline" size="icon" onClick={onAdd} aria-label={`Add ${label.toLowerCase()}`}>
          <Plus />
        </Button>
      </div>
      <RemovableBadges items={items} onRemove={onRemove} variant={variant} />
    </FieldShell>
  );
}

export function OrganizationFormFields({ form, countries }: Readonly<OrganizationFormFieldsProps>) {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const linkedUrls = watch("linked_urls") || [];
  const websiteUrls = watch("website_urls") || [];
  const logoUrl = watch("logo_url") || "";
  const domains = watch("domain") || [];

  const [linkedInput, setLinkedInput] = React.useState("");
  const [websiteInput, setWebsiteInput] = React.useState("");
  const [domainInput, setDomainInput] = React.useState("");

  const addDomain = () => {
    const raw = domainInput.trim();
    if (!raw) return;
    const normalized = raw.startsWith("@") ? raw.slice(1) : raw;
    if (!normalized) return;
    if (domains.includes(normalized)) {
      setDomainInput("");
      return;
    }
    setValue("domain", [...domains, normalized], { shouldValidate: true });
    setDomainInput("");
  };

  const addLinkedUrl = () => {
    const value = linkedInput.trim();
    if (!value) return;
    setValue("linked_urls", [...linkedUrls, value], { shouldValidate: true });
    setLinkedInput("");
  };

  const addWebsiteUrl = () => {
    const value = websiteInput.trim();
    if (!value) return;
    setValue("website_urls", [...websiteUrls, value], { shouldValidate: true });
    setWebsiteInput("");
  };

  return (
    <div className="flex flex-col gap-5">
      <FormSection title="Basics">
        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label="Organization Name" required error={errors.organisation_name?.message}>
            <Input placeholder="Acme Corp" aria-invalid={!!errors.organisation_name} {...register("organisation_name")} />
          </FieldShell>

          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <FieldShell label="Country" required error={errors.country?.message}>
                <Select value={field.value || undefined} onValueChange={field.onChange} name={field.name}>
                  <SelectTrigger aria-invalid={!!errors.country}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(countries || []).map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name} ({country.code})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldShell>
            )}
          />

          <FieldShell
            label="Agent name"
            error={errors.agent_name?.message}
            hint="Optional display name used in agent contexts."
          >
            <Input placeholder="Shield" aria-invalid={!!errors.agent_name} {...register("agent_name")} />
          </FieldShell>

          <FieldShell label="Sales team size" error={errors.sales_team_size?.message}>
            <Input
              type="number"
              min={0}
              placeholder="50"
              aria-invalid={!!errors.sales_team_size}
              {...register("sales_team_size", { valueAsNumber: true })}
            />
          </FieldShell>

          <AddableTextList
            label="Domains"
            placeholder="acme.com"
            value={domainInput}
            onValueChange={setDomainInput}
            onAdd={addDomain}
            items={domains}
            onRemove={(index) => setValue("domain", domains.filter((_, itemIndex) => itemIndex !== index), { shouldValidate: true })}
            hint={<>Add email domains like <strong>acme.com</strong>. Press Enter to add.</>}
            error={errors.domain?.message as string | undefined}
            variant="info"
          />

          <FieldShell label="Company address" error={errors.company_address?.message} className="md:col-span-2">
            <Input
              placeholder="123 Market St, San Francisco"
              aria-invalid={!!errors.company_address}
              {...register("company_address")}
            />
          </FieldShell>
        </div>
      </FormSection>

      <FormSection title="Links">
        <div className="flex flex-col gap-4">
          <AddableTextList
            label="Linked URLs"
            placeholder="https://www.linkedin.com/company/acme"
            value={linkedInput}
            onValueChange={setLinkedInput}
            onAdd={addLinkedUrl}
            items={linkedUrls}
            onRemove={(index) => setValue("linked_urls", linkedUrls.filter((_, itemIndex) => itemIndex !== index), { shouldValidate: true })}
            error={errors.linked_urls?.message as string | undefined}
            icon={Link2}
            variant="primary-subtle"
          />

          <AddableTextList
            label="Website URLs"
            placeholder="https://acme.com"
            value={websiteInput}
            onValueChange={setWebsiteInput}
            onAdd={addWebsiteUrl}
            items={websiteUrls}
            onRemove={(index) => setValue("website_urls", websiteUrls.filter((_, itemIndex) => itemIndex !== index), { shouldValidate: true })}
            error={errors.website_urls?.message as string | undefined}
            icon={Globe}
            variant="secondary"
          />
        </div>
      </FormSection>

      <FormSection title="Branding">
        <div className="flex flex-col gap-4">
          <FieldShell label="Summary" error={errors.summary?.message}>
            <Textarea
              rows={3}
              placeholder="Short description of the organization"
              aria-invalid={!!errors.summary}
              {...register("summary")}
            />
          </FieldShell>

          <FieldShell label="Logo URL" error={errors.logo_url?.message}>
            <IconInput icon={ImageIcon} placeholder="https://.../logo.png" aria-invalid={!!errors.logo_url} {...register("logo_url")} />
            {logoUrl ? (
              <div className="pt-1">
                <div className="mb-2 text-xs text-fg-muted">Preview</div>
                <div className="w-fit rounded-lg border border-border bg-surface-primary p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Organization logos are arbitrary external admin data. */}
                  <img src={logoUrl} alt="Logo preview" className="h-auto max-h-28 max-w-52 object-contain" />
                </div>
              </div>
            ) : null}
          </FieldShell>
        </div>
      </FormSection>
    </div>
  );
}