<script lang="ts">
	import Register from '$lib/components/Register.svelte';
	import Values from '$lib/components/Values.svelte';
	import { Button } from './ui/button';
	import { Pencil } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { project } from '$lib/store';
	import Charts from './Charts.svelte';
	import CSV from '$lib/components/CSV.svelte';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { onMount } from 'svelte';

	const dispatch = createEventDispatcher();
	let showGraphs = false;

	onMount(() => {
		if (localStorage.getItem('showGraphs')) {
			showGraphs = localStorage.getItem('showGraphs') === 'true';
		}
	});
</script>

<div>
	<div class="flex gap-3 items-center">
		<h2 class="text-3xl">{$project.name}</h2>

		<Button
			size="sm"
			variant="outline"
			on:click={() => {
				dispatch('edit');
			}}><Pencil size="18" /></Button
		>
		<CSV />
	</div>
	{#if $project.description}
		<p class="mt-2">{$project.description}</p>
	{/if}
	<hr class="my-4" />

	<div class="flex justify-center gap-4 items-center mb-4">
		<h1 class="text-6xl">{$project.data.length}</h1>
		<Register />
	</div>
	{#key $project.data}
		<div class="flex items-center gap-2 mb-4">
			<Switch
				bind:checked={showGraphs}
				class="mr-2"
				on:click={() => {
					localStorage.setItem('showGraphs', (!showGraphs).toString());
				}}
			/>
			<p>Show graphs</p>
		</div>
		{#if showGraphs}
			<Charts />
		{/if}
	{/key}
	<Values />
</div>
