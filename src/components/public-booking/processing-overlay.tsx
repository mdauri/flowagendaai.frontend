export function ProcessingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border-subtle bg-surface-glass p-6 text-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-border-subtle border-t-primary-500" />
        <p className="text-lg font-semibold text-text-primary">{message ?? "Confirmando seu agendamento..."}</p>
        <p className="text-sm text-text-soft">Validando disponibilidade no servidor.</p>
      </div>
    </div>
  );
}
