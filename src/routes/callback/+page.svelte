<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/');
	});
</script>

<div class="flex justify-center">
	<p>Loggin you in...</p>
</div>