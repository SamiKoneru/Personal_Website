import Link from "next/link";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { ArrowIcon, getLinkIcon, MailIcon } from "@/components/Icons";
import { NeuralVisual } from "@/components/NeuralVisual";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { ExperienceItem } from "@/components/Experience";
import { SkillsMarquee } from "@/components/SkillsMarquee";
import { EducationCard } from "@/components/EducationCard";

export default function Home() {
  const featured = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <main>
      {/* ============== INTRO ============== */}
      <section className="animate-fade-in-up">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_260px] md:gap-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--background)]/60 px-3.5 py-1.5 text-sm text-[color:var(--muted)] backdrop-blur-sm">
              <span className="pulse-dot" />
              {profile.status}
            </div>

            <h1 className="gradient-text text-6xl font-semibold tracking-tight sm:text-7xl md:text-7xl lg:text-8xl">
              {profile.name}
            </h1>

            <div className="accent-bar" />

            <p className="max-w-2xl text-2xl font-medium tracking-tight sm:text-3xl">
              {profile.tagline}
            </p>

            <p className="max-w-2xl text-base leading-relaxed text-[color:var(--muted)] sm:text-lg">
              {profile.about}
            </p>

            <div className="flex flex-wrap gap-x-7 gap-y-3 pt-3 text-base">
              {profile.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="link-underline text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                >
                  {getLinkIcon(l.label)}
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <NeuralVisual />
          </div>
        </div>

        <div className="mt-14">
          <SkillsMarquee />
        </div>
      </section>

      {/* ============== EDUCATION ============== */}
      <Reveal className="mt-24 md:mt-36">
        <Section title="Education">
          {profile.education.map((edu) => (
            <EducationCard key={edu.school} edu={edu} />
          ))}
        </Section>
      </Reveal>

      {/* ============== EXPERIENCE ============== */}
      <Reveal className="mt-24 md:mt-36">
        <Section title="Work experience">
          <div className="space-y-5">
            {profile.experience.map((job, i) => (
              <Reveal
                key={`${job.company}-${job.role}`}
                delay={i * 120}
              >
                <ExperienceItem job={job} />
              </Reveal>
            ))}
          </div>
        </Section>
      </Reveal>

      {/* ============== FEATURED PROJECTS ============== */}
      <Reveal className="mt-24 md:mt-36">
        <Section
          title="Featured projects"
          action={
            <Link
              href="/projects"
              className="link-underline text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)] sm:text-base"
            >
              View all projects
              <ArrowIcon />
            </Link>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={i * 120}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </Section>
      </Reveal>

      {/* ============== MISC: Currently + Beyond code ============== */}
      <Reveal className="mt-24 md:mt-36">
        <div className="grid gap-14 md:grid-cols-2 md:gap-16">
          <Section title="Currently">
            <ul className="space-y-5">
              {profile.currently.map((c, i) => (
                <Reveal key={c.label} delay={i * 100}>
                  <li className="flex items-baseline gap-4">
                    <span
                      className="inline-block w-32 flex-shrink-0 text-xs font-semibold uppercase tracking-[0.15em]"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--accent), var(--accent-2))",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {c.label}
                    </span>
                    <span className="text-base leading-relaxed sm:text-lg">
                      {c.value}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </Section>

          <Section title="Beyond code">
            <ul className="space-y-5">
              {profile.interests.map((it, i) => (
                <Reveal key={it.title} delay={i * 100}>
                  <li className="space-y-1">
                    <div className="text-base font-medium sm:text-lg">
                      {it.title}
                    </div>
                    {it.detail && (
                      <div className="text-[15px] leading-relaxed text-[color:var(--muted)] sm:text-base">
                        {it.detail}
                      </div>
                    )}
                  </li>
                </Reveal>
              ))}
            </ul>
          </Section>
        </div>
      </Reveal>

      {/* ============== CONTACT CTA ============== */}
      <Reveal className="mt-32 md:mt-44 lg:mt-48">
        <section className="contact-card relative overflow-hidden rounded-2xl border border-[color:var(--border)] p-10 sm:p-14">
          <div className="contact-shine" aria-hidden />
          <div className="relative space-y-5">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Get in touch
            </h2>
            <p className="max-w-xl text-base text-[color:var(--muted)] sm:text-lg">
              Always happy to chat about ML, RL, game engines, or anything
              you&apos;re building. Drop me a line and I&apos;ll get back to
              you.
            </p>
            <div className="space-y-3">
              <a
                href={`mailto:${profile.email}`}
                className="contact-button group inline-flex items-center gap-2.5 rounded-lg px-6 py-3 text-base font-medium text-white sm:text-lg"
              >
                <MailIcon size={18} />
                Email me
                <ArrowIcon size={16} />
              </a>
              <p className="text-sm break-all text-[color:var(--muted)]">
                or reach me at{" "}
                <a
                  href={`mailto:${profile.email}`}
                  className="link-underline text-[color:var(--foreground)]"
                >
                  {profile.email}
                </a>
              </p>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
