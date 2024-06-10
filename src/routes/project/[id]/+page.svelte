<script lang="ts">
	import Project from '$lib/components/Project.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import type { DescriptorT } from '$lib/types';
	import { project, projects } from '$lib/store';
	import { goto } from '$app/navigation';
	import { alert } from '$lib/store';
	import { onMount } from 'svelte';
	import { getProjects, setProjects, updateProject } from '$lib/utils';

	export let data;

	let editing = false;
	let openSection: 'edit' | 'create' | null = null;
	let loaded = false;
	let projectNotFound = false;

	onMount(() => {
		if ($projects.length > 0) {
			const _project = $projects.find((p) => p.id === data.project_id);
			if (_project) {
				$project = _project;
				loaded = true;
				return;
			}
		}
		loaded = true;
		projectNotFound = true;
	});

	async function editProject(e: Event) {
		const target = e.target as HTMLFormElement;

		const name = target.project_name.value;
		let description = target.description.value;

		if (description === '') {
			description = null;
		}

		$project.name = name;
		$project.description = description;

		let projects = getProjects();

		projects = projects.map((p) => {
			if (p.id === $project.id) {
				return $project;
			}
			return p;
		});

		setProjects(projects);

		$alert = {
			title: 'Success',
			description: 'Project updated',
			show: true,
			danger: false
		};

		target.reset();
	}

	async function editDescriptors(e: Event) {
		const target = e.target as HTMLFormElement;

		for (const descriptor of $project.descriptors) {
			descriptor.name = target['descriptor_name_' + descriptor.id].value;
			descriptor.description = target['descriptor_description_' + descriptor.id].value;
			descriptor.type = target['descriptor_type_' + descriptor.id].value;
		}

		updateProject($project);

		$alert = {
			title: 'Success',
			description: 'Descriptors updated',
			show: true,
			danger: false
		};
	}

	async function createDescriptor(e: Event) {
		const target = e.target as HTMLFormElement;

		const name = target.descriptor_name.value;
		const description = target.description.value;
		const type = target.type.value;

		const newDescriptor: DescriptorT = {
			id: Date.now(),
			name,
			description,
			type,
			project_id: $project.id
		};

		$project.descriptors = [...$project.descriptors, newDescriptor];

		updateProject($project);

		$alert = {
			title: 'Success',
			description: 'Descriptor created',
			show: true,
			danger: false
		};

		target.reset();
	}

	async function deleteDescriptor(descriptor: DescriptorT) {
		$project.descriptors = $project.descriptors.filter((d) => d.id !== descriptor.id);
		for (const _data of $project.data) {
			_data.values = _data.values.filter((v) => v.descriptor_id !== descriptor.id);
		}

		updateProject($project);

		$alert = {
			title: 'Success',
			description: 'Descriptor deleted',
			show: true,
			danger: false
		};
	}

	async function deleteProject() {
		const projects = getProjects();
		setProjects(projects.filter((p) => p.id !== $project.id));
		$alert = {
			title: 'Success',
			description: 'Project deleted',
			show: true,
			danger: false
		};
		goto('/');
	}
</script>

{#if loaded}
	{#if projectNotFound}
		<p>Project not found</p>
	{:else if !editing}
		<Project
			on:edit={() => {
				editing = true;
			}}
		/>
	{:else}
		<div class="flex gap-3 items-center">
			<h2 class="text-xl">Editing project</h2>
			<Button
				variant="outline"
				size="sm"
				on:click={() => {
					editing = false;
				}}
			>
				Close
			</Button>
			<Button variant="destructive" size="sm" on:click={deleteProject}>Delete project</Button>
		</div>
		<hr class="my-4" />
		<form on:submit|preventDefault={editProject} class="flex flex-col gap-2">
			<div class="flex gap-2">
				<Label for="name" class="w-28">Name</Label>
				<Input
					id="name"
					type="text"
					name="project_name"
					placeholder="Statistics Project"
					value={$project.name}
					required
				/>
			</div>
			<div class="flex gap-2">
				<Label for="description" class="w-28">Description</Label>
				<Textarea
					id="description"
					name="description"
					placeholder="My really cool statistics project."
					value={$project.description}
				/>
			</div>
			<div class="flex justify-end">
				<Button type="submit" size="sm" variant="default" class="w-20">Save</Button>
			</div>
		</form>
		<hr class="my-4" />
		<h2 class="text-lg">Descriptors</h2>

		<div class="my-4">
			<Button
				on:click={() => {
					openSection = 'create';
				}}
				size="sm"
				variant={openSection === 'create' ? 'default' : 'outline'}>Create descriptor</Button
			>
			<Button
				on:click={() => {
					openSection = 'edit';
				}}
				size="sm"
				variant={openSection === 'edit' ? 'default' : 'outline'}>Edit descriptors</Button
			>
		</div>

		{#if openSection === 'edit'}
			<form on:submit|preventDefault={editDescriptors} class="flex flex-col gap-2">
				{#each $project.descriptors as descriptor}
					<div class="flex gap-2">
						<Label for={'descriptor_name_' + descriptor.id} class="w-28">Name</Label>
						<Input
							id={'descriptor_name_' + descriptor.id}
							name={'descriptor_name_' + descriptor.id}
							placeholder="My really cool descriptor"
							value={descriptor.name}
						/>
					</div>
					<div class="flex gap-2">
						<Label for={'descriptor_description_' + descriptor.id} class="w-28">Description</Label>
						<Input
							id={'descriptor_description_' + descriptor.id}
							name={'descriptor_description_' + descriptor.id}
							placeholder="My really cool descriptor"
							value={descriptor.description}
						/>
					</div>

					<div class="flex gap-2">
						<Label for={'descriptor_type_' + descriptor.id} class="w-28">Type</Label>

						<select
							name={'descriptor_type_' + descriptor.id}
							id={'descriptor_type_' + descriptor.id}
							class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
			ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium
			placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
			focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							required
						>
							<option value="text" selected={descriptor.type === 'text'}>Text</option>
							<option value="number" selected={descriptor.type === 'number'}>Number</option>
						</select>
					</div>
					<div class="flex justify-end">
						<Button
							variant="destructive"
							size="sm"
							on:click={async () => {
								await deleteDescriptor(descriptor);
							}}>Delete</Button
						>
					</div>

					<hr class="my-4" />
				{/each}
				<div class="flex justify-end">
					<Button type="submit" size="sm" variant="default" class="w-20">Save</Button>
				</div>
			</form>
		{/if}
		{#if openSection === 'create'}
			<form on:submit|preventDefault={createDescriptor} class="flex flex-col gap-2">
				<div class="flex gap-2">
					<Label for="name" class="w-28">Name</Label>
					<Input
						id="name"
						type="text"
						name="descriptor_name"
						placeholder="Descriptor name"
						required
					/>
				</div>
				<div class="flex gap-2">
					<Label for="description" class="w-28">Description</Label>
					<Textarea id="description" name="description" placeholder="Descriptor description" />
				</div>

				<div class="flex gap-2">
					<Label for="type" class="w-28">Type</Label>
					<select
						name="type"
						id="type"
						class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
			ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium
			placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
			focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						required
					>
						<option value="text">Text</option>
						<option value="number">Number</option>
					</select>
				</div>
				<div class="flex justify-end">
					<Button type="submit" size="sm" variant="default" class="w-20">Save</Button>
				</div>
			</form>
		{/if}
	{/if}
{:else}
	<p>loading</p>
{/if}
