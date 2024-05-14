<script lang="ts">
	import { Pencil } from 'lucide-svelte';
	import Button from './ui/button/button.svelte';
	import Input from './ui/input/input.svelte';
	import Label from './ui/label/label.svelte';
	import type { DataT, DescriptorT, ValueT } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let open = false;
	export let data: DataT;
	export let descriptors: DescriptorT[];

	async function editValue(e: Event) {
		const target = e.target as HTMLFormElement;

		let values: {
			value: string;
			id: number;
		}[] = [];

		for (const valueData of data.values) {
			const v = { ...valueData };

			const value = target['value_' + valueData.id].value;
			v.value = value;

			values.push(v);
		}

		const res = await fetch('/api/values', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				values
			})
		});

		if (!res.ok) {
			return console.error('Failed to update values');
		}

		const json = await res.json();
		dispatch('update', json as ValueT[]);

		open = false;
	}
</script>

<Button
	size="sm"
	variant="outline"
	on:click={() => {
		open = false;
		open = true;
	}}><Pencil size="19" /></Button
>

<Dialog.Root {open}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit value</Dialog.Title>
		</Dialog.Header>
		<form class="flex flex-col gap-2" on:submit|preventDefault={editValue}>
			{#each data.values as value}
				{#if descriptors.find((descriptor) => value.descriptor_id === descriptor.id)}
					<div class="flex gap-2">
						<Label class="w-28" for={'value_' + value.id}
							>{descriptors.find((descriptor) => value.descriptor_id === descriptor.id)
								?.name}</Label
						>
						<Input
							id={'value_' + value.id}
							type={descriptors.find((descriptor) => value.descriptor_id === descriptor.id)?.type}
							name={'value_' + value.id}
							value={value.value}
						/>
					</div>
				{/if}
			{/each}
			<div class="text-right">
				<Button type="submit" size="sm">Save</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
