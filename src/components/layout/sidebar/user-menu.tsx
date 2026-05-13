"use client";

import { ChevronDown, Globe, LogOut, Moon, Sun, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useColorMode } from "@/components/ui/color-mode";
import { useAuthStore } from "@/modules/auth/store";

export interface UserMenuProps {
  isCollapsed?: boolean;
}

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "G") + (parts[1]?.[0] ?? "");
}

export function UserMenu({ isCollapsed = false }: Readonly<UserMenuProps>) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { toggleColorMode, colorMode } = useColorMode();

  const displayName = user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email : "Guest";
  const email = user?.email ?? "";

  const handleSignOut = () => {
    clearAuth();
    router.push("/signin");
  };

  const handleVisitWebsite = () => {
    globalThis.window?.open("https://copilotgtm.ai", "_blank", "noopener,noreferrer");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="mx-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-md px-2 py-3 text-left text-sm text-fg-secondary outline-none transition-colors hover:bg-surface-secondary hover:text-fg-primary focus-visible:shadow-focus"
          aria-label="Open user menu"
        >
          <Avatar size="sm">
            <AvatarFallback>{initials(displayName).toUpperCase()}</AvatarFallback>
          </Avatar>
          {!isCollapsed ? (
            <>
              <span className="min-w-0 flex-1 truncate font-medium">{displayName}</span>
              <ChevronDown className="size-4 shrink-0 text-fg-muted" />
            </>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="rounded-md bg-surface-secondary px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials(displayName).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg-primary">{displayName}</p>
              {email ? <p className="truncate text-xs text-fg-muted">{email}</p> : null}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")} className="gap-2 px-3 py-2">
          <User /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleColorMode} className="gap-2 px-3 py-2">
          {colorMode === "dark" ? <Sun /> : <Moon />} Change theme
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleVisitWebsite} className="gap-2 px-3 py-2">
          <Globe /> Visit Website
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} variant="destructive" className="gap-2 px-3 py-2">
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
