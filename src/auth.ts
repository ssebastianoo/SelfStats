import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import GitHub from '@auth/sveltekit/providers/github';
import type { Provider } from '@auth/sveltekit/providers';

const providers: Provider[] = [Google, GitHub];

export const providerMap = providers.map((provider) => {
	if (typeof provider === 'function') {
		const providerData = provider();
		return { id: providerData.id, name: providerData.name };
	} else {
		return { id: provider.id, name: provider.name };
	}
});

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers,
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		session({ session, token }) {
			session.user.id = token.id as string;
			return session;
		}
	},
	trustHost: true,
	pages: {
		signIn: '/login'
	}
});
