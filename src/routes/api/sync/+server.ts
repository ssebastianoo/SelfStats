import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();

	if (!session || !session.user) {
		return new Response(null, { status: 401 });
	}

	let data: string;

	try {
		data = await fs.readFile('./src/user-data/' + session.user.email + '.json', {
			encoding: 'utf8'
		});
	} catch {
		console.log('No data found for user', session.user.email);
		return json({ projects: [] });
	}

	return json(JSON.parse(data));
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();

	if (!session || !session.user) {
		return new Response(null, { status: 401 });
	}

	const data = await request.json();

	await fs.writeFile(
		'./src/user-data/' + session.user.email + '.json',
		JSON.stringify({
			projects: data,
			lastUpdated: Date.now()
		})
	);
	return new Response();
};
