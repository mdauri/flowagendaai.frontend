import * as React from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/flow/button";
import { cn } from "@/lib/cn";

interface DashboardBookingActionsMenuProps {
  disabled?: boolean;
  onCancel: () => void;
  cancelDisabled?: boolean;
  cancelLabel: string;
}

const MENU_WIDTH_PX = 220;

export function DashboardBookingActionsMenu({
  disabled = false,
  onCancel,
  cancelDisabled = false,
  cancelLabel,
}: DashboardBookingActionsMenuProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [menuRect, setMenuRect] = React.useState<{ top: number; left: number } | null>(null);

  const updateMenuRect = React.useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuRect({
      top: rect.bottom + 8,
      left: rect.right - MENU_WIDTH_PX,
    });
  }, []);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updateMenuRect);
    window.addEventListener("scroll", updateMenuRect, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updateMenuRect);
      window.removeEventListener("scroll", updateMenuRect, true);
    };
  }, [updateMenuRect]);

  React.useEffect(() => {
    if (isOpen) {
      updateMenuRect();
    }
  }, [isOpen, updateMenuRect]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:[border-color:var(--control-focus-border)] focus-visible:[box-shadow:var(--control-focus-ring)] disabled:opacity-50",
        )}
        style={{
          "--control-focus-border": "rgba(255, 184, 77, 0.65)",
          "--control-focus-ring": "0 0 0 3px rgba(255, 184, 77, 0.22)",
        } as React.CSSProperties}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Acoes do agendamento"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
      >
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>

      {isOpen && menuRect && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              className="fixed z-[999] w-[220px] rounded-[24px] border border-white/10 bg-[#121216] p-2 shadow-lg"
              style={{ top: menuRect.top, left: Math.max(12, menuRect.left) }}
            >
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="w-full justify-start"
                role="menuitem"
                disabled={cancelDisabled}
                onClick={() => {
                  setIsOpen(false);
                  onCancel();
                }}
              >
                {cancelLabel}
              </Button>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
