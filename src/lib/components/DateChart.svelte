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
	import type { ChartData, Point } from 'chart.js';
	import type { DataT } from '$lib/types';

	export let period: DataT[];

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

	onMount(() => {
		if (period.length > 0) {
			let done = false;
			let count = 0;

			while (done === false) {
				let date = new Date(period[0].created_at);
				date.setDate(date.getDate() + count);
				date.setHours(13);
				date.setMinutes(0);
				date.setSeconds(0);

				chartLineData.labels!.push(date.toLocaleDateString());

				const data = period.filter((d) => {
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
	<div>
		<Line data={chartLineData} options={{ maintainAspectRatio: false }} height={250} />
	</div>
{/if}
