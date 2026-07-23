import { useEffect, useMemo, useRef, useState } from "react";
import { colors, typography } from "@/design-system";
import { DateTime } from "luxon";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { Button } from "@/components/flow/button";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { DemoEnvironmentBanner } from "@/components/shared/demo-environment-banner";
import { ThemeSwitcher } from "@/components/app/theme-switcher";
import { PublicBookingHeader } from "@/components/public-booking/public-booking-header";
import { SlotGrid } from "@/components/public-booking/slots";
import { CustomerDataForm, SummaryCard } from "@/components/public-booking/customer-data-form";
import { ServiceSelector } from "@/components/public-booking/service-selector";
import { MonthNavigator, CalendarGrid } from "@/components/public-booking/date-picker";
import { BookingSuccess } from "@/components/public-booking/booking-success";
import { ProcessingOverlay } from "@/components/public-booking/processing-overlay";
import { ProfessionalSkeleton } from "@/components/public-booking/professional-skeleton";
import { ConnectionErrorState, ProfessionalNotFoundState } from "@/components/public-booking/professional-error";
import { MultiDayConflictError } from "@/components/public-booking/multi-day-conflict-error";
import { usePublicProfessionalQuery } from "@/hooks/use-public-professional-query";
import { usePublicServicesQuery } from "@/hooks/use-public-services-query";
import { usePublicAvailableDatesQuery } from "@/hooks/use-public-available-dates-query";
import { usePublicSlotsQuery } from "@/hooks/use-public-slots-query";
import { useCreatePublicBookingMutation } from "@/hooks/use-create-public-booking-mutation";
import { customerAppService } from "@/services/customer-app-service";
import { setCustomerAppSession } from "@/session/customer-app-session-storage";
import { ApiError, BOOKING_CONFLICT_ERROR_CODE, MULTI_DAY_CONFLICT_ERROR_CODE } from "@/types/api";
import type {
  CreatePublicBookingResponse,
  PublicProfessional,
  PublicBookingStep,
  PublicServiceItem,
  PublicSlot,
  DaySegment,
} from "@/types/public-booking";
import type { WaitlistPrefillParams } from "@/types/waitlist";

function buildWaitlistPrefillPath(params: WaitlistPrefillParams) {
  const searchParams = new URLSearchParams();

  if (params.customerName?.trim()) {
    searchParams.set("customerName", params.customerName.trim());
  }

  if (params.customerPhone?.trim()) {
    searchParams.set("customerPhone", params.customerPhone.trim());
  }

  if (params.serviceId?.trim()) {
    searchParams.set("serviceId", params.serviceId.trim());
  }

  if (params.employeeId?.trim()) {
    searchParams.set("employeeId", params.employeeId.trim());
  }

  if (params.preferredDate?.trim()) {
    searchParams.set("preferredDate", params.preferredDate.trim());
  }

  if (params.preferredPeriod?.trim()) {
    searchParams.set("preferredPeriod", params.preferredPeriod.trim());
  }

  if (params.notes?.trim()) {
    searchParams.set("notes", params.notes.trim());
  }

  const search = searchParams.toString();
  return search ? `/app/waitlist?${search}` : "/app/waitlist";
}

function PublicTenantTopbar({ professional }: { professional: PublicProfessional }) {
  const [showLogoFallback, setShowLogoFallback] = useState(!professional.tenantLogoUrl);

  useEffect(() => {
    setShowLogoFallback(!professional.tenantLogoUrl);
  }, [professional.tenantLogoUrl]);

  const tenantInitial = professional.tenantName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-center justify-between gap-4 rounded-full border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] px-4 py-3 shadow-[var(--theme-shadow-card)] backdrop-blur-[var(--theme-blur-panel)]">
      <div className="flex min-w-0 items-center gap-3">
        {!showLogoFallback && professional.tenantLogoUrl ? (
          <img
            src={professional.tenantLogoUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover shadow-inner ring-1 ring-[var(--theme-border-subtle)]"
            loading="lazy"
            onError={() => setShowLogoFallback(true)}
          />
        ) : (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-black shadow-inner ring-1 ring-[var(--theme-border-subtle)]"
            style={{
              backgroundColor: colors.background.glass,
              color: colors.text.primary,
            }}
            aria-hidden="true"
          >
            {tenantInitial}
          </div>
        )}
        <p className="truncate text-sm font-semibold text-[var(--theme-text-primary)] sm:text-base">
          {professional.tenantName}
        </p>
      </div>
      <ThemeSwitcher compact />
    </div>
  );
}

const BRAZILIAN_PHONE_REGEX = /^\+55\s\(\d{2}\)\s\d{5}-\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const stepTitles: Record<PublicBookingStep, string> = {
  service: "Escolha o serviço",
  date: "Escolha a data",
  slot: "Selecione um horário",
  customer: "Seus dados",
  confirm: "Confirmando",
  success: "Agendamento confirmado",
};

type BookingNotification =
  | {
      type: "conflict";
      title: string;
      description: string;
    }
  | {
      type: "rateLimit";
      title: string;
      description: string;
    }
  | {
      type: "generic";
      title: string;
      description: string;
    };

export function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get("service");
  const preselectedDate = searchParams.get("date");

  const [currentStep, setCurrentStep] = useState<PublicBookingStep>("service");
  const [selectedService, setSelectedService] = useState<PublicServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<PublicSlot | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+55 ");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [bookingResult, setBookingResult] = useState<CreatePublicBookingResponse | null>(null);
  const [bookingNotification, setBookingNotification] = useState<BookingNotification | null>(null);
  const [hasTriedCustomerSubmit, setHasTriedCustomerSubmit] = useState(false);
  const customerNameInputRef = useRef<HTMLInputElement>(null);
  const [multiDayConflictError, setMultiDayConflictError] = useState<{
    conflictDay: string;
    conflictStart: string;
    conflictEnd: string;
  } | null>(null);

  const professionalQuery = usePublicProfessionalQuery(slug ?? "", { enabled: Boolean(slug) });
  const servicesQuery = usePublicServicesQuery(slug);
  const formattedDate = selectedDate?.toISODate() ?? null;
  const slotsQuery = usePublicSlotsQuery(
    slug && selectedService?.id && formattedDate
      ? { slug, serviceId: selectedService.id, date: formattedDate }
      : undefined
  );
  const createBookingMutation = useCreatePublicBookingMutation();

  const professional = professionalQuery.data;
  const demoBanner = professional?.tenantSlug ? (
    <DemoEnvironmentBanner tenantSlug={professional.tenantSlug} className="mb-5" />
  ) : null;
  const tenantTimezone = professional?.tenantTimezone ?? "UTC";
  const minDate = useMemo(() => DateTime.now().setZone(tenantTimezone).startOf("day"), [tenantTimezone]);
  const maxDate = useMemo(() => minDate.plus({ days: 30 }), [minDate]);
  const [calendarMonth, setCalendarMonth] = useState(() => minDate.startOf("month"));
  const monthRange = useMemo(() => {
    const monthStart = calendarMonth.startOf("month");
    const monthEnd = calendarMonth.endOf("month");
    const from = monthStart < minDate ? minDate : monthStart;
    const to = monthEnd > maxDate ? maxDate : monthEnd;

    if (from > to) {
      return null;
    }

    return {
      from: from.toISODate()!,
      to: to.toISODate()!,
    };
  }, [calendarMonth, minDate, maxDate]);
  const availableDatesQuery = usePublicAvailableDatesQuery(
    slug && selectedService?.id && monthRange
      ? { slug, serviceId: selectedService.id, from: monthRange.from, to: monthRange.to }
      : undefined
  );
  const availableDates = useMemo(
    () => new Set(availableDatesQuery.data?.availableDates ?? []),
    [availableDatesQuery.data?.availableDates]
  );

  useEffect(() => {
    if (!servicesQuery.data?.length) return;
    if (!preselectedServiceId || selectedService) return;

    const matchedService = servicesQuery.data.find((service) => service.id === preselectedServiceId);
    if (!matchedService) return;

    setSelectedService(matchedService);
    if (currentStep === "service") {
      setCurrentStep("date");
    }
  }, [preselectedServiceId, servicesQuery.data, selectedService, currentStep]);

  useEffect(() => {
    if (!selectedService) return;
    if (!preselectedDate) return;
    const parsed = DateTime.fromISO(preselectedDate, { zone: tenantTimezone }).startOf("day");
    if (!parsed.isValid) return;
    if (parsed < minDate || parsed > maxDate) return;
    setSelectedDate(parsed);
    setCalendarMonth(parsed.startOf("month"));
  }, [preselectedDate, selectedService, tenantTimezone, minDate, maxDate]);

  useEffect(() => {
    if (!selectedService?.id) {
      setSelectedDate(null);
      setSelectedSlot(null);
      setCalendarMonth(minDate.startOf("month"));
      return;
    }
  }, [selectedService?.id, minDate]);

  useEffect(() => {
    if (selectedDate) return;
    setCalendarMonth(minDate.startOf("month"));
  }, [minDate, selectedDate]);

  useEffect(() => {
    if (!selectedDate || !availableDatesQuery.data) return;
    if (!selectedDate.hasSame(calendarMonth, "month")) return;
    const selectedDateKey = selectedDate.toISODate();

    if (!selectedDateKey) return;
    if (availableDates.has(selectedDateKey)) return;

    setSelectedDate(null);
    setSelectedSlot(null);
  }, [selectedDate, calendarMonth, availableDatesQuery.data, availableDates]);

  const timezone = slotsQuery.data?.tenantTimezone ?? tenantTimezone;
  const stepOrder: PublicBookingStep[] = ["service", "date", "slot", "customer", "confirm"];
  const canGoBack = stepOrder.includes(currentStep) && currentStep !== "service";

  const selectedSlotStart = selectedSlot?.start ?? null;
  const slotError = slotsQuery.error as ApiError | null;
  const isSlotRateLimit = slotError?.status === 429;
  const availableDatesError = availableDatesQuery.error as ApiError | null;

  const isNameValid = customerName.trim().length >= 3;
  const isPhoneValid = BRAZILIAN_PHONE_REGEX.test(customerPhone);
  const isEmailValid =
    customerEmail.trim().length === 0 || EMAIL_REGEX.test(customerEmail.trim().toLowerCase());
  const requiredCustomerFieldsFilled = customerName.trim().length > 0 && customerPhone.trim() !== "+55";
  const formIsValid = isNameValid && isPhoneValid && isEmailValid;

  const inSlotStep = currentStep === "slot";
  const showSlotsSection = inSlotStep;

  const stepSubtitle = useMemo(() => {
    if (currentStep === "success" && bookingResult?.status === "AWAITING_DEPOSIT") {
      return "Aguardando sinal";
    }

    return stepTitles[currentStep];
  }, [bookingResult?.status, currentStep]);
  const stepIndex = stepOrder.indexOf(currentStep);
  const displayedStep = stepIndex >= 0 ? stepIndex + 1 : stepOrder.length;

  useEffect(() => {
    if (currentStep !== "customer") return;

    window.setTimeout(() => {
      customerNameInputRef.current?.focus();
    }, 0);
  }, [currentStep]);

  const handleServiceSelect = (service: PublicServiceItem) => {
    if (selectedService?.id !== service.id) {
      setSelectedService(service);
      setSelectedDate(null);
      setSelectedSlot(null);
      setCalendarMonth(minDate.startOf("month"));
      setBookingNotification(null);
      setHasTriedCustomerSubmit(false);
    }
    if (currentStep === "service") {
      setCurrentStep("date");
    }
  };

  const handleDateSelect = (date: DateTime) => {
    setSelectedDate(date.setZone(tenantTimezone).startOf("day"));
    setSelectedSlot(null);
    setBookingNotification(null);
    setHasTriedCustomerSubmit(false);
  };

  const handleSlotSelect = (slot: PublicSlot) => {
    setSelectedSlot(slot);
    setBookingNotification(null);
    setHasTriedCustomerSubmit(false);
  };

  const resetFlow = () => {
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setCustomerName("");
    setCustomerPhone("+55 ");
    setCustomerEmail("");
    setCustomerNotes("");
    setBookingResult(null);
    setBookingNotification(null);
    setHasTriedCustomerSubmit(false);
    setCalendarMonth(minDate.startOf("month"));
    setCurrentStep("service");
  };

  const handleBack = () => {
    setBookingNotification(null);
    if (currentStep === "date") {
      setCurrentStep("service");
      return;
    }
    if (currentStep === "slot") {
      setCurrentStep("date");
      return;
    }
    if (currentStep === "customer") {
      setCurrentStep("slot");
    }
  };

  const handlePrimaryAction = () => {
    if (currentStep === "service" && selectedService) {
      setCurrentStep("date");
      return;
    }
    if (currentStep === "date" && selectedDate) {
      setCurrentStep("slot");
      return;
    }
    if (currentStep === "slot" && selectedSlot) {
      setCurrentStep("customer");
      return;
    }
    if (currentStep === "customer") {
      setHasTriedCustomerSubmit(true);
    }
    if (currentStep === "customer" && formIsValid && selectedSlot && selectedService) {
      setCurrentStep("confirm");
      setBookingNotification(null);
      createBookingMutation.mutate(
        {
          slug: slug ?? "",
          serviceId: selectedService.id,
          start: selectedSlot.start,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
        },
        {
          onSuccess: async (booking) => {
            if (professional?.tenantSlug && booking.customerAppBootstrapToken) {
              try {
                const session = await customerAppService.bootstrapSession(professional.tenantSlug, {
                  bookingBootstrapToken: booking.customerAppBootstrapToken,
                });

                setCustomerAppSession(professional.tenantSlug, {
                  token: session.sessionToken,
                  expiresAt: session.expiresAt,
                  customerName: session.customer.name,
                });
              } catch {
                // Preserve the booking flow even if the customer app bootstrap fails.
              }
            }

            setBookingResult(booking);
            setBookingNotification(null);
            setCurrentStep("success");
          },
          onError: (error) => {
            if (error instanceof ApiError && error.status === 429) {
              setBookingNotification({
                type: "rateLimit",
                title: "Muitas solicitações",
                description: `Tente novamente em ${error.retryAfterSeconds ?? 30} segundos.`,
              });
              setCurrentStep("slot");
              setSelectedSlot(null);
              slotsQuery.refetch();
              return;
            }

            if (
              error instanceof ApiError &&
              error.status === 409 &&
              error.code === MULTI_DAY_CONFLICT_ERROR_CODE
            ) {
              const details = (error as ApiError & { details?: { conflictDay?: string; conflictStart?: string; conflictEnd?: string } }).details;
              const conflictDay = details?.conflictDay ?? (error as ApiError & { conflictDay?: string }).conflictDay;
              const conflictStart = details?.conflictStart ?? (error as ApiError & { conflictStart?: string }).conflictStart;
              const conflictEnd = details?.conflictEnd ?? (error as ApiError & { conflictEnd?: string }).conflictEnd;

              if (conflictDay && conflictStart && conflictEnd) {
                setMultiDayConflictError({ conflictDay, conflictStart, conflictEnd });
              } else {
                setBookingNotification({
                  type: "conflict",
                  title: "Horario em disputa",
                  description: "Este horario acabou de ser reservado. Atualize a lista e escolha outro.",
                });
              }
              setCurrentStep("slot");
              setSelectedSlot(null);
              slotsQuery.refetch();
              return;
            }

            if (
              error instanceof ApiError &&
              error.status === 409 &&
              error.code === BOOKING_CONFLICT_ERROR_CODE
            ) {
              setBookingNotification({
                type: "conflict",
                title: "Horário em disputa",
                description: "Este horário acabou de ser reservado. Atualize a lista e escolha outro.",
              });
              setCurrentStep("slot");
              setSelectedSlot(null);
              slotsQuery.refetch();
              return;
            }

            setBookingNotification({
              type: "generic",
              title: "Não foi possível confirmar",
              description: "Tente novamente em alguns instantes.",
            });
            setCurrentStep("slot");
            slotsQuery.refetch();
          },
        }
      );
    }
  };

  const bookingButtons =
    currentStep !== "service" && currentStep !== "success" && currentStep !== "confirm";
  const primaryButtonLabel =
    currentStep === "date"
      ? "Ver horários"
      : currentStep === "slot"
      ? "Continuar"
      : currentStep === "customer"
      ? "Continuar"
      : "";

  const primaryDisabled =
    currentStep === "date"
      ? !selectedDate
      : currentStep === "slot"
      ? !selectedSlot
      : currentStep === "customer"
      ? !requiredCustomerFieldsFilled
      : true;

  const slotBanner = slotError ? (
    <div className="space-y-3">
      <FeedbackBanner
        tone={isSlotRateLimit ? "warning" : "danger"}
        title={isSlotRateLimit ? "Limite temporário" : "Não foi possível carregar os horários"}
        description={
          isSlotRateLimit
            ? `Tente novamente em ${slotError.retryAfterSeconds ?? 30} segundos.`
            : "Verifique sua conexão e tente outra vez."
        }
      />
      <Button variant="secondary" size="md" onClick={() => slotsQuery.refetch()}>
        Recarregar
      </Button>
    </div>
  ) : null;

  if (professionalQuery.isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="mx-auto mb-4 flex max-w-2xl justify-end">
          <ThemeSwitcher compact />
        </div>
        <ProfessionalSkeleton />
      </div>
    );
  }

  if (professionalQuery.isError) {
    const error = professionalQuery.error as ApiError;
    if (error?.status === 404) {
      return (
        <div className="px-4 py-6">
          <div className="mx-auto mb-4 flex max-w-2xl justify-end">
            <ThemeSwitcher compact />
          </div>
          <ProfessionalNotFoundState />
        </div>
      );
    }
    return (
      <div className="px-4 py-6">
        <div className="mx-auto mb-4 flex max-w-2xl justify-end">
          <ThemeSwitcher compact />
        </div>
        <ConnectionErrorState onRetry={() => professionalQuery.refetch()} />
      </div>
    );
  }

  if (!professional) {
    return null;
  }

  const shouldShowBookingNotification =
    bookingNotification && currentStep !== "confirm" && currentStep !== "success";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const waitlistPrefillPath =
    bookingNotification?.type === "conflict" && selectedService
      ? buildWaitlistPrefillPath({
          customerName,
          customerPhone,
          serviceId: selectedService.id,
          employeeId: professional.id,
          preferredDate: selectedDate?.toISODate() ?? undefined,
        })
      : null;

  return (
    <div
      className="min-h-screen pb-32 text-text-primary transition-colors duration-500"
      style={{
        backgroundColor: colors.background.base,
        fontFamily: typography.family.sans,
      }}
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 transition-all duration-300 sm:px-6 lg:px-8">
        <PublicTenantTopbar professional={professional} />
        {demoBanner}
        <PublicBookingHeader professional={professional} />
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            {canGoBack ? (
              <button
                type="button"
                onClick={handleBack}
                className="text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{ color: colors.text.soft }}
              >
                Voltar
              </button>
            ) : (
              <div />
            )}
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">
              Etapa {displayedStep} de {stepOrder.length}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-black">{stepSubtitle}</h2>
            {(currentStep === "date" || currentStep === "customer") && selectedService ? (
              <p className="mt-1 text-sm text-text-soft">
                Serviço selecionado: {selectedService.name}
              </p>
            ) : null}
          </div>
          {currentStep === "service" && (
            <ServiceSelector
              services={servicesQuery.data ?? []}
              selectedServiceId={selectedService?.id ?? null}
              onSelect={handleServiceSelect}
              isLoading={servicesQuery.isLoading}
              error={servicesQuery.error}
              onRetry={() => servicesQuery.refetch()}
            />
          )}
          {currentStep === "date" && selectedService && (
            <div className="space-y-5">
              <MonthNavigator
                month={calendarMonth}
                minDate={minDate}
                maxDate={maxDate}
                onPrevMonth={() =>
                  setCalendarMonth((month) => {
                    const prev = month.minus({ months: 1 });
                    return prev.startOf("month") < minDate.startOf("month") ? month : prev;
                  })
                }
                onNextMonth={() =>
                  setCalendarMonth((month) => {
                    const next = month.plus({ months: 1 });
                    return next.startOf("month") > maxDate.startOf("month") ? month : next;
                  })
                }
              />
              <CalendarGrid
                month={calendarMonth}
                selectedDate={selectedDate}
                minDate={minDate}
                maxDate={maxDate}
                availableDates={availableDates}
                onSelectDate={handleDateSelect}
              />
              {availableDatesQuery.isLoading ? (
                <p className="text-sm text-text-soft">Carregando disponibilidade do mês...</p>
              ) : null}
              {availableDatesError ? (
                <div className="space-y-3">
                  <FeedbackBanner
                    tone={availableDatesError.status === 429 ? "warning" : "danger"}
                    title={
                      availableDatesError.status === 429
                        ? "Limite temporário"
                        : "Não foi possível carregar os dias disponíveis"
                    }
                    description={
                      availableDatesError.status === 429
                        ? `Tente novamente em ${availableDatesError.retryAfterSeconds ?? 30} segundos.`
                        : "Verifique sua conexão e tente outra vez."
                    }
                  />
                  <Button variant="secondary" size="md" onClick={() => availableDatesQuery.refetch()}>
                    Recarregar dias
                  </Button>
                </div>
              ) : null}
              <p className="text-sm text-text-soft">Horários em: {timezone}</p>
            </div>
          )}
          {showSlotsSection && (
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-text-muted">Horários disponíveis</p>
                <p className="text-sm text-text-soft">Selecione o horário que prefere</p>
              </div>
              {slotBanner}
              {multiDayConflictError && (
                <MultiDayConflictError
                  conflictDay={multiDayConflictError.conflictDay}
                  conflictStart={multiDayConflictError.conflictStart}
                  conflictEnd={multiDayConflictError.conflictEnd}
                  timezone={timezone}
                  onRetry={() => {
                    setMultiDayConflictError(null);
                    slotsQuery.refetch();
                  }}
                />
              )}
              <SlotGrid
                slots={slotsQuery.data?.slots ?? []}
                selectedSlotStart={selectedSlotStart}
                timezone={timezone}
                onSelect={handleSlotSelect}
                isLoading={slotsQuery.isLoading}
              />
            </div>
          )}
          {currentStep === "customer" && selectedService && selectedSlot && selectedDate && (
            <div className="space-y-5">
              <SummaryCard
                service={selectedService}
                date={selectedDate}
                slotStart={selectedSlot.start}
                slotEnd={selectedSlot.end}
                professionalName={professional.name}
                timezone={timezone}
                customerPhone={customerPhone}
                daysAffected={(selectedSlot as PublicSlot & { daysAffected?: DaySegment[] }).daysAffected}
              />
              <CustomerDataForm
                nameInputRef={customerNameInputRef}
                name={customerName}
                phone={customerPhone}
                email={customerEmail}
                notes={customerNotes}
                onNameChange={setCustomerName}
                onPhoneChange={setCustomerPhone}
                onEmailChange={setCustomerEmail}
                onNotesChange={setCustomerNotes}
                errors={{
                  name: hasTriedCustomerSubmit && !isNameValid ? "Informe seu nome" : undefined,
                  phone: hasTriedCustomerSubmit && customerPhone && !isPhoneValid ? "Telefone inválido" : undefined,
                  email: hasTriedCustomerSubmit && customerEmail && !isEmailValid ? "Informe um e-mail valido" : undefined,
                }}
              />
            </div>
          )}
          {currentStep === "success" && bookingResult ? (
            <BookingSuccess
              booking={bookingResult}
              timezone={timezone}
              shareUrl={shareUrl}
              customerAppPath={`/c/${professional.tenantSlug}`}
              onNewBooking={resetFlow}
            />
          ) : null}
          {shouldShowBookingNotification && bookingNotification ? (
            <div className="space-y-3">
              <FeedbackBanner
                tone={bookingNotification.type === "generic" ? "danger" : "warning"}
                title={bookingNotification.title}
                description={bookingNotification.description}
              />
              {waitlistPrefillPath ? (
                <Button as={Link} to={waitlistPrefillPath} variant="secondary" size="md">
                  Entrar na lista de espera
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {bookingButtons && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-10 sm:static sm:bg-transparent sm:px-6 sm:py-0"
          style={{ 
            backgroundImage: `linear-gradient(to top, ${colors.background.base} 60%, transparent 100%)` 
          }}
        >
          <Button 
            className="w-full" 
            onClick={handlePrimaryAction} 
            disabled={primaryDisabled} 
            size="md"
          >
            {primaryButtonLabel}
          </Button>
        </div>
      )}
      {createBookingMutation.status === "pending" && <ProcessingOverlay />}
    </div>
  );
}
