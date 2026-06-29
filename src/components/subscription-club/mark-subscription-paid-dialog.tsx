import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import type { MarkSubscriptionPaidInput } from "@/types/subscription-club";

interface MarkSubscriptionPaidDialogProps {
  subscriptionId: string | null;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (input: MarkSubscriptionPaidInput) => void;
}

export function MarkSubscriptionPaidDialog({
  subscriptionId,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: MarkSubscriptionPaidDialogProps) {
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");

  if (!subscriptionId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
      <Card variant="premium" padding="lg" className="w-full max-w-lg">
        <CardTitle>Registrar mensalidade paga</CardTitle>
        <CardDescription className="mt-2">
          Registro manual, sem gateway de pagamento nesta fase.
        </CardDescription>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-text-soft">
            Valor
            <Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="89.90" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-text-soft">
            Pago em
            <Input type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-text-soft">
            Vencimento
            <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Fechar
          </Button>
          <Button
            size="md"
            disabled={isSubmitting || !amount.trim()}
            onClick={() =>
              onConfirm({
                amount: amount.trim(),
                paidAt: paidAt ? new Date(`${paidAt}T12:00:00.000Z`).toISOString() : null,
                dueDate: dueDate ? new Date(`${dueDate}T12:00:00.000Z`).toISOString() : null,
              })
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              "Marcar como pago"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
