import type { Education } from "@/data/profile";
import { BerkeleyVisual } from "./BerkeleyVisual";

export function EducationCard({ edu }: { edu: Education }) {
  return (
    <article className="card-hover grid gap-6 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--background)]/40 p-6 backdrop-blur-sm sm:grid-cols-[240px_1fr] sm:gap-8 sm:p-8">
      <div className="edu-image-wrap">
        {edu.image ? (
          <div className="flex h-full w-full items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={edu.image}
              alt={`${edu.school} logo`}
              className="h-full w-full scale-100 object-cover"
            />
          </div>
        ) : (
          <BerkeleyVisual />
        )}
      </div>

      <div className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-xl font-medium tracking-tight sm:text-2xl">
            {edu.school}
          </h3>
          <p className="text-base text-[color:var(--muted)] sm:text-lg">
            {edu.degree}
            {edu.detail ? (
              <>
                {" "}
                ·{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent), var(--accent-2))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                  className="font-semibold"
                >
                  {edu.detail}
                </span>
              </>
            ) : null}
          </p>
        </div>

        {edu.coursework && edu.coursework.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Relevant coursework
            </h4>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {edu.coursework.map((c) => (
                <li
                  key={c}
                  className="flex items-baseline gap-2.5 text-[15px] text-[color:var(--foreground)] sm:text-base"
                >
                  <span
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--accent), var(--accent-2))",
                    }}
                  />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
