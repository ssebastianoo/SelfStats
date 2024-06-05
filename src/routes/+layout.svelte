<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';
	import * as Alert from '$lib/components/ui/alert';
	import { Home, FileArchive } from 'lucide-svelte';
	import '@fontsource-variable/inter';
	import './app.css';
	import { alert } from '$lib/store';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getProjects, setProjects } from '$lib/utils';
	import { projects } from '$lib/store';

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

	function sync() {
		const projects = getProjects();

		fetch('/api/sync', {
			method: 'POST',
			body: JSON.stringify(projects)
		});
	}

	onMount(async () => {
		$projects = getProjects();

		const res = await fetch('/api/sync');
		const data = await res.json();

		setProjects(data, true);

		// setInterval(() => {
		// 	const projects = getProjects();
		// 	console.log('aaa');

		// 	fetch('/api/sync', {
		// 		method: 'POST',
		// 		body: JSON.stringify(projects)
		// 	});
		// }, 10000);
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

<main class="p-7 flex justify-center">
	<div class="max-w-[800px] w-full">
		<header class="flex justify-between mb-4 items-center">
			<a href="/"><Home size="30" /></a>
			{#if $page.data.session}
				<Button
					variant="outline"
					size="sm"
					on:click={() => {
						signOut();
					}}>Logout</Button
				>
			{:else}
				<Button
					variant="outline"
					size="sm"
					on:click={() => {
						signIn();
					}}>Login</Button
				>
			{/if}
			<a href="/data"><FileArchive size="30" /></a>
		</header>
		<div>
			<slot />
		</div>
	</div>
</main>
