import { useId } from "react";
import { Input } from "@/components/flow/input";
import { Select } from "@/components/flow/select";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import type { Professional } from "@/types/professional";
import type { Service } from "@/types/service";
import type { ListAvailableSlotsInput } from "@/types/slot";

interface SlotSearchFiltersProps {
  professionals: Professional[];
  services: Service[];
  filters: ListAvailableSlotsInput;
  disabled?: boolean;
  onFiltersChange: (filters: ListAvailableSlotsInput) => void;
}

export function SlotSearchFilters({
  professionals,
  services,
  filters,
  disabled = false,
  onFiltersChange,
}: SlotSearchFiltersProps) {
  const professionalId = useId();
  const serviceId = useId();
  const dateId = useId();

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
            type="date"
            inputSize="md"
            value={filters.date}
            disabled={disabled}
            required
            onChange={(event) => {
              onFiltersChange({
                ...filters,
                date: event.target.value,
              });
            }}
          />
        </label>
      </div>
    </Card>
  );
}
