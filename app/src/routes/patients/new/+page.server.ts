import { db, schema } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const docNumber = (data.get('docNumber') as string)?.trim();
		const firstName = (data.get('firstName') as string)?.trim();

		if (!docNumber) {
			return fail(422, { error: 'El número de C.I. es obligatorio.', values: Object.fromEntries(data) });
		}
		if (!firstName) {
			return fail(422, { error: 'El nombre es obligatorio.', values: Object.fromEntries(data) });
		}

		const now = new Date().toISOString();

		const [inserted] = db
			.insert(schema.patients)
			.values({
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
				status: ((data.get('status') as string) ?? 'active') as 'active' | 'discharged' | 'transferred',
				createdAt: now,
				updatedAt: now
			})
			.returning({ id: schema.patients.id })
			.all();

		redirect(302, `/patients/${inserted.id}`);
	}
};
