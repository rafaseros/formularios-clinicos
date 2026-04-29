import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { getUserFromSession } from '$lib/server/auth';
import { buildPrintableHtml } from '$lib/server/print-html';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, cookies }) => {
	// Any logged-in user can fetch the raw manual HTML — it's the iframe content
	// of the manual visualizer. The "Imprimir manual" button is gated in the UI
	// by canPrintManuals, mirroring the form's print flow.
	const token = cookies.get('session');
	const user = getUserFromSession(token);
	if (!user) {
		throw error(401, 'Iniciá sesión.');
	}

	const manual = db
		.select()
		.from(schema.manualTemplates)
		.where(eq(schema.manualTemplates.formTemplateId, Number(params.id)))
		.get();

	if (!manual) {
		throw error(404, 'Manual no disponible para este formulario');
	}

	return new Response(buildPrintableHtml(manual), {
		headers: {
			'Content-Type': 'text/html; charset=utf-8'
		}
	});
};
