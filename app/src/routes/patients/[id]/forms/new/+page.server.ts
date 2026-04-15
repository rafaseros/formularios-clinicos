import { db, schema } from '$lib/server/db';
import { eq, asc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const patient = db
		.select({
			id: schema.patients.id,
			firstName: schema.patients.firstName,
			paternalLastName: schema.patients.paternalLastName,
			maternalLastName: schema.patients.maternalLastName
		})
		.from(schema.patients)
		.where(eq(schema.patients.id, Number(params.id)))
		.get();

	if (!patient) {
		throw error(404, 'Paciente no encontrado');
	}

	const templates = db
		.select({
			id: schema.formTemplates.id,
			code: schema.formTemplates.code,
			name: schema.formTemplates.name,
			description: schema.formTemplates.description,
			phase: schema.formTemplates.phase,
			phaseName: schema.formTemplates.phaseName,
			pageCount: schema.formTemplates.pageCount
		})
		.from(schema.formTemplates)
		.orderBy(asc(schema.formTemplates.phase), asc(schema.formTemplates.code))
		.all();

	return { patient, templates };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const patientId = Number(params.id);
		const data = await request.formData();
		const templateId = Number(data.get('templateId'));

		if (!templateId) {
			throw error(400, 'Seleccione un formulario');
		}

		const now = new Date().toISOString();
		const [inserted] = db
			.insert(schema.formInstances)
			.values({
				patientId,
				formTemplateId: templateId,
				status: 'draft',
				notes: '',
				createdAt: now,
				updatedAt: now
			})
			.returning({ id: schema.formInstances.id })
			.all();

		redirect(302, `/patients/${patientId}/forms/${inserted.id}`);
	}
};
