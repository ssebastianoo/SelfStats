import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { ProjectT } from '$lib/types';
import jwt from 'jsonwebtoken';

export const load = (async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		throw error(401, 'Unauthorized');
	}

	const userData = jwt.decode(token) as { sub: string } | null;
	if (!userData) {
		throw error(401, 'Unauthorized');
	}

	const userId = userData.sub;

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
