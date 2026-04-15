import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const patientId = Number(params.id);
	const instanceId = Number(params.instanceId);

	const patient = db
		.select({
			id: schema.patients.id,
			firstName: schema.patients.firstName,
			paternalLastName: schema.patients.paternalLastName,
			maternalLastName: schema.patients.maternalLastName,
			docNumber: schema.patients.docNumber,
			docExtension: schema.patients.docExtension
		})
		.from(schema.patients)
		.where(eq(schema.patients.id, patientId))
		.get();

	if (!patient) {
		throw error(404, 'Paciente no encontrado');
	}

	const row = db
		.select({
			id: schema.formInstances.id,
			status: schema.formInstances.status,
			notes: schema.formInstances.notes,
			createdAt: schema.formInstances.createdAt,
			updatedAt: schema.formInstances.updatedAt,
			templateId: schema.formTemplates.id,
			templateCode: schema.formTemplates.code,
			templateName: schema.formTemplates.name,
			templateDescription: schema.formTemplates.description,
			pageConfig: schema.formTemplates.pageConfig
		})
		.from(schema.formInstances)
		.innerJoin(schema.formTemplates, eq(schema.formInstances.formTemplateId, schema.formTemplates.id))
		.where(eq(schema.formInstances.id, instanceId))
		.get();

	if (!row || row.id === null) {
		throw error(404, 'Formulario no encontrado');
	}

	return { patient, instance: row };
};

export const actions: Actions = {
	complete: async ({ params }) => {
		const instanceId = Number(params.instanceId);
		const patientId = Number(params.id);

		db
			.update(schema.formInstances)
			.set({ status: 'completed', updatedAt: new Date().toISOString() })
			.where(eq(schema.formInstances.id, instanceId))
			.run();

		redirect(302, `/patients/${patientId}/forms/${instanceId}`);
	},

	archive: async ({ params }) => {
		const instanceId = Number(params.instanceId);
		const patientId = Number(params.id);

		db
			.update(schema.formInstances)
			.set({ status: 'archived', updatedAt: new Date().toISOString() })
			.where(eq(schema.formInstances.id, instanceId))
			.run();

		redirect(302, `/patients/${patientId}/forms/${instanceId}`);
	}
};
