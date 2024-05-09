<script lang="ts">
	import type { ProjectT } from '../types';
	import Register from '$lib/components/Register.svelte';
	import Values from '$lib/components/Values.svelte';
	import { Button } from './ui/button';
	import { Pencil } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	export let project: ProjectT;

	const dispatch = createEventDispatcher();

	async function createDescriptor(e: Event) {
		const target = e.target as HTMLFormElement;

		const name = target.descriptor_name.value;
		const description = target.description.value;
		const type = target.type.value;

		const res = await fetch('/api/descriptors', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				project_id: project.id,
				name,
				description,
				type
			})
		});

		if (!res.ok) {
			// TODO: handle error
			console.error('Failed to create descriptor');
			return;
		}

		const json = await res.json();
		project.descriptors.push(json);
	}
</script>

<div>
	<div class="flex gap-3 items-center">
		<h2 class="text-3xl">{project.name}</h2>

		<Button
			size="sm"
			variant="outline"
			on:click={() => {
				dispatch('edit');
			}}><Pencil size="20" /></Button
		>
	</div>
	{#if project.description}
		<p>{project.description}</p>
	{/if}
	<Values {project} />
	<Register
		{project}
		on:newValue={(e) => {
			project.data = [...project.data, e.detail.data];
		}}
	/>
</div>
