import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
};

/**
 * Button specs from the approved Stitch design system
 * (design-reference/.../serene_clinical_intelligence/DESIGN.md
 * "Components > Buttons"), recolored to the PRD's binding hex tokens.
 * - Primary: mint accent fill — reserved for the primary action on a
 *   screen (PRD §5.1 "Accent (mint)"; the design doc calls this out
 *   explicitly as "exclusively for primary calls to action").
 * - Secondary: teal outline.
 * - Ghost: text-only, muted.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", isLoading = false, className = "", disabled, children, ...props },
    ref
  ) => {
    const base =
      "inline-flex h-10 items-center justify-center gap-2 rounded-control px-5 font-medium text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-accent text-ink hover:bg-accent-hover active:bg-accent-active",
      secondary:
        "border border-primary text-primary bg-transparent hover:bg-primary/[0.06]",
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
