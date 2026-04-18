import { generatePdf } from '$lib/server/pdf';
import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { getUserFromSession } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, cookies }) => {
	const token = cookies.get('session');
	const user = getUserFromSession(token);
	if (!user || (!user.canPrint && user.role !== 'admin')) {
		throw error(403, 'No tenés permisos para descargar el PDF.');
	}

	const form = db
		.select()
		.from(schema.formTemplates)
		.where(eq(schema.formTemplates.id, Number(params.id)))
		.get();

	if (!form) throw error(404, 'Formulario no encontrado');

	const printUrl = `${url.origin}/forms/${form.id}/print`;
	const pageConfig = form.pageConfig as {
		orientation: string;
		size: string;
		margins: { top: string; right: string; bottom: string; left: string };
	};

	const pdf = await generatePdf(printUrl, pageConfig);

	const filename = `${form.code}-${form.name}.pdf`;

	return new Response(pdf, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="${filename}"`
		}
	});
};
