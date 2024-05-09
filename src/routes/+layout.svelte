<script lang="ts">
	import '@fontsource-variable/inter';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { Toaster } from '$lib/components/ui/sonner';
	import { Button } from '$lib/components/ui/button';
	import { user } from '$lib/store';
	import { getCookie, setCookie } from '$lib/utils';
	import './app.css';

	let logged = false;

	onMount(async () => {
		if (!$user) {
			const { data } = await supabase.auth.getUser();

			if (data.user) {
				const token = getCookie('token');
				if (!token) {
					const { data: sessionData, error } = await supabase.auth.getSession();

					if (sessionData.session) {
						setCookie('token', sessionData.session.access_token, 7);
					} else {
						throw new Error("Couldn't log in");
					}
				}
				$user = data.user;
				logged = true;
			}
		} else {
			logged = true;
		}
	});

	function login() {
		supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				queryParams: {
					access_type: 'offline',
					prompt: 'consent'
				},
				redirectTo: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : undefined
			}
		});
	}
</script>

<Toaster />

{#if logged}
	<main class="p-7">
		<header class="text-right mb-4">
			<Button
				on:click={() => {
					supabase.auth.signOut();
					location.reload();
				}}>Logout</Button
			>
		</header>
		<div>
			<slot />
		</div>
	</main>
{:else}
	<div class="flex justify-center items-center h-[var(--fh)]">
		<Button on:click={login}>Login</Button>
	</div>
{/if}
