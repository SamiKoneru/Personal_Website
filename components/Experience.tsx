import type { Job } from "@/data/profile";

function initials(name: string) {
  return name
    .replace(/[^A-Za-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CompanyLogo({ job }: { job: Job }) {
  if (job.logo) {
    return (
      <div
        className="logo-tile flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-lg sm:h-[72px] sm:w-[72px]"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={job.logo}
          alt={`${job.company} logo`}
          className="h-full w-full object-contain"
          style={
            job.logoScale ? { transform: `scale(${job.logoScale})` } : undefined
          }
        />
      </div>
    );
  }

  const bg =
    job.color || "linear-gradient(135deg, var(--accent), var(--accent-2))";
  return (
    <div
      className="logo-tile flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white shadow-lg sm:h-[72px] sm:w-[72px] sm:text-lg"
      style={{ background: bg }}
      aria-hidden
    >
      {initials(job.company)}
    </div>
  );
}

export function ExperienceItem({ job }: { job: Job }) {
  return (
    <article className="card-hover flex gap-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)]/40 p-6 backdrop-blur-sm sm:gap-6 sm:p-8">
      <CompanyLogo job={job} />
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div>
            <div className="text-lg font-medium sm:text-xl">{job.role}</div>
            <div className="text-base text-[color:var(--muted)]">
              {job.company}
              {job.location ? (
                <span className="opacity-60"> · {job.location}</span>
              ) : null}
            </div>
          </div>
          <div className="text-xs uppercase tracking-wider text-[color:var(--muted)] sm:text-sm">
            {job.period}
          </div>
        </div>
        {job.description && (
          <p className="text-base leading-relaxed text-[color:var(--muted)]">
            {job.description}
          </p>
        )}
        {job.bullets && job.bullets.length > 0 && (
          <ul className="space-y-2 pt-1">
            {job.bullets.map((b, i) => (
              <li
                key={i}
                className="flex gap-3 text-[15px] leading-relaxed text-[color:var(--muted)] sm:text-base"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent), var(--accent-2))",
                  }}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        {job.tech && job.tech.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {job.tech.map((t) => (
              <span
                key={t}
                className="rounded border border-[color:var(--border)] px-2 py-0.5 text-xs uppercase tracking-wide text-[color:var(--muted)]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
