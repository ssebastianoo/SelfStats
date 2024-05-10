<script lang="ts">
	import type { ProjectT } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { buttonVariants, Button } from '$lib/components/ui/button';
	import { Plus } from 'lucide-svelte';
	import Input from './ui/input/input.svelte';
	import { createEventDispatcher } from 'svelte';

	export let project: ProjectT;

	const dispatch = createEventDispatcher();

	async function addSimpleValue(e: Event) {
		const res = await fetch('/api/values', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				project_id: project.id
			})
		});
		if (!res.ok) {
			// TODO: add error handling
			return console.error('Error adding value');
		}

		const json = await res.json();
		dispatch('newValue', {
			data: json.data
		});
	}

	async function addValue(e: Event) {
		const target = e.target as HTMLFormElement;

		let values: {
			descriptor_id: number;
			name: string;
			description: string | null;
			type: string;
			value: string;
			data_id: number;
			project_id: number;
		}[] = [];

		for (const descriptor of project.descriptors) {
			const value = target['descriptor_' + descriptor.id].value;

			values.push({
				descriptor_id: descriptor.id,
				name: descriptor.name,
				description: descriptor.description,
				type: descriptor.type,
				project_id: project.id,
				value,
				data_id: 0
			});
		}

		const res = await fetch('/api/values', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				project_id: project.id,
				values
			})
		});

		if (!res.ok) {
			// TODO: handle error
			return console.error('Error adding values');
		}

		const json = await res.json();

		dispatch('newValue', {
			data: json.data
		});
	}
</script>

{#if project.descriptors.length > 0}
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}
			><Plus /></Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Register new data</Dialog.Title>
			</Dialog.Header>
			<form class="flex flex-col gap-3" on:submit|preventDefault={addValue}>
				{#each project.descriptors as descriptor}
					<p>{descriptor.name}</p>
					{#if descriptor.description}
						<p>{descriptor.description}</p>
					{/if}
					<Input
						name={'descriptor_' + descriptor.id}
						type={descriptor.type}
						placeholder={descriptor.type === 'text' ? 'Enter text' : 'Enter number'}
						required
					/>
				{/each}
				<DialogPrimitive.Close>
					<Button variant="outline" size="sm" type="submit">Add value</Button>
				</DialogPrimitive.Close>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Button variant="outline" size="sm" on:click={addSimpleValue}><Plus /></Button>
{/if}
