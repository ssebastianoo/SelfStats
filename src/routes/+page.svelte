<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { Plus } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants, Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import { user } from '$lib/store';

	export let data;

	async function createProject(e: Event) {
		const target = e.target as HTMLFormElement;

		const name = target.project_name.value;
		const description = target.description.value;

		await supabase.from('projects').insert({ name, description, user_id: $user!.id });
	}
</script>

<div class="text-right">
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}
			><Plus /></Dialog.Trigger
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

	<Button
		on:click={() => {
			supabase.auth.signOut();
			location.reload();
		}}>Logout</Button
	>
</div>

<div class="flex">
	{#each data.projects as project}
		<a href={'/project/' + project.id}>
			<Card.Root class="hover:border-white">
				<Card.Header>
					<Card.Title>{project.name}</Card.Title>
					{#if project.description}
						<Card.Description>{project.description}</Card.Description>
					{/if}
				</Card.Header>
			</Card.Root>
		</a>
	{/each}
</div>

<!-- 
<div class="projects">
	{#each projects as project}
		<Project {project} />
	{/each}
</div> -->
