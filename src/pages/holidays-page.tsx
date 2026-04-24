import { useMemo, useState } from "react";
import { DateTime } from "luxon";
import { Loader2, Trash2, Pencil } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Button } from "@/components/flow/button";
import { Input } from "@/components/flow/input";
import { Checkbox } from "@/components/flow/checkbox";
import { PageState } from "@/components/shared/page-state";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useHolidaysQuery } from "@/hooks/use-holidays-query";
import { useCreateHolidayMutation } from "@/hooks/use-create-holiday-mutation";
import { useUpdateHolidayMutation } from "@/hooks/use-update-holiday-mutation";
import { useDeleteHolidayMutation } from "@/hooks/use-delete-holiday-mutation";
import { ApiError } from "@/types/api";
import { formatIsoDateTimeToBrDate, parseBrDateToIsoDate } from "@/lib/date-br";
import type { Holiday } from "@/types/holiday";

interface FormState {
  dateBr: string;
  name: string;
  description: string;
  isFullDay: boolean;
  startTime: string;
  endTime: string;
}

const emptyForm: FormState = {
  dateBr: "",
  name: "",
  description: "",
  isFullDay: true,
  startTime: "",
  endTime: "",
};

function mapApiError(error: ApiError): string {
  if (error.status === 401) {
    return "Sessao invalida. Faca login novamente.";
  }

  if (error.status === 403) {
    return "Voce nao tem permissao para gerenciar bloqueios.";
  }

  if (error.status === 400) {
    return "Dados invalidos. Revise os campos informados.";
  }

  return "Nao foi possivel concluir a operacao agora.";
}

function formatHolidayTimeRange(holiday: Holiday, timezone: string): string {
  if (holiday.isFullDay) {
    return "Dia inteiro";
  }

  if (!holiday.startTimeUtc || !holiday.endTimeUtc) {
    return "Parcial";
  }

  const startLocal = DateTime.fromISO(holiday.startTimeUtc, { zone: "utc" }).setZone(timezone);
  const endLocal = DateTime.fromISO(holiday.endTimeUtc, { zone: "utc" }).setZone(timezone);
  return `${startLocal.toFormat("HH:mm")} - ${endLocal.toFormat("HH:mm")}`;
}

export function HolidaysPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const timezone = auth.tenant?.timezone ?? "America/Sao_Paulo";

  const todayIso = useMemo(() => DateTime.now().setZone(timezone).toFormat("yyyy-MM-dd"), [timezone]);
  const [startDateBr, setStartDateBr] = useState<string>(() => {
    const today = DateTime.now().setZone(timezone);
    return today.startOf("month").toFormat("dd/MM/yyyy");
  });
  const [endDateBr, setEndDateBr] = useState<string>(() => {
    const today = DateTime.now().setZone(timezone);
    return today.endOf("month").toFormat("dd/MM/yyyy");
  });

  const startDateIso = parseBrDateToIsoDate(startDateBr) ?? undefined;
  const endDateIso = parseBrDateToIsoDate(endDateBr) ?? undefined;

  const listQuery = useHolidaysQuery({ startDate: startDateIso, endDate: endDateIso });
  const createMutation = useCreateHolidayMutation();
  const updateMutation = useUpdateHolidayMutation();
  const deleteMutation = useDeleteHolidayMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => ({
    ...emptyForm,
    dateBr: DateTime.fromISO(todayIso, { zone: "utc" }).toFormat("dd/MM/yyyy"),
  }));

  if (!auth.tenant) {
    return (
      <PageState
        title="Carregando tenant"
        description="Aguarde a inicializacao da sessao."
      />
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const dateIso = parseBrDateToIsoDate(form.dateBr);
    if (!dateIso) {
      toast({
        title: "Data invalida",
        description: "Use o formato dd/mm/aaaa.",
        variant: "warning",
      });
      return;
    }

    if (!form.name.trim()) {
      toast({
        title: "Nome obrigatorio",
        description: "Informe um nome para o bloqueio.",
        variant: "warning",
      });
      return;
    }

    if (!form.isFullDay) {
      if (!form.startTime.trim() || !form.endTime.trim()) {
        toast({
          title: "Horario obrigatorio",
          description: "Para bloqueio parcial, informe inicio e fim.",
          variant: "warning",
        });
        return;
      }
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          input: {
            date: dateIso,
            name: form.name.trim(),
            description: form.description.trim() ? form.description.trim() : null,
            isFullDay: form.isFullDay,
            startTime: form.isFullDay ? null : form.startTime.trim(),
            endTime: form.isFullDay ? null : form.endTime.trim(),
          },
        });
        toast({ title: "Atualizado", description: "Bloqueio atualizado com sucesso." });
      } else {
        await createMutation.mutateAsync({
          date: dateIso,
          name: form.name.trim(),
          description: form.description.trim() ? form.description.trim() : null,
          isFullDay: form.isFullDay,
          startTime: form.isFullDay ? null : form.startTime.trim(),
          endTime: form.isFullDay ? null : form.endTime.trim(),
        });
        toast({ title: "Criado", description: "Bloqueio criado com sucesso." });
      }

      setEditingId(null);
      setForm((prev) => ({
        ...emptyForm,
        dateBr: prev.dateBr,
      }));
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast({
          title: "Falha ao salvar",
          description: mapApiError(error),
          variant: "danger",
        });
        return;
      }

      toast({
        title: "Falha ao salvar",
        description: "Erro inesperado.",
        variant: "danger",
      });
    }
  }

  function startEdit(item: Holiday) {
    setEditingId(item.id);
    setForm({
      dateBr: formatIsoDateTimeToBrDate(item.date, timezone),
      name: item.name,
      description: item.description ?? "",
      isFullDay: item.isFullDay,
      startTime: item.startTimeUtc
        ? DateTime.fromISO(item.startTimeUtc, { zone: "utc" }).setZone(timezone).toFormat("HH:mm")
        : "",
      endTime: item.endTimeUtc
        ? DateTime.fromISO(item.endTimeUtc, { zone: "utc" }).setZone(timezone).toFormat("HH:mm")
        : "",
    });
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Removido", description: "Bloqueio removido com sucesso." });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast({
          title: "Falha ao remover",
          description: mapApiError(error),
          variant: "danger",
        });
        return;
      }

      toast({
        title: "Falha ao remover",
        description: "Erro inesperado.",
        variant: "danger",
      });
    }
  }

  const items = listQuery.data?.holidays ?? [];

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">Feriados e bloqueios</h2>
        <p className="mt-2 text-sm leading-6 text-text-soft">
          Bloqueie dias e horarios para impedir novos agendamentos.
        </p>
      </div>

      <Card className="p-6">
        <CardTitle>Filtro por periodo</CardTitle>
        <CardDescription>Use dd/mm/aaaa (Brasil). A API recebe YYYY-MM-DD.</CardDescription>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-white">
            Inicio
            <Input
              value={startDateBr}
              onChange={(event) => setStartDateBr(event.target.value)}
              placeholder="01/04/2026"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-white">
            Fim
            <Input
              value={endDateBr}
              onChange={(event) => setEndDateBr(event.target.value)}
              placeholder="30/04/2026"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-text-soft">
          Data de referencia do tenant: <span className="text-white">{timezone}</span>.
        </p>
      </Card>

      <Card className="p-6">
        <CardTitle>{editingId ? "Editar bloqueio" : "Novo bloqueio"}</CardTitle>
        <CardDescription>Dia inteiro ou intervalo no dia, com motivo opcional.</CardDescription>

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-white">
              Data (dd/mm/aaaa)
              <Input
                value={form.dateBr}
                onChange={(event) => setForm((prev) => ({ ...prev, dateBr: event.target.value }))}
                placeholder="24/04/2026"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-white">
              Nome
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Feriado municipal"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-white">
            Descricao / motivo (opcional)
            <Input
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Ex.: sem atendimento"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-3 text-sm font-semibold text-white">
              <Checkbox
                checked={form.isFullDay}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({
                    ...prev,
                    isFullDay: Boolean(checked),
                  }))
                }
              />
              Dia inteiro
            </label>
            {!form.isFullDay ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-white">
                  Inicio (HH:MM)
                  <Input
                    value={form.startTime}
                    onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
                    placeholder="09:00"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-white">
                  Fim (HH:MM)
                  <Input
                    value={form.endTime}
                    onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
                    placeholder="12:00"
                  />
                </label>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </span>
              ) : editingId ? (
                "Salvar alteracoes"
              ) : (
                "Criar bloqueio"
              )}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm((prev) => ({ ...emptyForm, dateBr: prev.dateBr }));
                }}
              >
                Cancelar edicao
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <CardTitle>Bloqueios cadastrados</CardTitle>
        <CardDescription>
          {listQuery.isLoading ? "Carregando..." : `${items.length} itens`}
        </CardDescription>

        {listQuery.isLoading ? (
          <div className="mt-4 flex items-center gap-2 text-text-soft">
            <Loader2 className="h-4 w-4 animate-spin" />
            Buscando bloqueios...
          </div>
        ) : listQuery.isError ? (
          <div className="mt-4">
            <PageState
              title="Falha ao carregar"
              description={
                listQuery.error instanceof ApiError
                  ? mapApiError(listQuery.error)
                  : "Erro inesperado."
              }
            />
          </div>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-text-soft">Nenhum bloqueio no periodo.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {formatIsoDateTimeToBrDate(item.date, timezone)}{" "}
                      <span className="text-text-soft">•</span>{" "}
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-text-soft">
                      {formatHolidayTimeRange(item, timezone)}
                      {item.description ? ` — ${item.description}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => startEdit(item)}
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
