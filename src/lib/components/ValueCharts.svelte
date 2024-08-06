<script lang="ts">
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
	import type { DataT } from '$lib/types';
	import { Button } from '$lib/components/ui/button';

	export let period: DataT[];

	let chartLineData: ChartData<'line', (number | Point)[]> = {
		labels: [],
		datasets: []
	};

	let loaded = false;
	let capturing = false;

	onMount(() => {
		const descriptors = $project.descriptors.filter((descriptor) => {
			return descriptor.type === 'number';
		});

		chartLineData.datasets = descriptors.map((descriptor, index) => {
			let color: string;

			if (index === 0) {
				color = 'rgb(121,54,236)';
			} else {
				let r = 121 + 50 * index;
				let g = 54 + 50 * index;
				let b = 236 + 50 * index;

				if (r > 255) r = 255;
				if (g > 255) g = 255;
				if (b > 255) b = 255;

				color = `rgb(${r},${g},${b})`;
			}

			return {
				label: descriptor.name,
				backgroundColor: color,
				borderColor: color,
				borderWidth: 3,
				data: [],
				lineTension: 0.3,
				id: descriptor.id
			};
		});

		const numberValues = period.find((data) =>
			data.values.some((value) => value.type === 'number')
		);

		if (numberValues) {
			let done = false;
			let count = 0;

			while (done === false) {
				let date = new Date(numberValues.created_at);
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
					for (const dataset of chartLineData.datasets) {
						dataset.data.push(0);
					}
				} else {
					for (const dataset of chartLineData.datasets) {
						let totalValue = 0;
						for (const d of data) {
							// @ts-ignore
							const value = d.values.find((value) => value.descriptor_id === dataset.id);
							if (value) {
								totalValue += parseFloat(value.value);
							}
						}
						dataset.data.push(totalValue);
					}
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
