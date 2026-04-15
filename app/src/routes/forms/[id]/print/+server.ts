import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const form = db
		.select()
		.from(schema.formTemplates)
		.where(eq(schema.formTemplates.id, Number(params.id)))
		.get();

	if (!form) {
		throw error(404, 'Formulario no encontrado');
	}

	const pageConfig = form.pageConfig as {
		orientation: string;
		size: string;
		margins: { top: string; right: string; bottom: string; left: string };
	};

	// Build the complete HTML document — identical to the original .html files
	const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${form.code} ${form.name}</title>
    <style>
${form.commonCss}
    </style>
    <style>
${form.inlineCss}
    </style>
</head>
<body>
${form.htmlBody}
</body>
</html>`;

	return new Response(html, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8'
		}
	});
};
