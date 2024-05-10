<script lang="ts">
	import type { ProjectT } from '$lib/types';

	export let project: ProjectT;

	import * as Table from '$lib/components/ui/table';
</script>

<Table.Root>
	<Table.Caption>Registered values</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head>Date</Table.Head>
			{#each project.descriptors as descriptor}
				<Table.Head>{descriptor.name}</Table.Head>
			{/each}
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
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
