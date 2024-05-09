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

	if (!data.name || !data.type || !data.project_id) {
		return new Response('Missing fields', { status: 400 });
	}

	const { data: result } = await supabase
		.from('descriptors')
		.insert([
			{
				name: data.name,
				description: data.description,
				type: data.type,
				project_id: data.project_id
			}
		])
		.select();

	if (result) {
		return json(result[0]);
	} else {
		return new Response('There was an error creating the descriptor', { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ cookies, request }) => {
	const { user } = getUser(cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const data = await request.json();

	if (!data.descriptors) {
		return new Response('Missing fields', { status: 400 });
	}

	const { data: result } = await supabase.from('descriptors').upsert(data.descriptors).select();

	if (result) {
		return json(result);
	} else {
		return new Response('There was an error creating the descriptor', { status: 500 });
	}
};
