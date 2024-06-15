<script lang="ts">
	import Button from './ui/button/button.svelte';
	import { project } from '$lib/store';
	import { onMount } from 'svelte';

	function downloadCSV() {
		let rows = [$project.descriptors.map((x) => x.name)];

		rows[0] = ['created_at', ...rows[0]];

		for (const data of $project.data) {
			const row = [data.created_at];
			for (const descriptor of $project.descriptors) {
				const value = data.values.find((x) => x.descriptor_id === descriptor.id);
				if (value) {
					row.push(value.value);
				} else {
					row.push('');
				}
			}
			rows.push(row);
		}
		const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', $project.name + '.csv');
		document.body.appendChild(link);
		link.click();
		link.remove();
	}
</script>

{#if $project.descriptors.length > 0}
	<Button variant="outline" size="sm" on:click={downloadCSV}>Download CSV</Button>
{/if}
