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
	import { Button } from '$lib/components/ui/button';

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
	let capturing = false;

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

	function screenshot() {
		capturing = true;

		setTimeout(() => {
			const canvas = document.getElementById('captureElement')?.querySelector('canvas');
			const img = canvas?.toDataURL('image/png');

			if (img) {
				const link = document.createElement('a');
				link.download = 'chart.png';
				link.href = img;
				link.click();
				link.remove();
			}
			capturing = false;
		}, 200);
	}
</script>

{#if loaded}
	<Button on:click={screenshot} variant="outline" class="h-[38px] mb-3">Save</Button>

	<div>
		<Line data={chartLineData} options={{ maintainAspectRatio: false }} height={250} />
	</div>

	{#if capturing}
		<div class="absolute pointer-events-none" id="captureElement">
			<Line
				data={chartLineData}
				options={{ maintainAspectRatio: false }}
				width={1920}
				height={1080}
			/>
		</div>
	{/if}
{/if}
