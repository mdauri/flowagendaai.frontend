import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { colors, radius, semanticTokens, typography } from "@/design-system";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  id?: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  "aria-describedby"?: string;
  onValueChange: (value: string) => void;
}

const triggerStyle: React.CSSProperties = {
  borderRadius: radius.xl,
  backgroundColor: "#4a4a4d",
  borderColor: semanticTokens.border.default,
  color: colors.text.primary,
  fontFamily: typography.family.sans,
  fontWeight: typography.weight.medium,
};

const menuStyle: React.CSSProperties = {
  borderRadius: radius.xl,
  backgroundColor: "#454548",
  borderColor: "#5a5a5e",
};

export function Select({
  id,
  value,
  options,
  placeholder = "Selecione uma opcao",
  disabled = false,
  onValueChange,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [menuRect, setMenuRect] = React.useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const selectedOption = options.find((option) => option.value === value) ?? null;

  const updateMenuRect = React.useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setMenuRect({
      top: rect.bottom + 10,
      left: rect.left,
      width: rect.width,
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
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex h-12 w-full items-center justify-between border px-4 text-left text-sm outline-none transition-all focus-visible:[border-color:var(--control-focus-border)] focus-visible:[box-shadow:var(--control-focus-ring)] disabled:pointer-events-none disabled:opacity-[var(--control-disabled-opacity)] disabled:[cursor:var(--control-disabled-cursor)] disabled:[filter:var(--control-disabled-filter)]"
        )}
        style={{
          ...triggerStyle,
          "--control-focus-border": semanticTokens.interaction.focus.border,
          "--control-focus-ring": semanticTokens.interaction.focus.ring,
          "--control-disabled-opacity": semanticTokens.interaction.disabled.opacity,
          "--control-disabled-filter": semanticTokens.interaction.disabled.filter,
          "--control-disabled-cursor": semanticTokens.interaction.disabled.cursor,
        } as React.CSSProperties}
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        {...props}
      >
        <span className={cn(selectedOption ? "text-white" : "text-text-soft")}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span
          className={cn(
            "text-xs text-text-soft transition-transform",
            isOpen ? "rotate-180" : "rotate-0"
          )}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {isOpen && menuRect
        ? createPortal(
            // Render the menu at the document root so it never blends with parent glass cards
            // or gets visually clipped by local stacking/overflow contexts.
            <div
              ref={menuRef}
              className="fixed z-[999] border p-2"
              style={{
                ...menuStyle,
                top: menuRect.top,
                left: menuRect.left,
                width: menuRect.width,
              }}
            >
              <ul className="grid max-h-72 gap-1 overflow-auto" role="listbox" aria-labelledby={id}>
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === ""}
                    className={cn(
                      "w-full rounded-2xl px-4 py-3 text-left text-sm transition-colors",
                      value === ""
                        ? "bg-[#626265] text-white"
                        : "text-text-soft hover:bg-[#57575b] hover:text-white"
                    )}
                    onClick={() => {
                      onValueChange("");
                      setIsOpen(false);
                    }}
                  >
                    {placeholder}
                  </button>
                </li>
                {options.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={option.value === value}
                      className={cn(
                        "w-full rounded-2xl px-4 py-3 text-left text-sm transition-colors",
                        option.value === value
                          ? "bg-[#626265] text-white"
                          : "text-text-soft hover:bg-[#57575b] hover:text-white"
                      )}
                      onClick={() => {
                        onValueChange(option.value);
                        setIsOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
