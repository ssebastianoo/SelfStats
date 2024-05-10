<script lang="ts">
	import '@carbon/charts-svelte/styles.css';
	import { LineChart } from '@carbon/charts-svelte';
	import type { ProjectT } from '$lib/types';

	export let project: ProjectT;
</script>
