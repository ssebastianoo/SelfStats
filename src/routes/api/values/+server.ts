import type { RequestHandler } from './$types';
import { getUser } from '$lib/server/utils';
import { supabase } from '$lib/server/supabase';
import { json as _json } from '@sveltejs/kit';
import type { ValueT, DataT } from '$lib/types';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const { user } = getUser(cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const json = await request.json();

	if (!json.project_id) {
		return new Response('Missing fields', { status: 400 });
	}

	const { data: projectData } = await supabase.from('projects').select().eq('id', json.project_id);
	if (!projectData) {
		return new Response('Project not found', { status: 404 });
	}

	if (projectData[0].user_id !== user.sub) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { data } = await supabase
		.from('data')
		.insert({
			project_id: json.project_id
		})
		.select();

	if (!data) {
		return new Response('There was an error creating the data', { status: 500 });
	}

	const finalData = data[0] as DataT;

	if (!json.values) {
		finalData.values = [];

		return _json({
			data: finalData
		});
	}

	let values = json.values as ValueT[];

	values = values.map((value) => {
		return {
			...value,
			data_id: data[0].id
		};
	});

	const { error: valuesError, data: valuesData } = await supabase
		.from('values')
		.insert(values)
		.select();

	if (valuesError) {
		return new Response('There was an error creating the values', { status: 500 });
	}

	finalData.values = valuesData;

	return _json({
		data: finalData
	});
};

export const PATCH: RequestHandler = async ({ cookies, request }) => {
	const { user } = getUser(cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const json = await request.json();

	if (!json.values) {
		return new Response('Missing fields', { status: 400 });
	}

	const { data: projectData } = await supabase
		.from('projects')
		.select()
		.eq('id', json.values[0].project_id)
		.eq('user_id', user.sub);
	if (!projectData) {
		return new Response('Project not found', { status: 404 });
	}

	for (const value of json.values) {
		if (value.project_id !== projectData[0].id) {
			return new Response('Value does not belong to project', { status: 400 });
		}
	}

	const { data } = await supabase.from('values').upsert(json.values).select();

	if (!data) {
		return new Response('There was an error updating the value', { status: 500 });
	}

	if (json.data_id && json.date) {
		const { data: dataData } = await supabase
			.from('data')
			.update({
				created_at: json.date
			})
			.eq('id', json.data_id)
			.eq('project_id', projectData[0].id)
			.select();

		if (!dataData) {
			return new Response('There was an error updating the date', { status: 500 });
		}
	}

	return _json(data);
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

	const { error: error1 } = await supabase.from('values').delete().eq('data_id', json.id);
	const { error: error2 } = await supabase.from('data').delete().eq('id', json.id);

	if (error1 || error2) {
		return new Response('There was an error deleting the value', { status: 500 });
	}

	return new Response('Value deleted', { status: 200 });
};
