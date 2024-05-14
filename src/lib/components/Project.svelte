<script lang="ts">
	import type { ProjectT } from '../types';
	import Register from '$lib/components/Register.svelte';
	import Values from '$lib/components/Values.svelte';
	import { Button } from './ui/button';
	import { Pencil } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	export let project: ProjectT;

	const dispatch = createEventDispatcher();
</script>

<div>
	<div class="flex gap-3 items-center">
		<h2 class="text-3xl">{project.name}</h2>

		<Button
			size="sm"
			variant="outline"
			on:click={() => {
				dispatch('edit');
			}}><Pencil size="18" /></Button
		>
	</div>
	{#if project.description}
		<p class="mt-2">{project.description}</p>
	{/if}
	<hr class="my-4" />

	<div class="flex justify-center gap-4 items-center">
		<h1 class="text-6xl">{project.data.length}</h1>
		<Register
			{project}
			on:newValue={(e) => {
				project.data = [e.detail.data, ...project.data];
			}}
		/>
	</div>
	<!-- <Charts {project} /> -->
	<Values {project} />
</div>
