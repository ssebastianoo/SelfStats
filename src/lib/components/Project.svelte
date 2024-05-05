<script lang="ts">
	import type { ProjectT, DataT } from '../types';
	import { supabase } from '../supabase';
	export let project: ProjectT;
	import Register from '$lib/components/Register.svelte';
	import Values from '$lib/components/Values.svelte';

	async function createDescriptor(e: Event) {
		const target = e.target as HTMLFormElement;

		const name = target.descriptor_name.value;
		const description = target.description.value;
		const type = target.type.value;

		const { data, error } = await supabase
			.from('descriptors')
			.insert({ name, description, type, project_id: project.id });
		if (error) {
			console.log(error);
		}
	}
</script>

<div class="project">
	<h2 class="text-3xl">{project.name}</h2>
	{#if project.description}
		<p>{project.description}</p>
	{/if}

	<form class="add-descriptor" on:submit|preventDefault={createDescriptor}>
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
	<Register {project} />
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
