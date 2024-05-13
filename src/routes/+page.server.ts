import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { ProjectT } from '$lib/types';
import { getUser } from '$lib/server/utils';

export const load = (async ({ cookies }) => {
	const { user, error: userError } = getUser(cookies);

	if (userError || !user) {
		throw error(401, userError);
	}

	const userId = user.sub;

	const projects: ProjectT[] = [];

	const { data } = await supabase
		.from('projects')
		.select('*')
		.eq('user_id', userId)
		.order('created_at');
	if (data) {
		for (const project of data) {
			const _project = { ...project, descriptors: [], data: [], values: [] };
			projects.push(_project);
		}
	}

	return {
		projects
	};
}) satisfies PageServerLoad;
