import type { CSSProperties } from "react";
import type { Project } from "@/data/projects";
import { categoryColor } from "@/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  const Wrapper = project.href ? "a" : "div";
  const wrapperProps = project.href
    ? {
        href: project.href,
        target: project.href.startsWith("http") ? "_blank" : undefined,
        rel: "noopener noreferrer",
      }
    : {};

  const style = {
    "--cat-color": categoryColor[project.category],
  } as CSSProperties;

  return (
    <Wrapper
      {...wrapperProps}
      style={style}
      className="card-hover group block h-full overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--background)]/40 p-6 backdrop-blur-sm"
    >
      <div className="cat-stripe" aria-hidden />
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-lg font-medium group-hover:text-[color:var(--cat-color)]">
          {project.name}
        </h3>
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--cat-color)" }}
        >
          {project.category}
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--muted)]">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded border border-[color:var(--border)] px-2 py-0.5 text-[11px] uppercase tracking-wide text-[color:var(--muted)]"
          >
            {s}
          </span>
        ))}
      </div>
    </Wrapper>
  );
}
