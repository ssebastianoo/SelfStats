import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { ProjectT } from '$lib/types';
import jwt from 'jsonwebtoken';

export const load = (async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		throw error(401, 'Unauthorized');
	}

	const userData = jwt.decode(token) as { sub: string } | null;
	if (!userData) {
		throw error(401, 'Unauthorized');
	}

	const userId = userData.sub;

	let project: ProjectT;

	const { data: projectData } = await supabase
		.from('projects')
		.select('*')
		.eq('user_id', userId)
		.eq('id', params.id);

	const { data: descriptorsData } = await supabase
		.from('descriptors')
		.select('*')
		.eq('project_id', params.id);

	const { data: datasData } = await supabase.from('data').select('*').eq('project_id', params.id);
	const { data: valuesData } = await supabase
		.from('values')
		.select('*')
		.eq('project_id', params.id);

	if (projectData && projectData.length > 0) {
		project = { ...projectData[0], descriptors: descriptorsData };

		if (datasData) {
			project.data = datasData;

			if (valuesData) {
				for (const value of valuesData) {
					const linkedData = project.data.find((data) => data.id === value.data_id);
					if (linkedData) {
						if (!linkedData.values) linkedData.values = [];
						linkedData.values.push(value);
					}
				}
			}
		}
	} else {
		throw error(404, 'Project not found');
	}

	return {
		project
	};
}) satisfies PageServerLoad;
