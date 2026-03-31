export function ProfessionalSkeleton() {
  return (
    <div aria-busy="true" className="space-y-6 rounded-[28px] border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-20 w-20 animate-pulse rounded-full bg-white/15" />
        <div className="h-6 w-48 animate-pulse rounded bg-white/15" />
        <div className="h-4 w-32 animate-pulse rounded bg-white/15" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-white/10" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-12 w-full animate-pulse rounded-2xl bg-white/10" />
        <div className="h-12 w-full animate-pulse rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}
