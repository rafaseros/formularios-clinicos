import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const patient = db
		.select()
		.from(schema.patients)
		.where(eq(schema.patients.id, Number(params.id)))
		.get();

	if (!patient) {
		throw error(404, 'Paciente no encontrado');
	}

	return { patient };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = Number(params.id);
		const data = await request.formData();

		const docNumber = (data.get('docNumber') as string)?.trim();
		const firstName = (data.get('firstName') as string)?.trim();

		if (!docNumber) {
			return fail(422, { error: 'El número de C.I. es obligatorio.' });
		}
		if (!firstName) {
			return fail(422, { error: 'El nombre es obligatorio.' });
		}

		db
			.update(schema.patients)
			.set({
				docNumber,
				docExtension: (data.get('docExtension') as string)?.trim() ?? '',
				firstName,
				paternalLastName: (data.get('paternalLastName') as string)?.trim() ?? '',
				maternalLastName: (data.get('maternalLastName') as string)?.trim() ?? '',
				birthDate: (data.get('birthDate') as string) || null,
				gender: (data.get('gender') as 'M' | 'F') || null,
				phone: (data.get('phone') as string)?.trim() ?? '',
				address: (data.get('address') as string)?.trim() ?? '',
				city: (data.get('city') as string)?.trim() ?? '',
				clinicalRecordNumber: (data.get('clinicalRecordNumber') as string)?.trim() || null,
				status: (data.get('status') as 'active' | 'discharged' | 'transferred') ?? 'active',
				updatedAt: new Date().toISOString()
			})
			.where(eq(schema.patients.id, id))
			.run();

		redirect(302, `/patients/${id}`);
	}
};
