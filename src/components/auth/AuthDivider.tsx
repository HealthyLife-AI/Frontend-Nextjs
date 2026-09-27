/** "— or continue with e-mail —" separator between the Google button and the form. */
export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium text-ink-muted" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" aria-hidden="true" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" aria-hidden="true" />
    </div>
  );
}
