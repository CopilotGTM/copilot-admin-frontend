import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingOrganizationDetail() {
  return (
    <div className="w-full px-4 py-6 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <Skeleton className="h-12 w-2/3 rounded-md" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-primary p-5 shadow-xs">
            <Skeleton className="h-8 w-1/2 rounded-md" />
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 rounded-md" />
            ))}
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-primary p-5 shadow-xs">
            <Skeleton className="h-7 w-32 rounded-md" />
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-16 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}