import { DateTime } from "luxon";
import { CalendarDays, ChevronLeft, ChevronRight, FilterX } from "lucide-react";
import { Badge } from "@/components/flow/badge";
import { Button } from "@/components/flow/button";
import { Card } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { SectionHeading } from "@/components/flow/section-heading";
import { Select } from "@/components/flow/select";

interface DashboardHeaderProps {
  date: string;
  tenantTimezone: string;
  professionalId: string;
  serviceId: string;
  status: string;
  customerQuery: string;
  professionals: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string }>;
  onDateChange: (date: string) => void;
  onPreviousDate: () => void;
  onNextDate: () => void;
  onToday: () => void;
  onTomorrow: () => void;
  onProfessionalChange: (professionalId: string) => void;
  onServiceChange: (serviceId: string) => void;
  onStatusChange: (status: string) => void;
  onCustomerQueryChange: (value: string) => void;
  onClearFilters: () => void;
}

function formatDashboardDate(date: string, tenantTimezone: string) {
  return DateTime.fromISO(date, { zone: tenantTimezone }).setLocale("pt-BR").toFormat("dd 'de' LLLL 'de' yyyy");
}

function isTodayInTenant(date: string, tenantTimezone: string) {
  return DateTime.now().setZone(tenantTimezone).toISODate() === date;
}

export function DashboardHeader({
  date,
  tenantTimezone,
  professionalId,
  serviceId,
  status,
  customerQuery,
  professionals,
  services,
  onDateChange,
  onPreviousDate,
  onNextDate,
  onToday,
  onTomorrow,
  onProfessionalChange,
  onServiceChange,
  onStatusChange,
  onCustomerQueryChange,
  onClearFilters,
}: DashboardHeaderProps) {
  const isToday = isTodayInTenant(date, tenantTimezone);
  const professionalOptions = professionals.map((professional) => ({
    value: professional.id,
    label: professional.name,
  }));
  const serviceOptions = services.map((service) => ({
    value: service.id,
    label: service.name,
  }));
  const statusOptions = [
    { value: "CONFIRMED", label: "Confirmado" },
    { value: "PENDING", label: "Pendente" },
    { value: "CANCELLED", label: "Cancelado" },
    { value: "COMPLETED", label: "Concluido" },
  ];

  return (
    <div className="grid gap-4">
      <SectionHeading
        eyebrow="Dashboard Operacional"
        title="Dashboard operacional"
        description={`Baseado em ${formatDashboardDate(date, tenantTimezone)} no timezone ${tenantTimezone}.`}
      />

      <Card
        variant="glass"
        padding="md"
        radiusSize="xxl"
        className="grid gap-4 border-white/20 transition-all duration-200"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-1">
            <p className="text-xs uppercase tracking-[0.14em] text-text-soft">Explorar agenda</p>
            <p className="text-sm text-text-soft">
              Navegue por datas e aplique filtros para focar nos agendamentos mais relevantes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isToday ? <Badge variant="info">Hoje</Badge> : null}
            <Badge variant="subtle">{tenantTimezone}</Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearFilters}
              aria-label="Limpar filtros do dashboard"
            >
              <FilterX className="h-4 w-4" aria-hidden="true" />
              Limpar filtros
            </Button>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.25fr,1fr]">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 p-0 transition-all duration-200"
                onClick={onPreviousDate}
                aria-label="Ir para dia anterior"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </Button>

              <div className="flex min-h-10 items-center gap-2 rounded-2xl border border-white/20 bg-black/15 px-3 py-2 transition-all duration-200">
                <CalendarDays className="h-4 w-4 text-text-soft" aria-hidden="true" />
                <Input
                  type="date"
                  value={date}
                  inputSize="sm"
                  className="h-auto w-[10.5rem] border-0 bg-transparent px-0 py-0 [background-color:transparent] [box-shadow:none] focus-visible:[box-shadow:none]"
                  onChange={(event) => {
                    onDateChange(event.target.value);
                  }}
                  aria-label="Selecionar data do dashboard"
                />
              </div>

              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 p-0 transition-all duration-200"
                onClick={onNextDate}
                aria-label="Ir para proximo dia"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </Button>

              <Button size="sm" variant="secondary" onClick={onToday}>
                Hoje
              </Button>
              <Button size="sm" variant="secondary" onClick={onTomorrow}>
                Amanha
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
            <div className="grid gap-1.5">
              <p className="text-xs uppercase tracking-[0.12em] text-text-soft">Profissional</p>
              <Select
                value={professionalId}
                options={professionalOptions}
                placeholder="Todos os profissionais"
                onValueChange={onProfessionalChange}
                aria-describedby="dashboard-professional-filter"
              />
            </div>

            <div className="grid gap-1.5">
              <p className="text-xs uppercase tracking-[0.12em] text-text-soft">Servico</p>
              <Select
                value={serviceId}
                options={serviceOptions}
                placeholder="Todos os servicos"
                onValueChange={onServiceChange}
                aria-describedby="dashboard-service-filter"
              />
            </div>

            <div className="grid gap-1.5">
              <p className="text-xs uppercase tracking-[0.12em] text-text-soft">Status</p>
              <Select
                value={status}
                options={statusOptions}
                placeholder="Todos os status"
                onValueChange={onStatusChange}
                aria-describedby="dashboard-status-filter"
              />
            </div>

            <div className="grid gap-1.5">
              <p className="text-xs uppercase tracking-[0.12em] text-text-soft">Cliente</p>
              <Input
                value={customerQuery}
                type="search"
                inputSize="sm"
                placeholder="Nome ou telefone"
                onChange={(event) => onCustomerQueryChange(event.target.value)}
                aria-label="Filtrar por cliente"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
