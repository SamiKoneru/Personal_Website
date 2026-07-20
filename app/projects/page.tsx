import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { categories, categoryColor, projects } from "@/data/projects";

export const metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <main className="space-y-20 md:space-y-24">
      <header className="space-y-5 animate-fade-in-up">
        <h1 className="gradient-text pb-2 text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
          Projects
        </h1>
        <div className="accent-bar" />
        <p className="max-w-2xl text-lg text-[color:var(--muted)] sm:text-xl">
          A selection of things I&apos;ve built. Most live on{" "}
          <a
            href="https://github.com/SamiKoneru"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-[color:var(--foreground)]"
          >
            GitHub
          </a>
          .
        </p>
      </header>

      {categories.map((category) => {
        const items = projects.filter((p) => p.category === category);
        if (items.length === 0) return null;
        return (
          <Reveal key={category}>
            <section className="space-y-8">
              <h2 className="flex items-center border-b border-[color:var(--border)] pb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                <span
                  className="cat-dot"
                  style={{
                    ["--cat-color" as string]: categoryColor[category],
                  }}
                />
                {category}
                <span className="ml-2 text-[color:var(--muted)]/60">
                  {items.length}
                </span>
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p, i) => (
                  <Reveal key={p.slug} delay={i * 80}>
                    <ProjectCard project={p} />
                  </Reveal>
                ))}
              </div>
            </section>
          </Reveal>
        );
      })}
    </main>
  );
}
