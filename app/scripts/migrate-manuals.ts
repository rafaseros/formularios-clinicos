import { load } from 'cheerio';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import Database from 'better-sqlite3';

// Support both local dev (../manuals) and Docker (/source/manuals)
const LOCAL_ROOT = resolve(import.meta.dirname, '..', '..');
const DOCKER_SOURCE = '/source';
const SOURCE_ROOT = existsSync(join(DOCKER_SOURCE, 'manuals')) ? DOCKER_SOURCE : LOCAL_ROOT;

const MANUALS_DIR = join(SOURCE_ROOT, 'manuals');
const CSS_PATH = join(SOURCE_ROOT, 'css', 'common.css');
const LOGO_PATH = join(SOURCE_ROOT, 'logo.png');
const DB_PATH = resolve(import.meta.dirname, '..', 'data', 'forms.db');

const dataDir = resolve(import.meta.dirname, '..', 'data');
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

// Map manual filename to its corresponding form code.
function filenameToFormCode(filename: string): string {
  const base = filename.replace('.html', '');

  // guia-rapida-004-legal → PGB-F004-LEGAL
  const legalMatch = base.match(/^guia-rapida-(\d+)-legal$/);
  if (legalMatch) {
    return `PGB-F${legalMatch[1]}-LEGAL`;
  }

  // manual-014a → PGB-F014-A
  // manual-001 → PGB-F001
  const stdMatch = base.match(/^manual-(\d+)([a-d])?$/);
  if (stdMatch) {
    const num = stdMatch[1];
    const suffix = stdMatch[2] ? `-${stdMatch[2].toUpperCase()}` : '';
    return `PGB-F${num}${suffix}`;
  }

  throw new Error(`Cannot parse manual filename: ${filename}`);
}

function parsePageConfig(cssText: string): {
  orientation: 'portrait' | 'landscape';
  size: string;
  margins: { top: string; right: string; bottom: string; left: string };
} {
  const defaults = {
    orientation: 'portrait' as const,
    size: 'Letter',
    margins: { top: '2.5cm', right: '2.5cm', bottom: '2.5cm', left: '3.0cm' },
  };

  const pageMatch = cssText.match(/@page\s*\{([^}]+)\}/);
  if (!pageMatch) return defaults;

  const pageBlock = pageMatch[1];

  const sizeMatch = pageBlock.match(/size:\s*([^;]+);/);
  if (sizeMatch && sizeMatch[1].includes('landscape')) {
    defaults.orientation = 'landscape';
  }

  const marginMatch = pageBlock.match(/margin:\s*([^;]+);/);
  if (marginMatch) {
    const parts = marginMatch[1].trim().split(/\s+/);
    if (parts.length === 4) {
      defaults.margins = { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    } else if (parts.length === 2) {
      defaults.margins = { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
    }
  }

  return defaults;
}

function countPages(htmlBody: string): number {
  const pageBreaks = (htmlBody.match(/page-break/g) || []).length;
  return Math.max(1, pageBreaks + 1);
}

// Extract version from HTML content.
// Accepts both "v1.1" and "Versión 1.1" formats.
// Throws if no version is found — migration must fail loud, not silently.
function extractVersion(html: string, filename: string): { version: string; versionMajor: number; versionMinor: number } {
  const match = html.match(/v(\d+)\.(\d+)|Versi[oó]n\s+(\d+)\.(\d+)/i);
  if (!match) throw new Error(`No version found in ${filename}`);
  // Groups 1,2 are for "vN.N"; groups 3,4 for "Versión N.N"
  const major = parseInt(match[1] ?? match[3], 10);
  const minor = parseInt(match[2] ?? match[4], 10);
  return { version: `${major}.${minor}`, versionMajor: major, versionMinor: minor };
}

async function main() {
  console.log('=== Manuals Migration Script ===\n');

  const commonCss = readFileSync(CSS_PATH, 'utf-8');
  console.log(`✓ Read common.css (${commonCss.length} bytes)`);

  const logoBuffer = readFileSync(LOGO_PATH);
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  console.log(`✓ Read logo.png → base64 (${logoBase64.length} chars)`);

  const files = readdirSync(MANUALS_DIR).filter((f) => f.endsWith('.html')).sort();
  console.log(`\nFound ${files.length} manual files\n`);

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Lookup form by (code, versionMajor, versionMinor) — lockstep enforcement.
  const lookupForm = db.prepare(
    `SELECT id, name, version FROM form_templates WHERE code = ? AND version_major = ? AND version_minor = ? LIMIT 1`
  );

  const upsert = db.prepare(`
    INSERT INTO manual_templates (form_template_id, code, name, version, version_major, version_minor, html_body, inline_css, common_css, logo_base64, page_config, page_count, created_at, updated_at)
    VALUES (@formTemplateId, @code, @name, @version, @versionMajor, @versionMinor, @htmlBody, @inlineCss, @commonCss, @logoBase64, @pageConfig, @pageCount, @createdAt, @updatedAt)
    ON CONFLICT(form_template_id, version_major, version_minor) DO UPDATE SET
      code = @code,
      name = @name,
      version = @version,
      html_body = @htmlBody,
      inline_css = @inlineCss,
      common_css = @commonCss,
      logo_base64 = @logoBase64,
      page_config = @pageConfig,
      page_count = @pageCount,
      updated_at = @updatedAt
  `);

  let success = 0;
  const errors: string[] = [];

  for (const file of files) {
    try {
      const filePath = join(MANUALS_DIR, file);
      const html = readFileSync(filePath, 'utf-8');
      const $ = load(html);

      const formCode = filenameToFormCode(file);

      // Extract version from manual HTML — throws if not found (fail loud)
      const { version, versionMajor, versionMinor } = extractVersion(html, file);

      // Lookup matching form by (code, major, minor) — lockstep enforcement
      const form = lookupForm.get(formCode, versionMajor, versionMinor) as
        | { id: number; name: string; version: string }
        | undefined;

      if (!form) {
        throw new Error(
          `No matching form_template found for code "${formCode}" at version ${version}. ` +
          `Run migrate:forms first and ensure the form exists at this version.`
        );
      }

      let inlineCss = '';
      $('style').each((_, el) => {
        inlineCss += $(el).html() || '';
      });

      let htmlBody = $('body').html() || '';
      htmlBody = htmlBody.replace(/src="\.\.\/logo\.png"/g, `src="${logoBase64}"`);
      htmlBody = htmlBody.replace(/src='\.\.\/logo\.png'/g, `src='${logoBase64}'`);

      const pageConfig = parsePageConfig(inlineCss);
      const pageCount = countPages(htmlBody);
      const now = new Date().toISOString();

      // Manual code = "MAN-<formCode>" so we keep something searchable, but the
      // real linkage is the FK form_template_id.
      const manualCode = `MAN-${formCode}`;

      // Manual name mirrors the form name with prefix.
      const manualName = `Manual de Llenado — ${form.name}`;

      upsert.run({
        formTemplateId: form.id,
        code: manualCode,
        name: manualName,
        version,
        versionMajor,
        versionMinor,
        htmlBody,
        inlineCss,
        commonCss,
        logoBase64,
        pageConfig: JSON.stringify(pageConfig),
        pageCount,
        createdAt: now,
        updatedAt: now,
      });

      console.log(`✓ ${file} → ${formCode} v${version} (form id=${form.id}, ${pageCount}p, ${pageConfig.orientation})`);
      success++;
    } catch (err) {
      const msg = `${file}: ${(err as Error).message}`;
      console.error(`✗ ${msg}`);
      errors.push(msg);
    }
  }

  // Integrity check: every form_template row must have exactly one manual_template
  // row at the same version (matched by form_template_id + version_major + version_minor).
  const orphans = db
    .prepare(
      `SELECT f.id, f.code, f.version, f.version_major, f.version_minor
       FROM form_templates f
       LEFT JOIN manual_templates m
         ON m.form_template_id = f.id
         AND m.version_major = f.version_major
         AND m.version_minor = f.version_minor
       WHERE m.id IS NULL
       ORDER BY f.code`
    )
    .all() as Array<{ id: number; code: string; version: string; version_major: number; version_minor: number }>;

  console.log(`\n=== Migration Summary ===`);
  console.log(`Loaded: ${success}`);
  console.log(`Errors: ${errors.length}`);

  if (orphans.length > 0) {
    console.error(`\n✗ INTEGRITY FAILURE: forms without a matching manual:`);
    for (const o of orphans) console.error(`  - ${o.code} v${o.version} (id=${o.id}, major=${o.version_major}, minor=${o.version_minor})`);
    db.close();
    process.exit(1);
  }

  if (errors.length > 0) {
    console.error(`\n✗ Errors during migration:`);
    for (const e of errors) console.error(`  - ${e}`);
    db.close();
    process.exit(1);
  }

  console.log(`\n✓ All forms have a manual. Migration complete.`);
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
