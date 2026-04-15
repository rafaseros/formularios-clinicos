import { load } from 'cheerio';
import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'fs';

const ROOT = resolve(import.meta.dirname, '..', '..');
const FORMS_DIR = join(ROOT, 'forms');
const CSS_PATH = join(ROOT, 'css', 'common.css');
const LOGO_PATH = join(ROOT, 'logo.png');
const DB_PATH = resolve(import.meta.dirname, '..', 'data', 'forms.db');

// Ensure data dir exists
const dataDir = resolve(import.meta.dirname, '..', 'data');
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

// Form metadata from index.html
const FORM_META: Record<string, { name: string; description: string; phase: number; phaseName: string }> = {
  'PGB-F001': { name: 'Hoja Frontal del Expediente', description: 'Carátula visible del expediente con identificación rápida', phase: 1, phaseName: 'INGRESO Y ADMINISTRATIVOS' },
  'PGB-F002': { name: 'Hoja de Ingreso', description: 'Registro administrativo de datos del paciente al ingreso (2 páginas)', phase: 1, phaseName: 'INGRESO Y ADMINISTRATIVOS' },
  'PGB-F003': { name: 'Datos Familiares', description: 'Información de la red de apoyo familiar del paciente', phase: 1, phaseName: 'INGRESO Y ADMINISTRATIVOS' },
  'PGB-F004': { name: 'Consentimiento Informado', description: 'Autorización legal para internación y tratamiento (2 páginas)', phase: 1, phaseName: 'INGRESO Y ADMINISTRATIVOS' },
  'PGB-F004-LEGAL': { name: 'Consentimiento Informado (Versión Legal)', description: 'Versión legal completa con cláusulas formales según contrato actual', phase: 1, phaseName: 'INGRESO Y ADMINISTRATIVOS' },
  'PGB-F005': { name: 'Contrato de Prestación de Servicios', description: 'Acuerdo legal bilateral para servicios de rehabilitación (2 páginas)', phase: 1, phaseName: 'INGRESO Y ADMINISTRATIVOS' },
  'PGB-F005-LEGAL': { name: 'Contrato de Prestación de Servicios (Versión Legal)', description: 'Versión legal completa con todas las cláusulas contractuales actuales', phase: 1, phaseName: 'INGRESO Y ADMINISTRATIVOS' },
  'PGB-F006': { name: 'Historia Clínica', description: 'Registro médico completo con énfasis en historia de consumo (4 páginas)', phase: 2, phaseName: 'MÉDICOS Y ENFERMERÍA' },
  'PGB-F007': { name: 'Nota de Ingreso Médica', description: 'Valoración médica inicial rápida al momento del ingreso (2 páginas)', phase: 2, phaseName: 'MÉDICOS Y ENFERMERÍA' },
  'PGB-F008': { name: 'Evaluación Psicofísica', description: 'Screening integral del estado físico y mental al ingreso (2 páginas)', phase: 2, phaseName: 'MÉDICOS Y ENFERMERÍA' },
  'PGB-F009': { name: 'Hoja de Signos Vitales', description: 'Monitoreo gráfico y tabular de signos vitales (1 página apaisada)', phase: 2, phaseName: 'MÉDICOS Y ENFERMERÍA' },
  'PGB-F010': { name: 'Kardex de Enfermería', description: 'Control de medicación y cuidados de enfermería (1 página)', phase: 2, phaseName: 'MÉDICOS Y ENFERMERÍA' },
  'PGB-F011': { name: 'Hoja de Medicamentos', description: 'Registro individual por medicamento con administraciones (1 página)', phase: 2, phaseName: 'MÉDICOS Y ENFERMERÍA' },
  'PGB-F012': { name: 'Receta Médica Archivada para Psicotrópicos', description: 'Prescripción de medicamentos psicotrópicos (Listas II, III, IV)', phase: 3, phaseName: 'PSICOTRÓPICOS Y EVOLUCIÓN' },
  'PGB-F013': { name: 'Libro de Control de Psicotrópicos', description: 'Control de movimientos de medicamentos psicotrópicos', phase: 3, phaseName: 'PSICOTRÓPICOS Y EVOLUCIÓN' },
  'PGB-F014-A': { name: 'Hojas de Evolución - Médica', description: 'Registro cronológico de la atención médica (Color Azul)', phase: 3, phaseName: 'PSICOTRÓPICOS Y EVOLUCIÓN' },
  'PGB-F014-B': { name: 'Hojas de Evolución - Enfermería', description: 'Reporte de enfermería por turno (Color Verde)', phase: 3, phaseName: 'PSICOTRÓPICOS Y EVOLUCIÓN' },
  'PGB-F014-C': { name: 'Hojas de Evolución - Psicología', description: 'Evolución psicológica individual (Color Púrpura)', phase: 3, phaseName: 'PSICOTRÓPICOS Y EVOLUCIÓN' },
  'PGB-F014-D': { name: 'Hojas de Evolución - Operativa', description: 'Psicología área operativa (Color Naranja)', phase: 3, phaseName: 'PSICOTRÓPICOS Y EVOLUCIÓN' },
  'PGB-F015': { name: 'Epicrisis / Nota de Egreso', description: 'Resumen del tratamiento al finalizar la internación (2 páginas)', phase: 4, phaseName: 'EGRESO Y DOCUMENTACIÓN' },
  'PGB-F016': { name: 'Informe Psicológico', description: 'Documentación de evaluación y evolución psicológica (2-3 páginas)', phase: 4, phaseName: 'EGRESO Y DOCUMENTACIÓN' },
};

// Map filename to code
function filenameToCode(filename: string): string {
  const base = filename.replace('.html', '');
  // formulario-004-legal → PGB-F004-LEGAL
  // formulario-014a → PGB-F014-A
  // formulario-001 → PGB-F001
  const match = base.match(/^formulario-(\d+)([a-d])?(-legal)?$/);
  if (!match) throw new Error(`Cannot parse filename: ${filename}`);
  const num = match[1];
  const suffix = match[2] ? `-${match[2].toUpperCase()}` : '';
  const legal = match[3] ? '-LEGAL' : '';
  return `PGB-F${num}${suffix}${legal}`;
}

// Parse @page rules from CSS text
function parsePageConfig(cssText: string, commonCss: string): {
  orientation: 'portrait' | 'landscape';
  size: string;
  margins: { top: string; right: string; bottom: string; left: string };
} {
  // Default from common.css
  const defaults = {
    orientation: 'portrait' as const,
    size: 'Letter',
    margins: { top: '2.5cm', right: '2.5cm', bottom: '2.5cm', left: '3.0cm' },
  };

  // Check inline CSS for @page override
  const pageMatch = cssText.match(/@page\s*\{([^}]+)\}/);
  if (!pageMatch) return defaults;

  const pageBlock = pageMatch[1];

  // Parse size
  const sizeMatch = pageBlock.match(/size:\s*([^;]+);/);
  if (sizeMatch) {
    const sizeVal = sizeMatch[1].trim();
    if (sizeVal.includes('landscape')) {
      defaults.orientation = 'landscape';
    }
  }

  // Parse margins
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

// Count pages
function countPages(htmlBody: string): number {
  const pageBreaks = (htmlBody.match(/page-break/g) || []).length;
  return Math.max(1, pageBreaks + 1);
}

async function main() {
  console.log('=== Forms Migration Script ===\n');

  // Read shared assets
  const commonCss = readFileSync(CSS_PATH, 'utf-8');
  console.log(`✓ Read common.css (${commonCss.length} bytes)`);

  const logoBuffer = readFileSync(LOGO_PATH);
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  console.log(`✓ Read logo.png → base64 (${logoBase64.length} chars)`);

  // Read form files
  const files = readdirSync(FORMS_DIR).filter(f => f.endsWith('.html')).sort();
  console.log(`\nFound ${files.length} form files\n`);

  // Open DB
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // We need a unique index for the upsert to work
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_form_templates_code_version ON form_templates(code, version)`);

  // Prepare upsert statement
  const upsert = db.prepare(`
    INSERT INTO form_templates (code, name, version, html_body, inline_css, common_css, logo_base64, page_config, phase, phase_name, description, page_count, created_at, updated_at)
    VALUES (@code, @name, @version, @htmlBody, @inlineCss, @commonCss, @logoBase64, @pageConfig, @phase, @phaseName, @description, @pageCount, @createdAt, @updatedAt)
    ON CONFLICT(code, version) DO UPDATE SET
      name = @name,
      html_body = @htmlBody,
      inline_css = @inlineCss,
      common_css = @commonCss,
      logo_base64 = @logoBase64,
      page_config = @pageConfig,
      phase = @phase,
      phase_name = @phaseName,
      description = @description,
      page_count = @pageCount,
      updated_at = @updatedAt
  `);

  let success = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const filePath = join(FORMS_DIR, file);
      const html = readFileSync(filePath, 'utf-8');
      const $ = load(html);

      // Extract code from filename
      const code = filenameToCode(file);
      const meta = FORM_META[code];
      if (!meta) {
        console.log(`⚠ No metadata for ${code} (${file}) — skipping`);
        failed++;
        continue;
      }

      // Extract inline CSS (from <style> blocks)
      let inlineCss = '';
      $('style').each((_, el) => {
        inlineCss += $(el).html() || '';
      });

      // Extract body innerHTML
      let htmlBody = $('body').html() || '';

      // Replace logo relative paths with base64
      htmlBody = htmlBody.replace(/src="\.\.\/logo\.png"/g, `src="${logoBase64}"`);
      htmlBody = htmlBody.replace(/src='\.\.\/logo\.png'/g, `src='${logoBase64}'`);

      // Parse page config
      const pageConfig = parsePageConfig(inlineCss, commonCss);

      // Count pages
      const pageCount = countPages(htmlBody);

      const now = new Date().toISOString();

      upsert.run({
        code,
        name: meta.name,
        version: 1,
        htmlBody,
        inlineCss,
        commonCss,
        logoBase64,
        pageConfig: JSON.stringify(pageConfig),
        phase: meta.phase,
        phaseName: meta.phaseName,
        description: meta.description,
        pageCount,
        createdAt: now,
        updatedAt: now,
      });

      console.log(`✓ ${code} — ${meta.name} (${pageCount}p, ${pageConfig.orientation})`);
      success++;
    } catch (err) {
      console.error(`✗ ${file}: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total in DB: ${db.prepare('SELECT COUNT(*) as count FROM form_templates').get()}`);

  db.close();
}

main().catch(console.error);
