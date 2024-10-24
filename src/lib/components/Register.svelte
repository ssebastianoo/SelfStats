<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants, Button } from '$lib/components/ui/button';
	import { Plus } from 'lucide-svelte';
	import Input from './ui/input/input.svelte';
	import { project } from '$lib/store';
	import { updateProject } from '$lib/utils';
	import type { DataT, ValueT } from '$lib/types';

	let open = false;

	async function addSimpleValue(e: Event) {
		const newData: DataT = {
			id: Date.now(),
			created_at: new Date().toISOString(),
			values: [],
			project_id: $project.id
		};

		$project.data = [newData, ...$project.data];
		updateProject($project);
	}

	async function addValue(e: Event) {
		const target = e.target as HTMLFormElement;

		let values: ValueT[] = [];

		for (const descriptor of $project.descriptors) {
			const value = target['descriptor_' + descriptor.id].value;

			values.push({
				descriptor_id: descriptor.id,
				name: descriptor.name,
				description: descriptor.description,
				type: descriptor.type,
				project_id: $project.id,
				value,
				id: parseInt(
					Date.now().toString().slice(-5) + Math.floor(1000000 + Math.random() * 9000000).toString()
				)
			});
		}

		const data: DataT = {
			id: Date.now(),
			created_at: new Date().toISOString(),
			values,
			project_id: $project.id
		};

		$project.data = [data, ...$project.data];

		open = false;

		updateProject($project);
	}
</script>

{#if $project.descriptors.length > 0}
	<Dialog.Root {open}>
		<Dialog.Trigger
			class={buttonVariants({ variant: 'outline', size: 'sm' })}
			on:click={() => {
				open = true;
			}}><Plus /></Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Register new data</Dialog.Title>
			</Dialog.Header>
			<form class="flex flex-col gap-3" on:submit|preventDefault={addValue}>
				<div class="flex flex-col gap-3 max-h-[60vh] overflow-auto p-[2px]">
					{#each $project.descriptors as descriptor}
						<p>{descriptor.name}</p>
						{#if descriptor.description}
							<p>{descriptor.description}</p>
						{/if}
						<Input
							name={'descriptor_' + descriptor.id}
							type={descriptor.type}
							placeholder={descriptor.type === 'text' ? 'Enter text' : 'Enter number'}
							step={descriptor.type === 'number' ? '0.0000001' : undefined}
							required
						/>
					{/each}
				</div>
				<div class="flex justify-center">
					<Button class="w-full" variant="outline" size="sm" type="submit">Add value</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Button variant="outline" size="sm" on:click={addSimpleValue}><Plus /></Button>
{/if}
