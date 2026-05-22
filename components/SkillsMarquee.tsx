import type { Skill } from "@/data/profile";
import { profile } from "@/data/profile";

const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/";

function SkillChip({ skill }: { skill: Skill }) {
  return (
    <span className="skill-chip">
      {skill.icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${DEVICON}${skill.icon}.svg`}
          alt=""
          aria-hidden
          loading="lazy"
          className={`h-5 w-5 ${skill.invertOnDark ? "dark:invert" : ""}`}
        />
      )}
      {skill.name}
    </span>
  );
}

export function SkillsMarquee() {
  const items = profile.skills;
  return (
    <div className="marquee" aria-label="Skills and tools">
      <div className="marquee-track">
        {items.map((s) => (
          <SkillChip key={s.name} skill={s} />
        ))}
      </div>
      <div className="marquee-track" aria-hidden="true">
        {items.map((s) => (
          <SkillChip key={`dup-${s.name}`} skill={s} />
        ))}
      </div>
    </div>
  );
}
