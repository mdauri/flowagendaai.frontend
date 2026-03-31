export function ProcessingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/10 border-t-primary-500" />
        <p className="text-lg font-semibold text-white">{message ?? "Confirmando seu agendamento..."}</p>
        <p className="text-sm text-white/70">Validando disponibilidade no servidor.</p>
      </div>
    </div>
  );
}
