import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ locals }) => {
	db.run('CREATE TABLE IF NOT EXISTS data (email TEXT PRIMARY KEY, data BLOB)');
	const session = await locals.auth();

	if (!session || !session.user) {
		return new Response(null, { status: 401 });
	}

	const result = await db.get('SELECT data FROM data WHERE email = ?', session.user.email);

	if (!result) return new Response(null, { status: 404 });
	return new Response(result.data as string);
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();

	if (!session || !session.user) {
		return new Response(null, { status: 401 });
	}

	const data = await request.text();

	await db.run('INSERT OR REPLACE INTO data (email, data) VALUES (?, ?)', [
		session.user.email,
		data
	]);

	return new Response();
};
