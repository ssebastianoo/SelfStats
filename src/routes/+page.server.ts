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

	let projects: ProjectT[] = [];

	const { data } = await supabase.from('projects').select('*').eq('user_id', userId);
	if (data) {
		projects = data.map((project) => {
			return {
				...project,
				descriptors: [],
				data: [],
				values: []
			};
		});
	}

	return {
		projects
	};
}) satisfies PageServerLoad;
