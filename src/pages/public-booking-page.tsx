import { useEffect, useMemo, useState } from "react";
import { colors, typography } from "@/design-system";
import { DateTime } from "luxon";
import { useSearchParams, useParams } from "react-router-dom";
import { Button } from "@/components/flow/button";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PublicBookingHeader } from "@/components/public-booking/public-booking-header";
import { TenantCoverBanner } from "@/components/branding/tenant-cover-banner";
import { SlotGrid } from "@/components/public-booking/slots";
import { CustomerDataForm, SummaryCard } from "@/components/public-booking/customer-data-form";
import { ServiceSelector } from "@/components/public-booking/service-selector";
import { MonthNavigator, CalendarGrid } from "@/components/public-booking/date-picker";
import { BookingSuccess } from "@/components/public-booking/booking-success";
import { ProcessingOverlay } from "@/components/public-booking/processing-overlay";
import { ProfessionalSkeleton } from "@/components/public-booking/professional-skeleton";
import { ConnectionErrorState, ProfessionalNotFoundState } from "@/components/public-booking/professional-error";
import { usePublicProfessionalQuery } from "@/hooks/use-public-professional-query";
import { usePublicServicesQuery } from "@/hooks/use-public-services-query";
import { usePublicAvailableDatesQuery } from "@/hooks/use-public-available-dates-query";
import { usePublicSlotsQuery } from "@/hooks/use-public-slots-query";
import { useCreatePublicBookingMutation } from "@/hooks/use-create-public-booking-mutation";
import { ApiError, BOOKING_CONFLICT_ERROR_CODE } from "@/types/api";
import type {
  CreatePublicBookingResponse,
  PublicBookingStep,
  PublicServiceItem,
  PublicSlot,
} from "@/types/public-booking";

const BRAZILIAN_PHONE_REGEX = /^\+55\s\(\d{2}\)\s\d{5}-\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const stepTitles: Record<PublicBookingStep, string> = {
  service: "Escolha o serviço",
  date: "Escolha a data",
  slot: "Selecione um horário",
  customer: "Complete seus dados",
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
    if (preselectedServiceId && !selectedService) {
      const matchedService = servicesQuery.data.find((service) => service.id === preselectedServiceId);
      if (matchedService) {
        setSelectedService(matchedService);
      }
    }
  }, [preselectedServiceId, servicesQuery.data, selectedService]);

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
  const stepOrder: PublicBookingStep[] = ["service", "date", "slot", "customer"];
  const canGoBack = stepOrder.includes(currentStep) && currentStep !== "service";

  const selectedSlotStart = selectedSlot?.start ?? null;
  const slotError = slotsQuery.error as ApiError | null;
  const isSlotRateLimit = slotError?.status === 429;
  const availableDatesError = availableDatesQuery.error as ApiError | null;

  const isNameValid = customerName.trim().length >= 3;
  const isPhoneValid = BRAZILIAN_PHONE_REGEX.test(customerPhone);
  const isEmailValid =
    customerEmail.trim().length === 0 || EMAIL_REGEX.test(customerEmail.trim().toLowerCase());
  const formIsValid = isNameValid && isPhoneValid && isEmailValid;

  const inSlotStep = currentStep === "slot";
  const showSlotsSection = inSlotStep || currentStep === "customer";

  const stepSubtitle = useMemo(() => stepTitles[currentStep], [currentStep]);
  const stepIndex = stepOrder.indexOf(currentStep);
  const displayedStep = stepIndex >= 0 ? stepIndex + 1 : stepOrder.length;

  const handleServiceSelect = (service: PublicServiceItem) => {
    if (selectedService?.id === service.id) return;
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedSlot(null);
    setCalendarMonth(minDate.startOf("month"));
    setBookingNotification(null);
  };

  const handleDateSelect = (date: DateTime) => {
    setSelectedDate(date.setZone(tenantTimezone).startOf("day"));
    setSelectedSlot(null);
    setBookingNotification(null);
  };

  const handleSlotSelect = (slot: PublicSlot) => {
    setSelectedSlot(slot);
    setBookingNotification(null);
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
          onSuccess: (booking) => {
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

  const bookingButtons = currentStep !== "success" && currentStep !== "confirm";
  const primaryButtonLabel =
    currentStep === "service"
      ? "Continuar"
      : currentStep === "date"
      ? "Ver horários"
      : currentStep === "slot"
      ? "Continuar"
      : currentStep === "customer"
      ? "Confirmar agendamento"
      : "";

  const primaryDisabled =
    currentStep === "service"
      ? !selectedService
      : currentStep === "date"
      ? !selectedDate
      : currentStep === "slot"
      ? !selectedSlot
      : currentStep === "customer"
      ? !formIsValid
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
        <ProfessionalSkeleton />
      </div>
    );
  }

  if (professionalQuery.isError) {
    const error = professionalQuery.error as ApiError;
    if (error?.status === 404) {
      return <ProfessionalNotFoundState />;
    }
    return <ConnectionErrorState onRetry={() => professionalQuery.refetch()} />;
  }

  if (!professional) {
    return null;
  }

  const shouldShowBookingNotification =
    bookingNotification && currentStep !== "confirm" && currentStep !== "success";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div
      className="min-h-screen pb-32 text-white transition-colors duration-500"
      style={{
        backgroundColor: colors.background.base,
        fontFamily: typography.family.sans,
      }}
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 transition-all duration-300 sm:px-6 lg:px-8">
        {/* Cover Banner */}
        <TenantCoverBanner
          tenantName={professional.tenantName}
          tenantSlug={professional.tenantSlug ?? undefined}
          logoUrl={professional.tenantLogoUrl}
          coverImageUrl={professional.tenantCoverImageUrl}
          coverThumbnailUrl={professional.tenantCoverThumbnailUrl}
          publicAddress={professional.tenantPublicAddress}
          variant="compact"
        />

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
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              Etapa {displayedStep} de {stepOrder.length}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-black">{stepSubtitle}</h2>
            {currentStep === "date" && selectedService ? (
              <p className="mt-1 text-sm text-white/70">
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
                <p className="text-sm text-white/70">Carregando disponibilidade do mês...</p>
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
              <p className="text-sm text-white/70">Horários em: {timezone}</p>
            </div>
          )}
          {showSlotsSection && (
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/60">Horários disponíveis</p>
                <p className="text-sm text-white/70">Selecione o horário que prefere</p>
              </div>
              {slotBanner}
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
              <CustomerDataForm
                name={customerName}
                phone={customerPhone}
                email={customerEmail}
                notes={customerNotes}
                onNameChange={setCustomerName}
                onPhoneChange={setCustomerPhone}
                onEmailChange={setCustomerEmail}
                onNotesChange={setCustomerNotes}
                errors={{
                  name: !isNameValid ? "Informe seu nome" : undefined,
                  phone: customerPhone && !isPhoneValid ? "Telefone inválido" : undefined,
                  email: customerEmail && !isEmailValid ? "Informe um e-mail valido" : undefined,
                }}
              />
              <SummaryCard
                service={selectedService}
                date={selectedDate}
                slotStart={selectedSlot.start}
                slotEnd={selectedSlot.end}
                professionalName={professional.name}
                timezone={timezone}
                customerPhone={customerPhone}
              />
            </div>
          )}
          {currentStep === "success" && bookingResult ? (
            <BookingSuccess
              booking={bookingResult}
              timezone={timezone}
              shareUrl={shareUrl}
              onNewBooking={resetFlow}
            />
          ) : null}
          {shouldShowBookingNotification && bookingNotification ? (
            <FeedbackBanner
              tone={bookingNotification.type === "generic" ? "danger" : "warning"}
              title={bookingNotification.title}
              description={bookingNotification.description}
            />
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
