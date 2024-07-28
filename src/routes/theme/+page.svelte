<script lang="ts">
	import { onMount } from 'svelte';

	let color = '#7936ff';

	function checkColor(e: Event) {
		const target = e.target as HTMLInputElement;

		document.documentElement.style.setProperty('--primary', target.value);
		localStorage.setItem('theme', target.value);
	}

	onMount(() => {
		if (localStorage.getItem('theme')) {
			color = localStorage.getItem('theme')!;
		}
	});
</script>

<input type="color" value={color} on:input={checkColor} />
