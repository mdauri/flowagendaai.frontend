import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { colors, typography } from "@/design-system";
import { ServiceCard } from "@/components/catalog/service-card";
import { CatalogSkeleton } from "@/components/catalog/catalog-skeleton";
import { CatalogEmptyState } from "@/components/catalog/catalog-empty-state";
import { CatalogErrorState } from "@/components/catalog/catalog-error-state";
import { ProfessionalSelectionModal } from "@/components/public-booking/professional-selection-modal";
import { TenantCoverBanner } from "@/components/branding/tenant-cover-banner";
import { DemoEnvironmentBanner } from "@/components/shared/demo-environment-banner";
import { ThemeSwitcher } from "@/components/app/theme-switcher";
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
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch professionals when a service is selected
  const professionalsQuery = useProfessionalsByServiceQuery(
    selectedServiceId ?? undefined,
    {
      enabled: Boolean(selectedServiceId),
    },
  );

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
      const metaDescription = document.querySelector(
        'meta[name="description"]',
      );
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          `Veja os serviços de ${catalog.tenant.name} e agende online`,
        );
      }
    }
  }, [catalog?.tenant?.name]);

  const serviceCount = catalog?.services.length ?? 0;
  const showCarouselControls = serviceCount > 1;
  const serviceIndicators = useMemo(
    () => Array.from({ length: serviceCount }, (_, index) => index),
    [serviceCount],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < maxScrollLeft - 4);

      const cards = Array.from(
        container.querySelectorAll<HTMLElement>("[data-service-slide]"),
      );
      if (cards.length === 0) {
        setActiveIndex(0);
        return;
      }

      const viewportCenter = scrollLeft + clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    updateScrollState();
    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [serviceCount]);

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

  const scrollServices = (direction: "prev" | "next") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distance = Math.max(container.clientWidth * 0.82, 280);
    container.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth",
    });
  };

  const publicTopbar = (
    <div className="mb-5 flex items-center justify-between border-b border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] px-4 py-3 shadow-[0_10px_24px_rgba(52,42,31,0.08)] backdrop-blur-[var(--theme-blur-panel)] sm:rounded-full sm:border">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
          AGENDORO
        </p>
        <p className="truncate text-sm font-semibold text-[var(--theme-text-primary)]">
          Catalogo publico
        </p>
      </div>
      <ThemeSwitcher compact />
    </div>
  );
  const demoBanner = catalog?.tenant?.slug ? (
    <DemoEnvironmentBanner tenantSlug={catalog.tenant.slug} className="mb-5" />
  ) : null;

  // Loading state
  if (catalogQuery.isLoading) {
    return (
      <div
        className="min-h-screen bg-(--bg-base) px-4 py-8"
        style={
          {
            backgroundColor: colors.background.base,
          } as React.CSSProperties
        }
      >
        <div className="mx-auto max-w-300">
          {publicTopbar}
          {demoBanner}
          <CatalogSkeleton count={6} />
        </div>
      </div>
    );
  }

  // Error state (404 or other errors)
  if (error) {
    return (
      <div
        className="min-h-screen bg-(--bg-base)"
        style={
          {
            backgroundColor: colors.background.base,
          } as React.CSSProperties
        }
      >
        <div className="mx-auto max-w-300">
          {publicTopbar}
          {demoBanner}
          <CatalogErrorState
            error={error}
            onRetry={handleRetry}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  // Empty state (no services)
  if (!catalog || catalog.services.length === 0) {
    return (
      <div
        className="min-h-screen bg-(--bg-base)"
        style={
          {
            backgroundColor: colors.background.base,
          } as React.CSSProperties
        }
      >
        <div className="mx-auto max-w-300">
          {publicTopbar}
          {demoBanner}
          <CatalogEmptyState onBack={handleBack} />
        </div>
      </div>
    );
  }

  // Success state - render catalog
  return (
    <div
      className="min-h-screen bg-(--bg-base) px-4 py-8"
      style={
        {
          backgroundColor: colors.background.base,
        } as React.CSSProperties
      }
    >
      <div className="mx-auto max-w-300">
        {publicTopbar}
        {demoBanner}
        {/* Cover Banner */}
        {catalog.tenant && (
          <TenantCoverBanner
            tenantName={catalog.tenant.name}
            tenantSlug={catalog.tenant.slug ?? undefined}
            logoUrl={catalog.tenant.logoUrl}
            coverImageUrl={catalog.tenant.coverImageUrl}
            publicAddress={catalog.tenant.publicAddress}
            subtitle="Escolha um serviço para agendar"
            variant="full"
            className="mb-5"
          />
        )}

        {/* Services Carousel */}
        <main>
          <section aria-label="Serviços disponíveis" className="mx-auto max-w-[1120px]">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--theme-text-primary)]">
                  Escolha seu serviço
                </p>
                <p className="text-sm text-text-soft">
                  Deslize para ver todas as opções disponíveis.
                </p>
              </div>
              {showCarouselControls ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollServices("prev")}
                    disabled={!canScrollLeft}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-[var(--theme-text-primary)] transition disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Ver serviços anteriores"
                  >
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollServices("next")}
                    disabled={!canScrollRight}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] text-[var(--theme-text-primary)] transition disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Ver próximos serviços"
                  >
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </div>

            <div
              ref={scrollContainerRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pr-[12vw] sm:pr-0"
            >
              {catalog.services.map((service) => (
                <div
                  key={service.id}
                  data-service-slide
                  className="min-w-0 shrink-0 basis-[86%] snap-start sm:basis-[48%] lg:basis-[31.5%]"
                >
                  <ServiceCard
                    service={service}
                    tenantSlug={slug ?? ""}
                    onBook={handleBook}
                  />
                </div>
              ))}
            </div>

            {showCarouselControls ? (
              <div className="mt-3 flex items-center justify-center gap-2" aria-label="Posição no catálogo">
                {serviceIndicators.map((index) => (
                  <span
                    key={index}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: index === activeIndex ? 18 : 8,
                      backgroundColor:
                        index === activeIndex
                          ? colors.brand.primary
                          : "rgba(120, 120, 120, 0.35)",
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : null}
          </section>
        </main>
      </div>

      {/* Professional Selection Modal */}
      <ProfessionalSelectionModal
        isOpen={isModalOpen}
        serviceName={
          selectedServiceId
            ? (catalog?.services.find((s) => s.id === selectedServiceId)
                ?.name ?? "")
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
