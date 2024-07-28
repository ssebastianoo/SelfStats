<script lang="ts">
	import DateChart from './DateChart.svelte';
	import ValueCharts from './ValueCharts.svelte';
	import { onMount } from 'svelte';
	import { project } from '$lib/store';

	let loaded = false;
	let show: 'bar' | 'line' = 'bar';
	let periodType: 'week' | 'month' | 'all' = 'week';

	const aWeekAgo = new Date();
	aWeekAgo.setHours(0);
	aWeekAgo.setMinutes(0);
	aWeekAgo.setDate(aWeekAgo.getDate() - 7);

	const aMonthAgo = new Date();
	aMonthAgo.setHours(0);
	aMonthAgo.setMinutes(0);
	aMonthAgo.setDate(aMonthAgo.getDate() - 30);

	function getPeriod(when: typeof periodType) {
		const data = $project.data.sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
		switch (when) {
			case 'week':
				return data.filter((d) => new Date(d.created_at) > aWeekAgo);
			case 'month':
				return data.filter((d) => new Date(d.created_at) > aMonthAgo);
			case 'all':
				return data;
		}
	}

	let period = getPeriod('week');

	onMount(() => {
		if (localStorage.getItem('graphType')) {
			if ($project.descriptors.some((descriptor) => descriptor.type === 'number')) {
				show = localStorage.getItem('graphType') as 'bar' | 'line';
			}
		}

		if (localStorage.getItem('graphPeriod')) {
			periodType = localStorage.getItem('graphPeriod') as 'week' | 'month' | 'all';
			period = getPeriod(periodType);
		}

		loaded = true;
	});
</script>

{#if loaded}
	{#if $project.descriptors.some((descriptor) => descriptor.type === 'number')}
		<select
			bind:value={show}
			class="rounded-md border border-input bg-background px-3 py-2 text-sm
			ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium
			placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
			focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-3"
			on:change={() => {
				localStorage.setItem('graphType', show);
			}}
		>
			<option value="bar">Dates</option>
			<option value="line">Values</option>
		</select>
	{/if}
	<select
		bind:value={periodType}
		class="rounded-md border border-input bg-background px-3 py-2 text-sm
			ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium
			placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
			focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-3"
		on:change={() => {
			localStorage.setItem('graphPeriod', periodType);
			period = getPeriod(periodType);
		}}
	>
		<option value="week">Last week</option>
		<option value="month">Last month</option>
		<option value="all">All</option>
	</select>
	{#key period}
		{#if show === 'bar'}
			<DateChart {period} />
		{:else}
			<ValueCharts {period} />
		{/if}
	{/key}
{/if}
