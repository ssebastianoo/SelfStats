<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import type { ProjectT } from '$lib/types';
	export let project: ProjectT;
	import { Pencil } from 'lucide-svelte';
	import { buttonVariants, Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	let open = false;

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

<Dialog.Root {open}>
	<Dialog.Trigger
		on:click={() => {
			open = true;
		}}
		class={buttonVariants({ variant: 'outline', size: 'sm' })}><Pencil size="20" /></Dialog.Trigger
	>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit descriptors</Dialog.Title>
		</Dialog.Header>

		<form class="flex flex-col gap-2" on:submit|preventDefault={createDescriptor}>
			<Input type="hidden" value={project.id} name="project_id" />
			<Input type="text" placeholder="Name" name="descriptor_name" required />
			<Input type="description" placeholder="Description" name="description" />
			<select
				name="type"
				class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
				required
			>
				<option value="text">Text</option>
				<option value="number">Number</option>
			</select>
			<Button type="submit" size="sm">Add descriptor</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
