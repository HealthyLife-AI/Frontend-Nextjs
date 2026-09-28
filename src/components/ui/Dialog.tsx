"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Modal shell used by confirmations and the food editor: dimmed backdrop,
 * centered panel, Escape / backdrop click to close (unless `busy`, so a
 * request in flight can't be abandoned half-way).
 *
 * Portalled to <body>: every page sits in AppShell's `animate-page-in`
 * wrapper, whose (fill-mode: both) transform makes it the containing
 * block for `position: fixed`, so an in-place dialog was centred on the
 * whole page instead of the viewport and could open off-screen.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  busy = false,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  busy?: boolean;
  size?: "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => !busy && onClose()} aria-hidden="true" />
      <div
        className={`animate-page-in relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-panel border border-border/70 bg-card shadow-float ${
          size === "lg" ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-divider px-6 py-4">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex h-9 w-9 items-center justify-center rounded-field text-ink-muted hover:bg-canvas hover:text-ink disabled:opacity-40"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
