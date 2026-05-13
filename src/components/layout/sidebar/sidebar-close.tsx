import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarCloseProps {
  isCollapsed: boolean;
  onClick: () => void;
}

export function SidebarClose({ isCollapsed, onClick }: Readonly<SidebarCloseProps>) {
  return (
    <Button
      onClick={onClick}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="absolute -right-3 bottom-3 border-border bg-surface-primary shadow-sm"
      size="icon-xs"
      variant="outline"
    >
      {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
    </Button>
  );
}

export default SidebarClose;
