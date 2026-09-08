"use client";

import { InputHTMLAttributes, forwardRef, useId, useState } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

/**
 * Input spec from the approved Stitch design system: 42px height, 8px
 * radius, label top-aligned above the field, error message directly
 * below it, teal focus ring. A `type="password"` field gets a show/hide
 * toggle so people can verify what they typed before submitting —
 * standard practice for a security-sensitive login/register form, and
 * it never clears the field's value on error (data-loss-on-error is the
 * single most common auth-form defect).
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, id, type = "text", className = "", ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;
    const [revealed, setRevealed] = useState(false);

    const isPassword = type === "password";
    const resolvedType = isPassword && revealed ? "text" : type;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-ink"
        >
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={resolvedType}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={`h-[42px] w-full rounded-control border border-border bg-card px-3.5 text-sm text-ink placeholder:text-ink-muted/60 outline-none transition-all hover:border-ink-muted/40 focus:border-primary focus:ring-[3px] focus:ring-primary/15 ${
              isPassword ? "pe-11" : ""
            } ${error ? "border-danger focus:border-danger focus:ring-danger/15" : ""} ${className}`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-ink-muted hover:text-ink"
              aria-label={revealed ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {revealed ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>

        {error ? (
          <p id={errorId} className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-sm text-ink-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = "TextField";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 5.2C11.05 5.07 11.52 5 12 5c6.5 0 10 7 10 7-.6 1.1-1.6 2.5-3 3.8M6.5 6.5C4 8.2 2 12 2 12s3.5 7 10 7c1.3 0 2.5-.27 3.6-.7M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
