import fs from "node:fs";
import path from "node:path";
import { Reveal } from "@/components/Reveal";

export const metadata = {
  title: "Notes",
};

type Note = { title: string; description?: string; href: string };

// "how-the-brain-works" -> "How The Brain Works"
function prettifySlug(slug: string) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// Collapse whitespace and swap any em/en dash for the site's middot separator,
// so parsed titles stay clean and dash-free.
function normalizeTitle(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/\s*[—–]\s*/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMatch(src: string, re: RegExp) {
  const m = src.match(re);
  return m ? m[1].trim() : undefined;
}

// Next.js note routes: app/notes/<slug>/page.tsx -> /notes/<slug>
function readAppNotes(): Note[] {
  const dir = path.join(process.cwd(), "app", "notes");
  let dirents: fs.Dirent[] = [];
  try {
    dirents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const notes: Note[] = [];
  for (const d of dirents) {
    if (!d.isDirectory()) continue;
    const pagePath = path.join(dir, d.name, "page.tsx");
    if (!fs.existsSync(pagePath)) continue;
    const src = fs.readFileSync(pagePath, "utf8");
    const title = firstMatch(src, /title:\s*["'`]([^"'`]+)["'`]/);
    const description = firstMatch(src, /description:\s*["'`]([^"'`]+)["'`]/);
    notes.push({
      title: title ? normalizeTitle(title) : prettifySlug(d.name),
      description,
      href: `/notes/${d.name}`,
    });
  }
  return notes;
}

// Static note folders: public/notes/<slug>/index.html -> /notes/<slug>/
function readStaticNotes(): Note[] {
  const dir = path.join(process.cwd(), "public", "notes");
  let dirents: fs.Dirent[] = [];
  try {
    dirents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const notes: Note[] = [];
  for (const d of dirents) {
    if (!d.isDirectory()) continue;
    const htmlPath = path.join(dir, d.name, "index.html");
    if (!fs.existsSync(htmlPath)) continue;
    const src = fs.readFileSync(htmlPath, "utf8");
    const title = firstMatch(src, /<title>([\s\S]*?)<\/title>/i);
    const description = firstMatch(
      src,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
    );
    notes.push({
      title: title ? normalizeTitle(title) : prettifySlug(d.name),
      description: description ? normalizeTitle(description) : undefined,
      // Point at the file directly: `next dev` won't resolve the bare
      // directory to index.html, though Vercel would.
      href: `/notes/${d.name}/index.html`,
    });
  }
  return notes;
}

export default function NotesIndex() {
  const notes = [...readAppNotes(), ...readStaticNotes()].sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  return (
    <main className="space-y-10">
      <header className="space-y-4">
        <h1 className="gradient-text pb-2 text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
          Notes
        </h1>
        <div className="accent-bar" />
        <p className="max-w-2xl text-lg text-[color:var(--muted)] sm:text-xl">
          Working notes and write-ups. Not linked from anywhere else on the
          site.
        </p>
      </header>

      {notes.length === 0 ? (
        <p className="text-[color:var(--muted)]">Nothing here yet.</p>
      ) : (
        <div className="grid gap-4">
          {notes.map((n, i) => (
            <Reveal key={n.href} delay={i * 60}>
              <a
                href={n.href}
                className="card-hover group block rounded-xl border border-[color:var(--border)] bg-[color:var(--background)]/40 p-6 backdrop-blur-sm hover:border-[color:var(--accent)]"
              >
                <h2 className="text-lg font-medium group-hover:text-[color:var(--accent)]">
                  {n.title}
                </h2>
                {n.description && (
                  <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--muted)]">
                    {n.description}
                  </p>
                )}
              </a>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
