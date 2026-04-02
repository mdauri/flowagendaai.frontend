import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { colors, typography } from "@/design-system";
import { ServiceCard } from "@/components/catalog/service-card";
import { CatalogSkeleton } from "@/components/catalog/catalog-skeleton";
import { CatalogEmptyState } from "@/components/catalog/catalog-empty-state";
import { CatalogErrorState } from "@/components/catalog/catalog-error-state";
import { usePublicCatalogQuery } from "@/hooks/use-public-catalog-query";
import { ApiError } from "@/types/api";

export function CatalogPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const catalogQuery = usePublicCatalogQuery(slug);

  const catalog = catalogQuery.data;
  const error = catalogQuery.error as ApiError | null;

  // SEO: Update document title
  useEffect(() => {
    if (catalog?.professional?.name) {
      document.title = `${catalog.professional.name} - Catálogo de Serviços | Agendoro`;

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          `Veja os serviços de ${catalog.professional.name} e agende online`
        );
      }
    }
  }, [catalog?.professional?.name]);

  const handleBook = (serviceId: string) => {
    if (!slug) return;
    navigate(`/p/${slug}?service=${serviceId}`);
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleRetry = () => {
    catalogQuery.refetch();
  };

  // Loading state
  if (catalogQuery.isLoading) {
    return (
      <div
        className="min-h-screen bg-[var(--bg-base)] px-4 py-8"
        style={{
          backgroundColor: colors.background.base,
        } as React.CSSProperties}
      >
        <div className="mx-auto max-w-[1200px]">
          <CatalogSkeleton count={6} />
        </div>
      </div>
    );
  }

  // Error state (404 or other errors)
  if (error) {
    return (
      <div
        className="min-h-screen bg-[var(--bg-base)]"
        style={{
          backgroundColor: colors.background.base,
        } as React.CSSProperties}
      >
        <div className="mx-auto max-w-[1200px]">
          <CatalogErrorState error={error} onRetry={handleRetry} onBack={handleBack} />
        </div>
      </div>
    );
  }

  // Empty state (no services)
  if (!catalog || catalog.services.length === 0) {
    return (
      <div
        className="min-h-screen bg-[var(--bg-base)]"
        style={{
          backgroundColor: colors.background.base,
        } as React.CSSProperties}
      >
        <div className="mx-auto max-w-[1200px]">
          <CatalogEmptyState onBack={handleBack} />
        </div>
      </div>
    );
  }

  // Success state - render catalog
  return (
    <div
      className="min-h-screen bg-[var(--bg-base)] px-4 py-8"
      style={{
        backgroundColor: colors.background.base,
      } as React.CSSProperties}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <header
          className="mb-8 flex items-center gap-4 rounded-[2.25rem] border border-[var(--border-default)] bg-[var(--surface-premium-gradient)] p-6 backdrop-blur-[24px]"
          style={{
            borderColor: "rgba(255, 255, 255, 0.15)",
          }}
        >
          {/* Logo */}
          {catalog?.professional?.logoUrl ? (
            <img
              src={catalog.professional.logoUrl}
              alt={catalog.professional.name}
              className="h-16 w-16 flex-shrink-0 rounded-full border border-white/10 object-cover"
              loading="eager"
            />
          ) : (
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-white/10 text-2xl font-black text-white"
              style={{
                backgroundColor: colors.brand.primary,
              }}
              aria-hidden="true"
            >
              {catalog?.professional?.name?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Professional Info */}
          <div className="flex flex-1 flex-col gap-1">
            <h1
              className="text-2xl font-black"
              style={{
                color: colors.text.primary,
                fontFamily: typography.family.sans,
                fontWeight: typography.weight.black,
                lineHeight: typography.leading.tight,
                letterSpacing: typography.tracking.tight,
              }}
            >
              {catalog?.professional?.name}
            </h1>
            {catalog?.professional?.tenantName && (
              <p
                className="text-sm font-medium"
                style={{
                  color: colors.text.muted,
                  fontFamily: typography.family.sans,
                }}
              >
                {catalog.professional.tenantName}
              </p>
            )}
          </div>
        </header>

        {/* Services Grid */}
        <main>
          <section
            aria-label="Serviços disponíveis"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
          >
            {catalog.services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                professionalSlug={slug ?? ""}
                onBook={handleBook}
              />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
