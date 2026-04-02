import { ServiceCardSkeleton } from "./service-card-skeleton";

interface CatalogSkeletonProps {
  count?: number;
}

export function CatalogSkeleton({ count = 6 }: CatalogSkeletonProps) {
  return (
    <div className="w-full">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center gap-4">
        <div
          className="skeleton h-16 w-16 flex-shrink-0 rounded-full"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          }}
        />
        <div className="flex flex-1 flex-col gap-2">
          <div
            className="skeleton h-7 w-48"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            }}
          />
          <div
            className="skeleton h-4 w-32"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
            }}
          />
        </div>
      </div>

      {/* Services Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <ServiceCardSkeleton key={index} />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.03) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.03) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
