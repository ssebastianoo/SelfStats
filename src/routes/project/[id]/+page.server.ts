import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	if (/^\d+$/.test(params.id) === false) {
		throw error(404, 'Not found');
	}

	return {
		project_id: parseInt(params.id)
	};
}) satisfies PageServerLoad;
