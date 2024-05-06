<script lang="ts">
	import Project from '$lib/components/Project.svelte';

	export let data;
	export let form;

	if (form?.success) {
		console.log(form.descriptor);

		data.project.descriptors.push(form.descriptor);
	}
</script>

<div class="flex flex-col justify-center items-center h-[var(--fh)]">
	<Project project={data.project} />
</div>
