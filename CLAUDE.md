# Forms HTML — Proyecto Gilead Bolivia

## Project Structure
- `app/` — SvelteKit application (the main app)
- `forms/` — Original 21 HTML clinical forms (migration source, DO NOT DELETE)
- `manuals/` — Original 21 HTML manuals (migration source)
- `css/` — Original shared CSS (migration source)
- `_archive/` — Old prototypes (historical reference only)

## Stack
- SvelteKit with adapter-node (TypeScript)
- SQLite via better-sqlite3 + Drizzle ORM
- Puppeteer for PDF generation (Phase 1)

## Critical Constraints
- Form HTML/CSS structure in the database must produce IDENTICAL print output to the original .html files
- Print route `/forms/[id]/print` serves raw HTML — NO SvelteKit shell, NO JS bundles
- Letter-size visualizer uses iframe for CSS isolation
- Left margin 3.0cm is MANDATORY (SEDES archiver requirement)
- Forms comply with: D.S. 28562, R.M. 0090/2008, D.S. 25235, Ley 3131

## Commands
- `cd app && npm run dev` — Start dev server
- `cd app && npm run build` — Build for production
- `cd app && npx drizzle-kit generate` — Generate DB migrations
- `cd app && npx drizzle-kit migrate` — Run DB migrations
