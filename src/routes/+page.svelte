<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants, Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { ProjectT } from '$lib/types';
	import { alert } from '$lib/store';
	import { getProjects, setProjects } from '$lib/utils';
	import { onMount } from 'svelte';
	import { projects } from '$lib/store';
[]
	let dialogOpen = false;

	async function createProject(e: Event) {
		const target = e.target as HTMLFormElement;

		const name = target.project_name.value;
		const description = target.description.value;

		const newProject: ProjectT = {
			id: Date.now(),
			name,
			description,
			data: [],
			descriptors: []
		};

		$projects = [newProject, ...$projects];
		setProjects($projects);

		dialogOpen = false;

		$alert = {
			title: 'Success',
			description: 'Project created successfully',
			show: true,
			danger: false
		};
	}
</script>

{#if projects}
	<div class="text-right mb-4">
		<Dialog.Root open={dialogOpen}>
			<Dialog.Trigger
				on:click={() => {
					dialogOpen = true;
				}}
				class={buttonVariants({ variant: 'outline', size: 'sm' })}><Plus /></Dialog.Trigger
			>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Create a new project</Dialog.Title>
				</Dialog.Header>
				<form on:submit={createProject} class="flex flex-col gap-2">
					<Input type="text" name="project_name" placeholder="Name" required />
					<Textarea name="description" placeholder="Description" />
					<Button type="submit" value="Create project" size="sm">Create Project</Button>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<div class="flex flex-col gap-2">
		{#if $projects.length === 0}
			<div class="flex justify-center">
				<p class="text-muted-foreground">No projects found, try creating one</p>
			</div>
		{/if}
		{#each $projects as project}
			<a href={'/project/' + project.id} class="border rounded-md p-2 hover:border-white">
				<h2 class="text-lg">{project.name}</h2>
				{#if project.description}
					<p class="text-muted-foreground">{project.description}</p>
				{/if}
			</a>
		{/each}
	</div>
{/if}
