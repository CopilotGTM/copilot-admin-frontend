"use client";

import { CollapsibleSidebar } from "@/components/layout/sidebar";
import { useState } from "react";

export default function GTMRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] = useState<boolean>(true);
  const mainSidebarWidth = isMainSidebarCollapsed ? 64 : 240;

  return (
    <div className="relative flex h-dvh w-screen overflow-hidden bg-background text-foreground">
      <aside className="fixed z-20 h-dvh">
        <CollapsibleSidebar
          isCollapsed={isMainSidebarCollapsed}
          setIsCollapsed={setIsMainSidebarCollapsed}
        />
      </aside>
      <main
        className="h-dvh flex-1 overflow-y-auto overflow-x-hidden transition-[margin-left] duration-200"
        style={{ marginLeft: mainSidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
}
