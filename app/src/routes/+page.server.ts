import { getLatestFormPerCode } from '$lib/server/db/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const forms = getLatestFormPerCode();

	// Group by phase
	const phases = new Map<number, { name: string; forms: typeof forms }>();
	for (const form of forms) {
		if (!phases.has(form.phase)) {
			phases.set(form.phase, { name: form.phaseName, forms: [] });
		}
		phases.get(form.phase)!.forms.push(form);
	}

	return {
		phases: Array.from(phases.entries()).map(([num, data]) => ({
			number: num,
			name: data.name,
			forms: data.forms
		}))
	};
};
