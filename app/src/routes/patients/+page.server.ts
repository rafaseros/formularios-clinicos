import { db, schema } from '$lib/server/db';
import { asc, like, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q') ?? '';

	let query = db
		.select({
			id: schema.patients.id,
			docNumber: schema.patients.docNumber,
			docExtension: schema.patients.docExtension,
			firstName: schema.patients.firstName,
			paternalLastName: schema.patients.paternalLastName,
			maternalLastName: schema.patients.maternalLastName,
			phone: schema.patients.phone,
			status: schema.patients.status,
			clinicalRecordNumber: schema.patients.clinicalRecordNumber
		})
		.from(schema.patients)
		.orderBy(
			asc(schema.patients.paternalLastName),
			asc(schema.patients.firstName)
		);

	const patients = search
		? query
				.where(
					or(
						like(schema.patients.docNumber, `%${search}%`),
						like(schema.patients.paternalLastName, `%${search}%`),
						like(schema.patients.firstName, `%${search}%`),
						like(schema.patients.maternalLastName, `%${search}%`)
					)
				)
				.all()
		: query.all();

	return { patients, search };
};
