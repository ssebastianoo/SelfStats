<script lang="ts">
	import { supabase } from '$lib/supabase';
	import type { ProjectT } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Card from '$lib/components/ui/card';
	import { buttonVariants, Button } from '$lib/components/ui/button';
	import { Plus } from 'lucide-svelte';

	export let project: ProjectT;

	async function addSimpleValue(e: Event) {
		const { error } = await supabase
			.from('data')
			.insert({
				project_id: project.id
			})
			.select('id');

		if (error) {
			throw new Error(error.message);
		}
	}

	async function addValue(e: Event) {
		const target = e.target as HTMLFormElement;

		const { data, error } = await supabase
			.from('data')
			.insert({
				project_id: project.id
			})
			.select('id');

		if (error) {
			throw new Error(error.message);
		}

		const data_id = data[0].id;

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
				data_id
			});
		}
		console.log(values);
		const { error: valuesError } = await supabase.from('values').insert(values);
		if (valuesError) {
			console.log(valuesError);
		}
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
					<input
						name={'descriptor_' + descriptor.id}
						type="text"
						placeholder="value"
						class="w-20 border-black border-2"
					/>
				{/each}
				<Button variant="outline" size="sm" type="submit">Add value</Button>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Button variant="outline" size="sm" on:click={addSimpleValue}><Plus /></Button>
{/if}
