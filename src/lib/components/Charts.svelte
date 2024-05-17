<script lang="ts">
	import { Bar } from 'svelte-chartjs';
	import { Chart, Tooltip, BarElement, CategoryScale, LinearScale } from 'chart.js';
	import { onMount } from 'svelte';
	import { project } from '$lib/store';
	import type { ChartData } from 'chart.js';

	let loaded = false;
	let chartData: ChartData<'bar', (number | [number, number])[], unknown> = {
		labels: [],
		datasets: [
			{
				data: [],
				backgroundColor: 'rgba(255, 255, 255,0.4)',
				borderWidth: 2,
				borderColor: 'white'
			}
		]
	};

	onMount(() => {
		let values: {
			date: string;
			value: number;
		}[] = [];

		for (const data of $project.data) {
			const date = new Date(data.created_at);

			const value = values.find((v) => v.date === date.toLocaleDateString());
			if (value) {
				value.value++;
			} else {
				values.push({
					date: date.toLocaleDateString(),
					value: 1
				});
			}
		}

		chartData.labels = values.map((v) => v.date).reverse();
		chartData.datasets[0].data = values.map((v) => v.value).reverse();

		Chart.register(Tooltip, BarElement, CategoryScale, LinearScale);
		loaded = true;
	});
</script>

{#if loaded}
	<Bar data={chartData} options={{ responsive: true }} height="90" />
{/if}
