<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants, Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { ProjectT } from '$lib/types';
	import { alert } from '$lib/store';

	export let data;
	let dialogOpen = false;

	let editingProject: ProjectT | null = null;

	async function createProject(e: Event) {
		const target = e.target as HTMLFormElement;

		const name = target.project_name.value;
		const description = target.description.value;

		const res = await fetch('/api/projects', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name,
				description
			})
		});

		if (!res.ok) {
			$alert = {
				title: 'Error',
				description: "Couldn't create project",
				show: true,
				danger: true
			};
			return console.error('Failed to create project');
		}

		const json = await res.json();
		data.projects = [...data.projects, json];
		dialogOpen = false;

		$alert = {
			title: 'Success',
			description: 'Project created successfully',
			show: true,
			danger: false
		};
	}

	async function editProject(e: Event) {
		if (!editingProject) {
			return;
		}

		const target = e.target as HTMLFormElement;

		const name = target.project_name.value;
		let description = target.description.value;

		if (description === '') {
			description = null;
		}

		const res = await fetch(`/api/projects`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name,
				description,
				project_id: editingProject.id
			})
		});

		if (!res.ok) {
			$alert = {
				title: 'Error',
				description: "Couldn't edit project",
				show: true,
				danger: true
			};
			return console.error('Failed to edit project');
		}

		const json = await res.json();
		data.projects = data.projects.map((project) => {
			if (project.id === json.id) {
				return json;
			}
			return project;
		});

		editingProject = null;

		$alert = {
			title: 'Success',
			description: 'Project edited successfully',
			show: true,
			danger: false
		};
	}
</script>

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

<Dialog.Root open={editingProject ? true : false}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit project</Dialog.Title>
		</Dialog.Header>
		{#if editingProject}
			<form on:submit={editProject} class="flex flex-col gap-2">
				<Input
					type="text"
					name="project_name"
					placeholder="Name"
					value={editingProject.name}
					required
				/>
				<Textarea name="description" placeholder="Description" value={editingProject.description} />
				<Button type="submit" size="sm">Edit Project</Button>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<div class="flex flex-col gap-2">
	{#each data.projects as project}
		<a href={'/project/' + project.id} class="border rounded-md p-2 hover:border-white">
			<h2 class="text-lg">{project.name}</h2>
			{#if project.description}
				<p class="text-muted-foreground">{project.description}</p>
			{/if}
		</a>
	{/each}
</div>
