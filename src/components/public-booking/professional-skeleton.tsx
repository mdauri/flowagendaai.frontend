export function ProfessionalSkeleton() {
  return (
    <div aria-busy="true" className="space-y-6 rounded-[28px] border border-border-subtle bg-gradient-to-b from-surface-glass to-surface-base p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-20 w-20 animate-pulse rounded-full bg-surface-elevated" />
        <div className="h-6 w-48 animate-pulse rounded bg-surface-elevated" />
        <div className="h-4 w-32 animate-pulse rounded bg-surface-elevated" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-surface-elevated" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-surface-elevated" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-surface-elevated" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-12 w-full animate-pulse rounded-2xl bg-surface-elevated" />
        <div className="h-12 w-full animate-pulse rounded-2xl bg-surface-elevated" />
      </div>
    </div>
  );
}
