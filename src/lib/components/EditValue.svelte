<script lang="ts">
	import { Pencil } from 'lucide-svelte';
	import Button from './ui/button/button.svelte';
	import Input from './ui/input/input.svelte';
	import Label from './ui/label/label.svelte';
	import type { DataT, DescriptorT, ValueT } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog';
	import { createEventDispatcher } from 'svelte';
	import { project } from '$lib/store';
	import { alert } from '$lib/store';
	import { updateProject } from '$lib/utils';

	const dispatch = createEventDispatcher();

	export let data: DataT;
	export let descriptors: DescriptorT[];
	let open = false;

	async function editValue(e: Event) {
		const target = e.target as HTMLFormElement;

		let date: null | Date = null;
		const newDate = target.date.value + ' ' + target.hours.value + ':' + target.minutes.value;

		if (newDate !== target.original_date.value) {
			date = new Date(newDate);
			if (!date.getDay()) {
				$alert = {
					show: true,
					danger: true,
					title: 'Invalid date',
					description: 'Please enter a valid date'
				};
				return;
			}
		}

		for (const valueData of data.values) {
			const value = target['value_' + valueData.id].value;
			valueData.value = value;
		}

		$project.data = $project.data.map((d) => {
			if (d.id === data.id) {
				d.values = data.values;

				if (date) {
					d.created_at = date.toISOString();
				}
			}
			return d;
		});

		updateProject($project);

		open = false;

		$alert = {
			show: true,
			danger: false,
			title: 'Success',
			description: 'Values updated successfully'
		};
	}

	async function deleteData() {
		$project.data = $project.data.filter((d) => d.id !== data.id);
		updateProject($project);

		open = false;

		$alert = {
			show: true,
			danger: false,
			title: 'Success',
			description: 'Data deleted successfully'
		};
	}

	const day = data.created_at.split(':')[0].slice(0, -3);
	const hours = new Date(data.created_at).toLocaleTimeString().split(':')[0];
	const minutes = new Date(data.created_at).toLocaleTimeString().split(':')[1];

	function checkHours(e: Event) {
		const target = e.target as HTMLInputElement;

		const r = /^([0-9]|0[0-9]|1[0-9]|2[0-3])$/.test(target.value);

		if (!r) {
			target.value = '00';
		}
	}

	function checkMinutes(e: Event) {
		const target = e.target as HTMLInputElement;

		const r = /[0-5][0-9]$/.test(target.value);

		if (!r) {
			target.value = '00';
		}
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
			<div class="flex gap-2">
				<Label class="w-24" for="date">Date</Label>
				<div class="flex justify-between gap-1 w-full items-center">
					<Input class="w-full" id="date" type="date" value={day} name="date" />
					<Input
						class="w-12 text-center"
						id="hours"
						type="text"
						name="hours"
						placeholder="00"
						value={hours}
						on:change={checkHours}
					/>
					:
					<Input
						class="w-12 text-center"
						id="minutes"
						type="text"
						name="minutes"
						placeholder="00"
						value={minutes}
						on:change={checkMinutes}
					/>
				</div>
				<input type="hidden" value={day + ' ' + hours + ':' + minutes} name="original_date" />
			</div>
			{#each data.values as value}
				{#if descriptors.find((descriptor) => value.descriptor_id === descriptor.id)}
					<div class="flex gap-2">
						<Label class="w-24" for={'value_' + value.id}
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
				<Button variant="destructive" size="sm" class="mr-1" on:click={deleteData}>Delete</Button>
				<Button type="submit" size="sm">Save</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
