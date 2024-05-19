<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		setTimeout(() => {
			goto('/');
		}, 500);
	});
</script>

<div class="flex justify-center">
	<p>Loggin you in...</p>
</div>
