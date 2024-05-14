<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import type { ProjectT } from '$lib/types';
	import EditValue from './EditValue.svelte';

	export let project: ProjectT;
</script>

<Table.Root>
	<Table.Caption>Registered values</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head>Date</Table.Head>
			{#each project.descriptors as descriptor}
				<Table.Head>{descriptor.name}</Table.Head>
			{/each}
			<Table.Head></Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each project.data as data}
			<Table.Row>
				<Table.Cell>{new Date(data.created_at).toDateString()}</Table.Cell>

				{#if data.values}
					{#each project.descriptors as descriptor}
						<Table.Cell>
							{data.values.find((value) => value.descriptor_id === descriptor.id)?.value || ''}
						</Table.Cell>
					{/each}
				{/if}
				<Table.Cell
					><EditValue
						on:update={(event) => {
							for (const value of event.detail) {
								const index = data.values.findIndex((v) => v.id === value.id);
								data.values[index] = value;
							}
						}}
						{data}
						descriptors={project.descriptors}
					/></Table.Cell
				>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
