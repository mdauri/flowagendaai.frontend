interface TenantIdentityHeaderProps {
  name: string;
  logoUrl: string | null;
  description?: string | null;
  compact?: boolean;
}

export function TenantIdentityHeader({
  name,
  logoUrl,
  description,
  compact = false,
}: TenantIdentityHeaderProps) {
  return (
    <header>
      <div className={compact ? "flex min-w-0 items-center gap-3" : ""}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className={`${compact ? "h-11 w-11" : "h-14 w-14"} shrink-0 rounded-full border border-[var(--theme-border-subtle)] object-cover`}
          />
        ) : (
          <div
            className={`${compact ? "h-11 w-11 text-base" : "h-14 w-14 text-lg"} flex shrink-0 items-center justify-center rounded-full border border-[var(--theme-border-accent)] bg-[var(--theme-overlay-primary-soft)] font-black text-[var(--theme-text-primary)]`}
            aria-hidden="true"
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={compact ? "min-w-0" : "mt-4"}>
          {!compact ? (
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
              App do cliente
            </p>
          ) : null}
          <h1
            className={`${compact ? "truncate text-xl" : "mt-2 text-3xl"} font-black text-[var(--theme-text-primary)]`}
          >
            {name}
          </h1>
        </div>
      </div>
      {!compact ? (
        <p className="mt-3 text-sm leading-6 text-text-soft">
          {description?.trim() ||
            "Agende, acompanhe seus horários e receba lembretes neste aparelho."}
        </p>
      ) : null}
    </header>
  );
}
