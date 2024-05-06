import jwt from 'jsonwebtoken';
import type { Cookies } from '@sveltejs/kit';

export function getUser(cookies: Cookies) {
	const token = cookies.get('token');

	if (!token) {
		return {
			user: null,
			error: 'Unauthorized'
		};
	}

	const user = jwt.decode(token) as { sub: string; email: string; session_id: string } | null;
	if (!user) {
		return {
			user: null,
			error: 'Unauthorized'
		};
	}

	return {
		user,
		error: null
	};
}
