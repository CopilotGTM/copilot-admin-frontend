import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingOrganizations() {
  return (
    <div className="w-full px-4 py-6 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="rounded-lg border border-border bg-surface-primary p-4 shadow-xs">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-[2fr_2fr_2fr_1fr_1fr] gap-3">
                <Skeleton className="h-6 rounded-md" />
                <Skeleton className="h-6 rounded-md" />
                <Skeleton className="h-6 rounded-md" />
                <Skeleton className="h-6 rounded-md" />
                <Skeleton className="h-6 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}