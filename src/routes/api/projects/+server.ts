import type { RequestHandler } from './$types';
import { getUser } from '$lib/server/utils';
import { supabase } from '$lib/server/supabase';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const { user } = getUser(cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const data = await request.json();

	if (!data.name) {
		return new Response('Missing fields', { status: 400 });
	}

	const { data: result } = await supabase
		.from('projects')
		.insert({
			name: data.name,
			description: data.description || null,
			project_id: data.project_id,
			user_id: user.sub
		})
		.select();

	if (result) {
		return json(result[0]);
	} else {
		return new Response('There was an error creating the project', { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ cookies, request }) => {
	const { user } = getUser(cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const data = await request.json();

	if (!data.name) {
		return new Response('Missing fields', { status: 400 });
	}

	const { data: result } = await supabase
		.from('projects')
		.update({
			name: data.name,
			description: data.description || null
		})
		.eq('id', data.project_id)
		.select();

	if (result) {
		return json(result[0]);
	} else {
		return new Response('There was an error editing the project', { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ cookies, request }) => {
	const { user } = getUser(cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const json = await request.json();
	if (!json.id) {
		return new Response('Missing fields', { status: 400 });
	}

	const { error: error1 } = await supabase.from('values').delete().eq('project_id', json.id);
	const { error: error2 } = await supabase.from('data').delete().eq('project_id', json.id);
	const { error: error3 } = await supabase.from('descriptors').delete().eq('project_id', json.id);
	const { error: error4 } = await supabase.from('projects').delete().eq('id', json.id);

	if (error1 || error2 || error3 || error4) {
		return new Response('There was an error deleting the project', { status: 500 });
	} else {
		return new Response('Project deleted', { status: 200 });
	}
};
