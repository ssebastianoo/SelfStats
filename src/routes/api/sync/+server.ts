import type { RequestHandler } from './$types';
import fs from 'fs/promises';

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();

	if (!session || !session.user) {
		return new Response(null, { status: 401 });
	}

	let data: string;

	try {
		data = await fs.readFile('./src/user-data/' + session.user.email + '.txt', {
			encoding: 'utf8'
		});
	} catch {
		return new Response(null, { status: 404 });
	}

	return new Response(data);
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();

	if (!session || !session.user) {
		return new Response(null, { status: 401 });
	}

	const data = await request.text();

	await fs.writeFile('./src/user-data/' + session.user.email + '.txt', data);
	return new Response();
};
