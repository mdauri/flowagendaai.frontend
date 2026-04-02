import { Image as ImageIcon } from "lucide-react";
import { getFallbackStyles } from "@/utils/generate-fallback-color";

interface ServiceImageFallbackProps {
  serviceId: string;
  serviceName: string;
  className?: string;
}

export function ServiceImageFallback({
  serviceId,
  serviceName,
  className,
}: ServiceImageFallbackProps) {
  const { backgroundColor, textColor, initials } = getFallbackStyles(serviceId, serviceName);

  return (
    <div
      className={`flex aspect-square items-center justify-center ${className ?? ""}`}
      style={{
        backgroundColor,
      }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <ImageIcon
          size={32}
          style={{
            color: textColor,
            opacity: 0.6,
          }}
        />
        <span
          className="text-3xl font-black tracking-tight"
          style={{
            color: textColor,
          }}
        >
          {initials}
        </span>
      </div>
    </div>
  );
}
