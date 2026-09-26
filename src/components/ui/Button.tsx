import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
};

/**
 * Buttons carry the landing page's identity into the product: the same
 * deep-teal CTA gradient (`--color-primary` -> `--color-mkt-teal-deep`)
 * with white text the marketing hero uses, instead of the earlier mint
 * fill — one brand action color across site and app.
 * - Primary: teal gradient, brand glow — the one main action per screen.
 * - Secondary: teal outline on white.
 * - Ghost: text-only, muted.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", isLoading = false, className = "", disabled, children, ...props },
    ref
  ) => {
    const base =
      "inline-flex h-11 items-center justify-center gap-2 rounded-field px-5 font-semibold text-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand hover:brightness-110 hover:shadow-[0_14px_28px_-12px_rgba(0,101,114,0.6)] active:brightness-95",
      secondary:
        "border border-primary/40 bg-card text-primary hover:border-primary hover:bg-mkt-mint-bg",
      ghost: "text-ink-muted bg-transparent hover:bg-ink-muted/[0.08] hover:text-ink",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
