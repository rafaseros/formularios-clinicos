import { generatePdfFromHtml } from '$lib/server/pdf';
import { buildPrintableHtml } from '$lib/server/print-html';
import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { getUserFromSession } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('session');
	const user = getUserFromSession(token);
	if (!user || (!user.canPrintManuals && user.role !== 'admin')) {
		throw error(403, 'No tenés permisos para descargar el manual.');
	}

	const manual = db
		.select()
		.from(schema.manualTemplates)
		.where(eq(schema.manualTemplates.formTemplateId, Number(params.id)))
		.get();

	if (!manual) throw error(404, 'Manual no disponible para este formulario');

	const pageConfig = manual.pageConfig as {
		orientation: string;
		size: string;
		margins: { top: string; right: string; bottom: string; left: string };
	};

	const html = buildPrintableHtml(manual);
	const pdf = await generatePdfFromHtml(html, pageConfig);

	const filename = `${manual.code}-${manual.name}.pdf`;
	// Per RFC 5987: ASCII fallback + UTF-8 encoded for non-ASCII chars (e.g. em-dash).
	const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_');
	const encoded = encodeURIComponent(filename);

	return new Response(pdf, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`
		}
	});
};
