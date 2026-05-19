import type { ReactNode } from "react";

export function Section({
  title,
  action,
  children,
  className = "",
  id,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`space-y-8 ${className}`}>
      <div className="flex items-baseline justify-between border-b border-[color:var(--border)] pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
