<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';
	import type { ProjectT } from '$lib/types';
	import Project from '$lib/components/Project.svelte';

	const user = {
		id: '9a448a1b-79c1-4b9a-b515-633040fc35dd'
	};

	let projects: ProjectT[] = [];

	onMount(async () => {
		const { data } = await supabase.from('projects').select('*');
		if (data) {
			for (const project of data) {
				const { data: descriptors } = await supabase
					.from('descriptors')
					.select('*')
					.eq('project_id', project.id);

				console.log(descriptors);

				projects.push({
					name: project.name,
					description: project.description,
					id: project.id,
					user_id: project.user_id,
					descriptors: descriptors ? descriptors : []
				});
			}
			projects = projects;
		}
	});

	async function createProject(e: Event) {
		const target = e.target as HTMLFormElement;

		const name = target.project_name.value;
		const description = target.description.value;

		await supabase.from('projects').insert({ name, description, user_id: user.id });
	}
</script>

<form on:submit={createProject} class="mb-10">
	<input type="text" name="project_name" placeholder="Name" required />
	<textarea name="description" placeholder="Description"></textarea>

	<input type="submit" value="Create project" class="border-black border-2" />
</form>

<div class="projects">
	{#each projects as project}
		<Project {project} />
	{/each}
</div>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>
