import { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/flow/button";
import { colors, typography } from "@/design-system";
import { useCurrentUser } from "@/hooks/use-current-user";

interface CatalogPreviewButtonProps {
  tenantSlug?: string;
  variant?: "button" | "icon";
}

export function CatalogPreviewButton({ tenantSlug, variant = "button" }: CatalogPreviewButtonProps) {
  const { data: user, isLoading } = useCurrentUser();
  const [copied, setCopied] = useState(false);
  
  // Use provided slug or get from current user's tenant
  // Note: tenant slug needs to be available - for now use provided prop
  const slug = tenantSlug ?? (isLoading ? undefined : user?.tenant.name.toLowerCase().replace(/\s+/g, "-"));
  
  if (!slug) {
    return null;
  }

  const catalogUrl = `${window.location.origin}/c/${slug}/catalog`;

  const handleOpen = () => {
    window.open(catalogUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      await navigator.clipboard.writeText(catalogUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        style={{
          color: colors.text.soft,
        }}
        aria-label="Ver catálogo público"
        title="Ver catálogo público"
      >
        <ExternalLink size={20} />
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="md"
        onClick={handleOpen}
        style={{
          fontFamily: typography.family.sans,
          fontWeight: typography.weight.semibold,
        }}
      >
        <ExternalLink size={18} className="mr-2" />
        Ver Catálogo
      </Button>
      
      <Button
        variant="ghost"
        size="md"
        onClick={handleCopy}
        style={{
          fontFamily: typography.family.sans,
          fontWeight: typography.weight.semibold,
          color: copied ? colors.feedback.success.text : colors.text.soft,
        }}
        aria-label={copied ? "Link copiado" : "Copiar link do catálogo"}
      >
        {copied ? (
          <>
            <Check size={18} className="mr-2" />
            Copiado!
          </>
        ) : (
          <>
            <Copy size={18} className="mr-2" />
            Copiar link
          </>
        )}
      </Button>
    </div>
  );
}
