"use client";

import { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

type TagInputProps = {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  hint?: string;
  placeholder?: string;
  addLabel: string;
  removeLabel: (value: string) => string;
};

/**
 * Free-form list editor for health_conditions / allergies /
 * food_preferences (PRD F-3) — open-ended medical/lifestyle terms, not a
 * fixed enum, so a plain add/remove chip list rather than a multi-select.
 */
export function TagInput({
  label,
  value,
  onChange,
  hint,
  placeholder,
  addLabel,
  removeLabel,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (trimmed === "" || value.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
  }

  function remove(tag: string) {
    onChange(value.filter((v) => v !== tag));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 ps-3 pe-2 py-1 text-sm text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={removeLabel(tag)}
                className="rounded-full p-0.5 hover:bg-primary/15"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-10 flex-1 rounded-control border border-border bg-card px-3.5 text-sm text-ink placeholder:text-ink-muted/60 outline-none transition-colors focus:border-primary focus:ring-[3px] focus:ring-primary/15"
        />
        <Button type="button" variant="secondary" onClick={commit} className="shrink-0">
          {addLabel}
        </Button>
      </div>

      {hint && <p className="text-sm text-ink-muted">{hint}</p>}
    </div>
  );
}
