interface ServiceImageFallbackProps {
  serviceId: string;
  serviceName: string;
  className?: string;
}

function hashName(value: string) {
  return Array.from(value).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) % 360;
  }, 17);
}

function getFallbackGradient(serviceId: string, serviceName: string) {
  const hue = hashName(`${serviceName}-${serviceId}`);
  const accentHue = (hue + 28) % 360;

  return {
    background:
      `linear-gradient(135deg, hsl(${hue} 58% 38%) 0%, hsl(${accentHue} 72% 48%) 52%, color-mix(in srgb, var(--theme-primary) 74%, hsl(${hue} 68% 42%) 26%) 100%)`,
    textShadow: "0 8px 28px rgba(0, 0, 0, 0.28)",
  };
}

export function ServiceImageFallback({
  serviceId,
  serviceName,
  className,
}: ServiceImageFallbackProps) {
  const { background, textShadow } = getFallbackGradient(serviceId, serviceName);
  const initial = serviceName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`flex aspect-square items-center justify-center ${className ?? ""}`}
      style={{
        background,
      }}
      aria-hidden="true"
    >
      <div className="flex items-center justify-center">
        <span
          className="text-[4rem] font-black leading-none text-white"
          style={{
            textShadow,
          }}
        >
          {initial}
        </span>
      </div>
    </div>
  );
}
