import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { colors, typography } from "@/design-system";
import { ServiceCard } from "@/components/catalog/service-card";
import { CatalogSkeleton } from "@/components/catalog/catalog-skeleton";
import { CatalogEmptyState } from "@/components/catalog/catalog-empty-state";
import { CatalogErrorState } from "@/components/catalog/catalog-error-state";
import { ProfessionalSelectionModal } from "@/components/public-booking/professional-selection-modal";
import { usePublicCatalogQuery } from "@/hooks/use-public-catalog-query";
import { useProfessionalsByServiceQuery } from "@/hooks/use-professionals-by-service-query";
import { ApiError } from "@/types/api";

export function CatalogPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const catalogQuery = usePublicCatalogQuery(slug);

  const catalog = catalogQuery.data;
  const error = catalogQuery.error as ApiError | null;

  // Professional selection modal state
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch professionals when a service is selected
  const professionalsQuery = useProfessionalsByServiceQuery(selectedServiceId ?? undefined, {
    enabled: Boolean(selectedServiceId),
  });

  // Auto-navigate when professionals are loaded
  useEffect(() => {
    if (!professionalsQuery.data || !selectedServiceId) return;

    const { professionals } = professionalsQuery.data;

    if (professionals.length === 0) {
      // No professionals available - show error and close modal
      setIsModalOpen(false);
      setSelectedServiceId(null);
      // TODO: Show toast/error message
      return;
    }

    if (professionals.length === 1) {
      // Single professional - navigate directly
      setIsModalOpen(false);
      setSelectedServiceId(null);
      navigate(`/p/${professionals[0].slug}?service=${selectedServiceId}`);
      return;
    }

    // Multiple professionals - keep modal open for selection
    // Modal is already open at this point
  }, [professionalsQuery.data, selectedServiceId, navigate]);

  // SEO: Update document title
  useEffect(() => {
    if (catalog?.tenant?.name) {
      document.title = `${catalog.tenant.name} - Catálogo de Serviços | Agendoro`;

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          `Veja os serviços de ${catalog.tenant.name} e agende online`
        );
      }
    }
  }, [catalog?.tenant?.name]);

  const handleBook = (serviceId: string) => {
    if (!slug) return;
    setSelectedServiceId(serviceId);
    setIsModalOpen(true);
  };

  const handleSelectProfessional = (professionalSlug: string) => {
    if (!selectedServiceId) return;
    setIsModalOpen(false);
    setSelectedServiceId(null);
    navigate(`/p/${professionalSlug}?service=${selectedServiceId}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedServiceId(null);
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
          {catalog?.tenant?.logoUrl ? (
            <img
              src={catalog.tenant.logoUrl}
              alt={catalog.tenant.name}
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
              {catalog?.tenant?.name?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Tenant Info */}
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
              {catalog?.tenant?.name}
            </h1>
            {catalog?.tenant?.slug && (
              <p
                className="text-sm font-medium"
                style={{
                  color: colors.text.muted,
                  fontFamily: typography.family.sans,
                }}
              >
                @{catalog.tenant.slug}
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
                tenantSlug={slug ?? ""}
                onBook={handleBook}
              />
            ))}
          </section>
        </main>
      </div>

      {/* Professional Selection Modal */}
      <ProfessionalSelectionModal
        isOpen={isModalOpen}
        serviceName={
          selectedServiceId
            ? catalog?.services.find((s) => s.id === selectedServiceId)?.name ?? ""
            : ""
        }
        professionals={professionalsQuery.data?.professionals ?? []}
        tenantSlug={slug ?? ""}
        serviceId={selectedServiceId ?? ""}
        onSelectProfessional={handleSelectProfessional}
        onClose={handleCloseModal}
      />
    </div>
  );
}
