"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeaderShell } from "./page-shell";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbEntry[];
  actions?: React.ReactNode;
  backOnSubPathOf?: string;
  leading?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, actions, backOnSubPathOf, leading }: Readonly<PageHeaderProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const base = backOnSubPathOf ? (backOnSubPathOf.startsWith("/") ? backOnSubPathOf : `/${backOnSubPathOf}`) : undefined;
  const showBack = base ? pathname.startsWith(`${base}/`) : false;

  return (
    <header className="w-full border-b border-border bg-surface-primary">
      <AdminPageHeaderShell className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {leading ? <div className="shrink-0">{leading}</div> : null}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-fg-primary md:text-xl">{title}</h1>
            {showBack ? (
              <Button className="mt-2" size="sm" variant="ghost" onClick={() => router.back()}>
                <MoveLeft data-icon="inline-start" /> Back
              </Button>
            ) : (
              <nav className="mt-2 flex flex-wrap items-center gap-1 text-sm text-fg-muted" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                      {crumb.href && !isLast ? (
                        <Link className="hover:text-fg-primary hover:underline" href={crumb.href}>
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className={isLast ? "text-fg-secondary" : undefined}>{crumb.label}</span>
                      )}
                      {!isLast ? <span>/</span> : null}
                    </span>
                  );
                })}
              </nav>
            )}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </AdminPageHeaderShell>
    </header>
  );
}

export default PageHeader;