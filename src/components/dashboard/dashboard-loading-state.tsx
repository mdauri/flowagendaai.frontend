import { Card } from "@/components/flow/card";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[28px] bg-white/10 ${className}`} />;
}

export function DashboardLoadingState() {
  return (
    <div className="grid gap-6" aria-live="polite" aria-label="Carregando dashboard operacional">
      <div className="grid gap-3">
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="h-12 w-full max-w-3xl" />
        <SkeletonBlock className="h-6 w-full max-w-2xl" />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card variant="premium" padding="lg" className="xl:col-span-4">
          <div className="grid gap-5">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-16 w-36" />
            <SkeletonBlock className="h-3 w-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-8 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} variant="glass" padding="md">
              <div className="grid gap-4">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-10 w-24" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card variant="glass" padding="lg" className="xl:col-span-8">
          <div className="grid gap-4">
            <SkeletonBlock className="h-6 w-40" />
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-24 w-full" />
            ))}
          </div>
        </Card>

        <div className="grid gap-6 xl:col-span-4">
          <Card variant="glass" padding="lg">
            <div className="grid gap-4">
              <SkeletonBlock className="h-6 w-40" />
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-20 w-full" />
              ))}
            </div>
          </Card>

          <Card variant="glass" padding="lg">
            <div className="grid gap-4">
              <SkeletonBlock className="h-6 w-48" />
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-24 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
