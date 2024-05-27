<script lang="ts">
	import { getCookie, setCookie, deleteCookie } from '$lib/utils';
	import { Toaster } from '$lib/components/ui/sonner';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { supabase } from '$lib/supabase';
	import { Home, Loader } from 'lucide-svelte';
	import '@fontsource-variable/inter';
	import { page } from '$app/stores';
	import { user } from '$lib/store';
	import { onMount } from 'svelte';
	import './app.css';
	import { alert } from '$lib/store';

	let logged = false;
	let loaded = false;

	onMount(async () => {
		if (!$user) {
			const { data } = await supabase.auth.getUser();

			if (data.user) {
				const token = getCookie('token');
				if (!token) {
					const { data: sessionData } = await supabase.auth.getSession();

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
		loaded = true;
	});

	function login() {
		supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				queryParams: {
					access_type: 'offline',
					prompt: 'consent'
				},
				redirectTo: $page.url.origin + '/callback'
			}
		});
	}

	function logout() {
		deleteCookie('token');
		supabase.auth.signOut();
		location.reload();
	}

	let alertElement: HTMLDivElement;

	alert.subscribe((value) => {
		if (value.show) {
			alertElement.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], {
				duration: 900,
				easing: 'cubic-bezier(0.14, 0.62, 0.58, 1)',
				fill: 'forwards'
			});

			$alert.show = false;
			setTimeout(() => {
				alertElement.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }], {
					duration: 900,
					easing: 'cubic-bezier(0.14, 0.62, 0.58, 1)',
					fill: 'forwards'
				});
			}, 2000);
		}
	});
</script>

<Toaster />

<div
	bind:this={alertElement}
	class="translate-x-[100%] h-[var(--fh)] w-full fixed z-50 pointer-events-none"
>
	<Alert.Root
		class="fixed bottom-7 right-7 w-full max-w-72"
		variant={$alert.danger ? 'destructive' : 'default'}
	>
		<Alert.Title>{$alert.title}</Alert.Title>
		{#if $alert.description}
			<Alert.Description>{$alert.description}</Alert.Description>
		{/if}
	</Alert.Root>
</div>

{#if !loaded}
	<div class="flex justify-center items-center h-[var(--fh)]">
		<Loader />
	</div>
{:else if logged}
	<main class="p-7 flex justify-center">
		<div class="max-w-[800px] w-full">
			<header class="flex justify-between mb-4 items-center">
				<a href="/"><Home size="30" /></a>
				<Button variant="outline" size="sm" on:click={logout}>Logout</Button>
			</header>
			<div>
				<slot />
			</div>
		</div>
	</main>
{:else}
	<div class="flex justify-center items-center h-[var(--fh)]">
		<Button on:click={login}>Login</Button>
	</div>
{/if}
