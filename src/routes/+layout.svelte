<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';
	import * as Alert from '$lib/components/ui/alert';
	import { Home, FileArchive, Menu, LogIn, LogOut, Code } from 'lucide-svelte';
	import '@fontsource-variable/inter';
	import './app.css';
	import { alert } from '$lib/store';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getProjects, setProjects } from '$lib/utils';
	import { projects } from '$lib/store';
	import type { ProjectT } from '$lib/types';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	let alertElement: HTMLDivElement;
	let loaded = false;

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
		if (navigator.onLine) {
			const projects = getProjects();

			fetch('/api/sync', {
				method: 'POST',
				body: JSON.stringify(projects)
			});
		}
	}

	onMount(async () => {
		$projects = getProjects();

		if ($page.data.session && navigator.onLine) {
			const res = await fetch('/api/sync');
			const data = (await res.json()) as { projects: ProjectT[]; lastUpdated: string | null };

			if (localStorage.getItem('lastUpdated')) {
				if (!data.lastUpdated) {
					sync();
					loaded = true;
					return;
				}

				const lastUpdated = new Date(localStorage.getItem('lastUpdated')!);
				const serverLastUpdated = new Date(data.lastUpdated);

				if (!localStorage.getItem('firstSync')) {
					localStorage.setItem('firstSync', 'true');

					for (const project of data.projects) {
						const check = $projects.find((p) => p.id === project.id);
						if (!check) {
							$projects = [...$projects, project];
						}
					}
					setProjects($projects);
					loaded = true;
					return;
				}

				if (serverLastUpdated > lastUpdated) {
					setProjects(data.projects, true);
				} else {
					sync();
				}
			} else {
				setProjects(data.projects, true);
			}
		}
		loaded = true;
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

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="outline" size="sm"><Menu /></Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						{#if $page.data.session?.user}
							<DropdownMenu.Label>{$page.data.session.user.email?.split('@')[0]}</DropdownMenu.Label
							>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								class="cursor-pointer"
								on:click={() => {
									localStorage.removeItem('firstSync');
									signOut();
								}}
								><LogOut class="mr-2 h-4 w-4" />
								<span>Logout</span></DropdownMenu.Item
							>
						{:else}
							<DropdownMenu.Item
								class="cursor-pointer"
								on:click={() => {
									signIn();
								}}
							>
								<LogIn class="mr-2 h-4 w-4" />
								<span>Login</span>
							</DropdownMenu.Item>
						{/if}
						<DropdownMenu.Item href="/data" class="cursor-pointer"
							><FileArchive class="mr-2 h-4 w-4" />
							<span>Manage data</span></DropdownMenu.Item
						>
						<DropdownMenu.Item
							target="_blank"
							href="https://github.com/ssebastianoo/SelfStats"
							class="cursor-pointer"
							><Code class="mr-2 h-4 w-4" />
							<span>GitHub</span></DropdownMenu.Item
						>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</header>
		<div>
			{#if loaded}
				<slot />
			{/if}
		</div>
	</div>
</main>
