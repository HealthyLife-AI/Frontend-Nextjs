import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = "primary",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  tone?: "primary" | "accent";
}) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      <span
        className={`text-sm font-bold uppercase tracking-wider ${
          tone === "accent" ? "text-accent-active" : "text-primary"
        }`}
      >
        {eyebrow}
      </span>
      <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      <p className="mt-3 text-ink-muted">{subtitle}</p>
    </Reveal>
  );
}
