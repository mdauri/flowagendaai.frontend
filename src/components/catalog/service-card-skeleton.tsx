import { Card } from "@/components/flow/card";
import { radius } from "@/design-system";

interface ServiceCardSkeletonProps {
  className?: string;
}

export function ServiceCardSkeleton({ className }: ServiceCardSkeletonProps) {
  return (
    <Card
      variant="glass"
      padding="none"
      radiusSize="xl"
      className={`overflow-hidden ${className ?? ""}`}
      style={{
        minHeight: "420px",
      }}
      role="status"
      aria-hidden="true"
    >
      {/* Image Skeleton */}
      <div
        className="skeleton aspect-square w-full"
        style={{
          minHeight: "200px",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          borderRadius: `${radius.xl} ${radius.xl} 0 0`,
        }}
      />

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2">
          <div
            className="skeleton h-6 flex-1"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: radius.sm,
            }}
          />
          <div
            className="skeleton h-6 w-20"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: radius.sm,
            }}
          />
        </div>

        {/* Duration */}
        <div
          className="skeleton h-5 w-24"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            borderRadius: radius.sm,
          }}
        />

        {/* Description */}
        <div className="flex flex-col gap-2 pt-2">
          <div
            className="skeleton h-4 w-full"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: radius.sm,
            }}
          />
          <div
            className="skeleton h-4 w-3/4"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: radius.sm,
            }}
          />
        </div>

        {/* Button */}
        <div
          className="skeleton mt-auto h-12 w-full"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: radius.xl,
          }}
        />
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
    </Card>
  );
}
