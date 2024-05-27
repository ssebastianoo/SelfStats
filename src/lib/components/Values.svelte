<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import EditValue from './EditValue.svelte';
	import { project } from '$lib/store';
</script>

<div class="w-full overflow-auto">
	<Table.Root>
		<Table.Caption>Registered values</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class="min-w-[150px]">Date</Table.Head>
				{#each $project.descriptors as descriptor}
					<Table.Head class="min-w-[100px]">{descriptor.name}</Table.Head>
				{/each}
				<Table.Head></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each $project.data as data}
				{#key data}
					<Table.Row>
						<Table.Cell class="w-fit"
							>{new Date(data.created_at)
								.toLocaleString()
								.replace(',', '')
								.slice(0, -3)}</Table.Cell
						>

						{#if data.values}
							{#each $project.descriptors as descriptor}
								<Table.Cell>
									{data.values.find((value) => value.descriptor_id === descriptor.id)?.value || ''}
								</Table.Cell>
							{/each}
						{/if}
						<Table.Cell
							><EditValue
								on:update={(event) => {
									for (const value of event.detail.values) {
										const index = data.values.findIndex((v) => v.id === value.id);
										data.values[index] = value;
									}

									if (event.detail.date) data.created_at = event.detail.date;
								}}
								{data}
								descriptors={$project.descriptors}
							/></Table.Cell
						>
					</Table.Row>
				{/key}
			{/each}
		</Table.Body>
	</Table.Root>
</div>
