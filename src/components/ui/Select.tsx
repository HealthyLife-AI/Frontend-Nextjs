import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

/** Same field chrome as TextField (height, radius, focus ring, label/error placement). */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = "", children, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const errorId = `${fieldId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-semibold text-ink">
          {label}
        </label>

        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={`h-12 w-full appearance-none rounded-field border border-border bg-canvas/60 ps-3.5 pe-10 text-sm text-ink outline-none transition-all hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10 ${
              error ? "border-danger focus:border-danger focus:ring-danger/15" : ""
            } ${className}`}
            {...props}
          >
            {children}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute inset-y-0 end-3 my-auto text-ink-muted"
          />
        </div>

        {error && (
          <p id={errorId} className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
