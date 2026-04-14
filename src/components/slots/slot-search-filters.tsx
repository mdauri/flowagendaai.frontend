import { useEffect, useId, useState } from "react";
import { DateTime } from "luxon";
import { Input } from "@/components/flow/input";
import { Select } from "@/components/flow/select";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { CalendarGrid, MonthNavigator } from "@/components/public-booking/date-picker";
import type { Professional } from "@/types/professional";
import type { Service } from "@/types/service";
import type { ListAvailableSlotsInput } from "@/types/slot";

interface SlotSearchFiltersProps {
  professionals: Professional[];
  services: Service[];
  filters: ListAvailableSlotsInput;
  timezone: string;
  calendarMonth: DateTime;
  availableDates: Set<string>;
  canLoadAvailability: boolean;
  isAvailabilityLoading: boolean;
  availabilityErrorMessage: string | null;
  disabled?: boolean;
  onCalendarMonthChange: (month: DateTime) => void;
  onFiltersChange: (filters: ListAvailableSlotsInput) => void;
}

export function SlotSearchFilters({
  professionals,
  services,
  filters,
  timezone,
  calendarMonth,
  availableDates,
  canLoadAvailability,
  isAvailabilityLoading,
  availabilityErrorMessage,
  disabled = false,
  onCalendarMonthChange,
  onFiltersChange,
}: SlotSearchFiltersProps) {
  const professionalId = useId();
  const serviceId = useId();
  const dateId = useId();
  const selectedDate = filters.date
    ? DateTime.fromISO(filters.date, { zone: timezone }).startOf("day")
    : null;
  const [dateInputValue, setDateInputValue] = useState(() =>
    filters.date
      ? DateTime.fromISO(filters.date, { zone: timezone }).toFormat("dd/MM/yyyy")
      : ""
  );
  const minDate = DateTime.now().setZone(timezone).minus({ months: 12 }).startOf("month");
  const maxDate = DateTime.now().setZone(timezone).plus({ months: 12 }).endOf("month");
  const isDateInputDisabled = disabled || !canLoadAvailability || isAvailabilityLoading;

  useEffect(() => {
    if (!filters.date) {
      setDateInputValue("");
      return;
    }

    const parsed = DateTime.fromISO(filters.date, { zone: timezone });
    if (!parsed.isValid) {
      return;
    }

    setDateInputValue(parsed.toFormat("dd/MM/yyyy"));
  }, [filters.date, timezone]);

  function parseCivilDateFromInput(value: string): DateTime | null {
    const trimmed = value.trim();

    const parsedBr = DateTime.fromFormat(trimmed, "dd/MM/yyyy", {
      zone: timezone,
      locale: "pt-BR",
    });

    if (parsedBr.isValid && parsedBr.toFormat("dd/MM/yyyy") === trimmed) {
      return parsedBr.startOf("day");
    }

    const parsedIso = DateTime.fromISO(trimmed, { zone: timezone });
    if (parsedIso.isValid && parsedIso.toISODate() === trimmed) {
      return parsedIso.startOf("day");
    }

    return null;
  }

  return (
    <Card variant="premium" padding="lg">
      <div>
        <CardTitle>Filtros da consulta</CardTitle>
        <CardDescription className="mt-3">
          Selecione profissional, servico e data antes de consultar a API de slots.
        </CardDescription>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <label className="grid gap-2" htmlFor={professionalId}>
          <span className="text-sm font-semibold text-white">Profissional</span>
          <Select
            id={professionalId}
            value={filters.professionalId}
            disabled={disabled}
            placeholder="Selecione um profissional"
            options={professionals.map((professional) => ({
              label: professional.name,
              value: professional.id,
            }))}
            onValueChange={(professionalIdValue) => {
              onFiltersChange({
                ...filters,
                professionalId: professionalIdValue,
              });
            }}
          />
        </label>

        <label className="grid gap-2" htmlFor={serviceId}>
          <span className="text-sm font-semibold text-white">Servico</span>
          <Select
            id={serviceId}
            value={filters.serviceId}
            disabled={disabled}
            placeholder="Selecione um servico"
            options={services.map((service) => ({
              label: service.name,
              value: service.id,
            }))}
            onValueChange={(serviceIdValue) => {
              onFiltersChange({
                ...filters,
                serviceId: serviceIdValue,
              });
            }}
          />
        </label>

        <label className="grid gap-2" htmlFor={dateId}>
          <span className="text-sm font-semibold text-white">Data</span>
          <Input
            id={dateId}
            type="text"
            inputSize="md"
            inputMode="numeric"
            placeholder="dd/mm/aaaa"
            value={dateInputValue}
            disabled={isDateInputDisabled}
            required
            onChange={(event) => {
              const nextValue = event.target.value;
              setDateInputValue(nextValue);

              if (nextValue.trim() === "") {
                onFiltersChange({
                  ...filters,
                  date: "",
                });
                return;
              }

              const parsedDate = parseCivilDateFromInput(nextValue);
              if (!parsedDate) {
                return;
              }

              const nextIsoDate = parsedDate.toISODate()!;
              onFiltersChange({
                ...filters,
                date: nextIsoDate,
              });
              onCalendarMonthChange(parsedDate.startOf("month"));
            }}
            onBlur={() => {
              const trimmed = dateInputValue.trim();

              if (trimmed === "") {
                onFiltersChange({
                  ...filters,
                  date: "",
                });
                return;
              }

              const parsedDate = parseCivilDateFromInput(trimmed);
              if (!parsedDate) {
                onFiltersChange({
                  ...filters,
                  date: "",
                });
                return;
              }

              const normalizedText = parsedDate.toFormat("dd/MM/yyyy");
              setDateInputValue(normalizedText);
              onFiltersChange({
                ...filters,
                date: parsedDate.toISODate()!,
              });
              onCalendarMonthChange(parsedDate.startOf("month"));
            }}
          />
        </label>
      </div>

      <div className="mt-8 grid gap-4">
        <MonthNavigator
          month={calendarMonth}
          minDate={minDate}
          maxDate={maxDate}
          onPrevMonth={() => onCalendarMonthChange(calendarMonth.minus({ months: 1 }).startOf("month"))}
          onNextMonth={() => onCalendarMonthChange(calendarMonth.plus({ months: 1 }).startOf("month"))}
        />
        <CalendarGrid
          month={calendarMonth}
          selectedDate={selectedDate}
          minDate={minDate}
          maxDate={maxDate}
          availableDates={availableDates}
          onSelectDate={(date) => {
            const nextDate = date.setZone(timezone).toISODate();

            if (!nextDate || !availableDates.has(nextDate)) {
              return;
            }

            onFiltersChange({
              ...filters,
              date: nextDate,
            });
          }}
        />

        {!canLoadAvailability ? (
          <p className="text-xs text-white/60">
            Selecione profissional e servico para habilitar a disponibilidade do calendario.
          </p>
        ) : null}

        {canLoadAvailability && isAvailabilityLoading ? (
          <p className="text-xs text-white/60">Carregando disponibilidade do mes...</p>
        ) : null}

        {availabilityErrorMessage ? (
          <p className="text-xs text-rose-200">{availabilityErrorMessage}</p>
        ) : null}

        {canLoadAvailability && !isAvailabilityLoading && !availabilityErrorMessage && availableDates.size === 0 ? (
          <p className="text-xs text-white/60">
            Nenhum dia disponivel neste mes. Navegue para outro mes ou altere os filtros.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
