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

	const { data: projectData } = await supabase.from('projects').select().eq('id', data.project_id);
	if (!projectData) {
		return new Response('Project not found', { status: 404 });
	}

	if (projectData[0].user_id !== user.sub) {
		return new Response('Unauthorized', { status: 401 });
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

	const { data: projectData } = await supabase
		.from('projects')
		.select()
		.eq('id', data.descriptors[0].project_id);
	if (!projectData) {
		return new Response('Invalid descriptor', { status: 404 });
	}

	for (const descriptor of data.descriptors) {
		if (descriptor.project_id !== projectData[0].id) {
			return new Response('Unauthorized', { status: 401 });
		}
	}

	const { data: result } = await supabase.from('descriptors').upsert(data.descriptors).select();

	if (result) {
		return json(result);
	} else {
		return new Response('There was an error creating the descriptor', { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ cookies, request }) => {
	const { user } = getUser(cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const data = await request.json();

	if (!data.id) {
		return new Response('Missing fields', { status: 400 });
	}

	const { data: descriptor } = await supabase.from('descriptors').select().eq('id', data.id);
	if (!descriptor) {
		return new Response('Descriptor not found', { status: 404 });
	}

	const { data: projectData } = await supabase
		.from('projects')
		.select()
		.eq('id', descriptor[0].project_id);
	if (!projectData) {
		return new Response('Project not found', { status: 404 });
	}

	if (projectData[0].user_id !== user.sub) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (projectData[0].user_id !== user.sub) {
		return new Response('Unauthorized', { status: 401 });
	}

	await supabase.from('values').delete().eq('descriptor_id', data.id);
	await supabase.from('descriptors').delete().eq('id', data.id);

	return new Response('Descriptor deleted', { status: 200 });
};
