<script lang="ts">
	import type { ProjectT } from '$lib/types';

	export let project: ProjectT;
</script>

<p>{project.data.length}</p>

<div class="flex flex-wrap gap-2">
	{#each project.data as data}
		<div class="border p-2 rounded-md">
			<p>{new Date(data.created_at).toDateString()}</p>
			{#if data.values}
				{#each data.values as value}
					<p>{value.name}: {value.value}</p>
				{/each}
			{/if}
		</div>
	{/each}
</div>
