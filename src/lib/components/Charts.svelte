<script lang="ts">
	import ValueCharts from './ValueCharts.svelte';
	import { Line } from 'svelte-chartjs';
	import {
		Chart,
		BarElement,
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale
	} from 'chart.js';
	import { onMount } from 'svelte';
	import { project } from '$lib/store';
	import type { ChartData, Point } from 'chart.js';

	let chartLineData: ChartData<'line', (number | Point)[]> = {
		labels: [],
		datasets: [
			{
				label: 'Dates',
				backgroundColor: 'white',
				borderColor: 'white',
				borderWidth: 3,
				data: [],
				// @ts-ignore
				lineTension: 0.3
			}
		]
	};

	let loaded = false;
	let show: 'bar' | 'line' = 'bar';

	onMount(() => {
		if (localStorage.getItem('graphType')) {
			show = localStorage.getItem('graphType') as 'bar' | 'line';
		}

		if ($project.data.length > 0) {
			let done = false;
			let count = 0;

			$project.data.sort((a, b) => {
				return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
			});

			while (done === false) {
				let date = new Date($project.data[0].created_at);
				date.setDate(date.getDate() + count);
				date.setHours(13);
				date.setMinutes(0);
				date.setSeconds(0);

				chartLineData.labels!.push(date.toLocaleDateString());

				const data = $project.data.filter((d) => {
					const then = new Date(d.created_at);

					if (
						then.getDate() === date.getDate() &&
						then.getMonth() === date.getMonth() &&
						then.getFullYear() === date.getFullYear()
					) {
						return true;
					}

					return false;
				});

				if (data.length === 0) {
					chartLineData.datasets[0].data.push(0);
				} else {
					let totalValue = 0;
					for (const _ of data) {
						totalValue += 1;
					}
					chartLineData.datasets[0].data.push(totalValue);
				}

				if (date.toLocaleDateString() === new Date().toLocaleDateString()) {
					done = true;
				}

				count += 1;
			}
		}

		Chart.register(
			Tooltip,
			BarElement,
			CategoryScale,
			LinearScale,
			Title,
			Tooltip,
			Legend,
			LineElement,
			LinearScale,
			PointElement,
			CategoryScale
		);
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
	{#if show === 'bar'}
		<div>
			<Line data={chartLineData} options={{ maintainAspectRatio: false }} height={250} />
		</div>
	{:else}
		<ValueCharts />
	{/if}
{/if}
