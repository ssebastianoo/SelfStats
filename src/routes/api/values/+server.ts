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

	const { data } = await supabase.from('values').upsert(json.values).select();

	if (!data) {
		return new Response('There was an error updating the value', { status: 500 });
	}

	return _json(data);
};
