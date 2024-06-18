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

	let chartLineData: ChartData<'line', (number | Point)[]> = {
		labels: [],
		datasets: []
	};

	let loaded = false;

	function randomRGBA() {
		return `rgba(${Math.floor(100 + Math.random() * 155)}, ${Math.floor(100 + Math.random() * 155)}, ${Math.floor(100 + Math.random() * 155)}, 0.4)`;
	}

	onMount(() => {
		const descriptors = $project.descriptors.filter((descriptor) => {
			return descriptor.type === 'number';
		});

		chartLineData.datasets = descriptors.map((descriptor, index) => {
			const color = randomRGBA();

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

		const numberValues = $project.data.find((data) => {
			return data.values.some((value) => value.type === 'number');
		});
		console.log(numberValues);

		if (numberValues) {
			let done = false;
			let count = 0;

			while (done === false) {
				let date = new Date(numberValues.created_at);
				date.setDate(date.getDate() + count);

				console.log(date);

				chartLineData.labels!.push(date.toLocaleDateString());

				const formatted = date.toISOString().split('T')[0];

				const data = $project.data.filter((d) => {
					return d.created_at.split('T')[0] === formatted;
				});

				console.log(data);

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
</script>

{#if loaded}
	<Line data={chartLineData} height="120" />
{/if}
