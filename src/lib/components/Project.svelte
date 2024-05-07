<script lang="ts">
	import type { ProjectT } from '../types';
	import Register from '$lib/components/Register.svelte';
	import Values from '$lib/components/Values.svelte';

	export let project: ProjectT;

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

<div class="project">
	<h2 class="text-3xl">{project.name}</h2>
	{#if project.description}
		<p>{project.description}</p>
	{/if}

	<form class="add-descriptor" on:submit|preventDefault={createDescriptor}>
		<input type="hidden" value={project.id} name="project_id" />
		<input type="text" placeholder="Name" name="descriptor_name" required />
		<input type="description" placeholder="Description" name="description" />
		<select name="type" required>
			<option value="text">Text</option>
			<option value="number">Number</option>
		</select>
		<input
			class="border-2 border-black w-32 hover:cursor-pointer"
			type="submit"
			value="Add descriptor"
		/>
	</form>
	<Values {project} />
	<Register
		{project}
		on:newValue={(e) => {
			project.data = [...project.data, e.detail.data];
		}}
	/>
</div>

<style>
	.project {
		border: 1px solid black;
	}

	.add-descriptor {
		border: 1px solid black;
		display: flex;
		flex-direction: column;
	}
</style>
