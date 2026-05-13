"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Building2, Settings, Users } from "lucide-react";
import logoFull from "@/../public/logo-full.svg";
import logoIcon from "@/../public/logo-icon.svg";
import { Tooltip } from "@/components/ui/tooltip";
import { SidebarClose } from "./sidebar-close";
import UserMenu from "./user-menu";
import { cn } from "@/lib/utils";

interface LinkItemProps {
  name: string;
  icon: React.ElementType;
  href: string;
}

const ENABLE_NOTIFICATIONS = process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== "false";
const ENABLE_SETTINGS = process.env.NEXT_PUBLIC_ENABLE_SETTINGS !== "false";

const mainLinkItems: Array<LinkItemProps> = [
  { name: "Organizations", icon: Building2, href: "/organizations" },
  { name: "Users", icon: Users, href: "/users" },
];

const secondaryLinkItems: Array<LinkItemProps> = [
  ...(ENABLE_NOTIFICATIONS ? [{ name: "Notifications", icon: Bell, href: "/notifications" }] : []),
  ...(ENABLE_SETTINGS ? [{ name: "Settings", icon: Settings, href: "/settings" }] : []),
];

export interface CollapsibleSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CollapsibleSidebar({ isCollapsed, setIsCollapsed }: Readonly<CollapsibleSidebarProps>) {
  const handleToggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <div className="min-h-dvh bg-surface-secondary">
      <SidebarContent isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
    </div>
  );
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SidebarContent = ({ isCollapsed, onToggleCollapse }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className={cn(
        "fixed flex h-dvh flex-col justify-between border-r border-border bg-surface-primary pb-6 transition-[width] duration-200",
        isCollapsed ? "w-16" : "w-60",
      )}
      aria-label="Admin navigation"
    >
      <div>
        <div className={cn("flex h-20 items-center gap-4", isCollapsed ? "justify-center px-2" : "px-7")}>
          <Link href="/organizations" className="flex items-center gap-3" aria-label="Go to organizations">
            <Image
              src={isCollapsed ? logoIcon : logoFull}
              alt="Copilot-GTM logo"
              className={cn("h-auto shrink-0", isCollapsed ? "w-8" : "w-[155px]")}
              priority
            />
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          {mainLinkItems.map((link) => (
            <Tooltip showArrow key={link.name} content={link.name} positioning={{ placement: "right" }} disabled={!isCollapsed}>
              <NavItem
                icon={link.icon}
                isCollapsed={isCollapsed}
                isActive={pathname === link.href || pathname?.startsWith(`${link.href}/`)}
                onClick={() => router.push(link.href)}
              >
                {link.name}
              </NavItem>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {secondaryLinkItems.map((link) => (
          <Tooltip showArrow key={link.name} content={link.name} positioning={{ placement: "right" }} disabled={!isCollapsed}>
            <NavItem
              icon={link.icon}
              isCollapsed={isCollapsed}
              isActive={pathname === link.href || pathname?.startsWith(`${link.href}/`)}
              onClick={() => router.push(link.href)}
            >
              {link.name}
            </NavItem>
          </Tooltip>
        ))}
        <div className="mx-4 my-2 h-px bg-border" />
        <UserMenu isCollapsed={isCollapsed} />
      </div>

      <SidebarClose isCollapsed={isCollapsed} onClick={onToggleCollapse} />
    </nav>
  );
};

interface NavItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
  isCollapsed: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, children, isCollapsed, isActive, onClick }: NavItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mx-2 flex items-center rounded-md px-3 py-3 text-sm transition-colors focus-visible:shadow-focus focus-visible:outline-none",
        isCollapsed ? "justify-center" : "gap-3",
        isActive
          ? "bg-brand-subtle font-semibold text-brand-primary"
          : "text-fg-secondary hover:bg-surface-secondary hover:text-fg-primary",
      )}
    >
      <Icon className="size-5 shrink-0" />
      {!isCollapsed ? <span className="truncate">{children}</span> : null}
    </button>
  );
};

export default CollapsibleSidebar;
