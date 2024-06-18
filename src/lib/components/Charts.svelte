<script lang="ts">
	import { Bar, Line } from 'svelte-chartjs';
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

	let loaded = false;
	let show: 'bar' | 'line' = 'bar';
	let chartData: ChartData<'bar', (number | [number, number])[], unknown> = {
		labels: [],
		datasets: [
			{
				label: 'Dates',
				data: [],
				backgroundColor: 'rgba(255, 255, 255,0.4)',
				borderWidth: 2,
				borderColor: 'white'
			}
		]
	};

	let chartLineData: ChartData<'line', (number | Point)[], unknown>[] = [];

	onMount(() => {
		let values: {
			date: string;
			value: number;
		}[] = [];

		let numberValues: { id: number; dates: string[]; values: number[]; name: string }[] = [];

		$project.data.sort(
			(a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
		);

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
			for (const value of data.values) {
				if (value.type === 'number') {
					const descriptor = $project.descriptors.find((d) => d.id === value.descriptor_id);
					if (descriptor) {
						const numberValue = numberValues.find((x) => x.id === descriptor.id);
						if (numberValue) {
							numberValue.dates.push(date.toLocaleDateString());
							numberValue.values.push(parseInt(value.value));
						} else {
							numberValues.push({
								id: descriptor.id,
								dates: [date.toLocaleDateString()],
								values: [parseInt(value.value)],
								name: descriptor.name
							});
						}
					}
				}
			}
		}

		chartData.labels = values.map((v) => v.date);
		chartData.datasets[0].data = values.map((v) => v.value);

		chartLineData = numberValues.map((value) => {
			return {
				labels: value.dates,
				datasets: [
					{
						label: value.name,
						backgroundColor: 'rgba(255, 255, 255,0.4)',
						borderWidth: 2,
						borderColor: 'white',
						data: value.values.map((v) => v),
						// @ts-ignore
						lineTension: 0.3
					}
				]
			};
		});

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
	<select
		bind:value={show}
		class="rounded-md border border-input bg-background px-3 py-2 text-sm
			ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium
			placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
			focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-3"
	>
		<option value="bar">Dates</option>
		<option value="line">Values</option>
	</select>
	{#if show === 'bar'}
		<Bar data={chartData} options={{ responsive: true }} height="90" />
	{:else}
		<div class="flex flex-col gap-3">
			{#each chartLineData as data}
				<Line {data} height="200" />
			{/each}
		</div>
	{/if}
{/if}
