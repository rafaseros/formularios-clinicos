import { db, schema } from '$lib/server/db';
import { eq, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const patient = db
		.select()
		.from(schema.patients)
		.where(eq(schema.patients.id, Number(params.id)))
		.get();

	if (!patient) {
		throw error(404, 'Paciente no encontrado');
	}

	const instances = db
		.select({
			id: schema.formInstances.id,
			status: schema.formInstances.status,
			notes: schema.formInstances.notes,
			createdAt: schema.formInstances.createdAt,
			updatedAt: schema.formInstances.updatedAt,
			templateId: schema.formTemplates.id,
			templateCode: schema.formTemplates.code,
			templateName: schema.formTemplates.name
		})
		.from(schema.formInstances)
		.innerJoin(schema.formTemplates, eq(schema.formInstances.formTemplateId, schema.formTemplates.id))
		.where(eq(schema.formInstances.patientId, patient.id))
		.orderBy(desc(schema.formInstances.createdAt))
		.all();

	return { patient, instances };
};
