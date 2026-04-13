import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { colors, typography } from "@/design-system";
import { ServiceCard } from "@/components/catalog/service-card";
import { CatalogSkeleton } from "@/components/catalog/catalog-skeleton";
import { CatalogEmptyState } from "@/components/catalog/catalog-empty-state";
import { CatalogErrorState } from "@/components/catalog/catalog-error-state";
import { ProfessionalSelectionModal } from "@/components/public-booking/professional-selection-modal";
import { TenantCoverBanner } from "@/components/branding/tenant-cover-banner";
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
        {/* Cover Banner */}
        {catalog.tenant && (
          <TenantCoverBanner
            tenantName={catalog.tenant.name}
            tenantSlug={catalog.tenant.slug ?? undefined}
            logoUrl={catalog.tenant.logoUrl}
            coverImageUrl={catalog.tenant.coverImageUrl}
            publicAddress={catalog.tenant.publicAddress}
            variant="full"
            className="mb-8"
          />
        )}

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
