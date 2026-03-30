import type { CSSProperties } from "react";
import { Button } from "@/components/flow/button";
import { Card } from "@/components/flow/card";
import { colors, radius, semanticTokens, shadows, typography } from "@/design-system";

interface UserIdentityHeaderCardProps {
  name?: string | null;
  isLoading?: boolean;
  onLogout: () => void;
}

function resolveDisplayName(name?: string | null) {
  const trimmedName = name?.trim();

  return trimmedName ? trimmedName : "Usuario";
}

function resolveAvatarInitial(displayName: string) {
  return displayName.charAt(0).toUpperCase();
}

function PowerIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v9" />
      <path d="M7.05 5.05a8 8 0 1 0 9.9 0" />
    </svg>
  );
}

export function UserIdentityHeaderCard({
  name,
  isLoading = false,
  onLogout,
}: UserIdentityHeaderCardProps) {
  const displayName = resolveDisplayName(name);
  const avatarInitial = resolveAvatarInitial(displayName);

  return (
    <Card
      variant="glass"
      padding="sm"
      radiusSize="xl"
      className="flex min-h-16 w-full items-center gap-3 border-white/15 md:min-h-[72px] md:max-w-[360px] md:px-4 md:py-3"
      style={{
        borderColor: semanticTokens.border.default,
        boxShadow: shadows.card,
      }}
    >
      <div
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold md:h-10 md:w-10 md:text-base"
        style={{
          backgroundColor: "rgba(255, 138, 61, 0.14)",
          borderColor: semanticTokens.border.accent,
          color: colors.brand.tertiary,
          borderRadius: radius.xl,
          fontFamily: typography.family.sans,
          fontWeight: typography.weight.bold,
        }}
      >
        {isLoading ? <div className="h-4 w-4 rounded-full bg-white/15 animate-pulse" /> : avatarInitial}
      </div>

      <div className="min-w-0 flex-1">
        {isLoading ? (
          <div aria-label="Carregando identidade do usuario" className="space-y-2" aria-live="polite">
            <div className="h-2.5 w-[88px] animate-pulse rounded-full bg-white/10" />
            <div className="h-3.5 w-[96px] animate-pulse rounded-full bg-white/15 md:w-[124px]" />
          </div>
        ) : (
          <>
            <p
              className="text-[11px] leading-4 md:text-xs"
              style={{
                color: colors.text.soft,
                fontFamily: typography.family.sans,
                fontWeight: typography.weight.medium,
              }}
            >
              Bem-vindo de volta
            </p>
            <p
              className="truncate text-sm leading-[18px] text-white md:text-base md:leading-5"
              style={{
                fontFamily: typography.family.sans,
                fontWeight: typography.weight.bold,
              }}
              title={displayName}
            >
              {displayName}
            </p>
          </>
        )}
      </div>

      {isLoading ? (
        <div
          aria-hidden="true"
          className="h-[38px] w-[68px] shrink-0 animate-pulse rounded-full border border-white/10 bg-white/10 md:h-10 md:w-[76px]"
        />
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-[38px] shrink-0 rounded-[var(--user-logout-radius)] border-white/15 bg-white/5 px-3 text-white hover:border-white/20 md:h-10 md:px-3.5"
          style={
            {
              "--user-logout-radius": radius.lg,
            } as CSSProperties
          }
          onClick={onLogout}
        >
          <PowerIcon />
          <span>Sair</span>
        </Button>
      )}
    </Card>
  );
}
