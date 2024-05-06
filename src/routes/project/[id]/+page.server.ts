import type { PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { ProjectT } from '$lib/types';
import { getUser } from '$lib/server/utils';

export const load = (async ({ params, cookies }) => {
	const { user, error: userError } = getUser(cookies);
	if (userError || !user) {
		throw error(401, userError);
	}

	const userId = user.sub;

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

export const actions = {
	addDescriptor: async ({ cookies, request }) => {
		const { user } = getUser(cookies);
		if (!user) {
			return error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const name = data.get('descriptor_name');
		const description = data.get('description');
		const type = data.get('type');
		const project_id = data.get('project_id');

		if (!name || !type || !project_id) {
			return fail(400, {
				message: 'Missing required fields'
			});
		}

		const { data: result } = await supabase
			.from('descriptors')
			.insert([{ name, description, type, project_id }])
			.select();

		if (result) {
			return { success: true, descriptor: result[0] };
		} else {
			return fail(500, {
				message: 'Missing required fields'
			});
		}
	}
};
