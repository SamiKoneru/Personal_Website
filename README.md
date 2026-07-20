# personal_website

CV + project gallery built with Next.js 14 (App Router) and Tailwind. Deploys to Vercel.

## Local dev

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Editing content

- `data/profile.ts`: name, tagline, about, experience, education, skills, links.
- `data/projects.ts`: project cards. Set `featured: true` to surface a project on the home page. The `categories` array controls the section order on `/projects`.
- `app/page.tsx`: home/CV layout.
- `app/projects/page.tsx`: gallery layout.
- `app/globals.css`: colors (CSS variables, light + dark via `prefers-color-scheme`).

Drop a `public/resume.pdf` to make the Resume link work.

## Deploying to Vercel

1. Push this directory to a GitHub repo.
2. Go to vercel.com → "Add New Project" → import the repo.
3. Vercel auto-detects Next.js. Click Deploy.
4. You get a free `*.vercel.app` URL immediately. Add a custom domain in Project Settings → Domains once you've bought one.
