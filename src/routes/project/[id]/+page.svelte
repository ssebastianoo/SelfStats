<script lang="ts">
	import Project from '$lib/components/Project.svelte';

	export let data;

	// onMount(async () => {
	// 	const { data: projectData } = await supabase
	// 		.from('projects')
	// 		.select('*')
	// 		.eq('user_id', $user!.id)
	// 		.eq('id', data.id);

	// 	const { data: descriptorsData } = await supabase
	// 		.from('descriptors')
	// 		.select('*')
	// 		.eq('project_id', data.id);

	// 	const { data: datasData } = await supabase.from('data').select('*').eq('project_id', data.id);
	// 	const { data: valuesData } = await supabase
	// 		.from('values')
	// 		.select('*')
	// 		.eq('project_id', data.id);

	// 	if (projectData && projectData.length > 0) {
	// 		project = { ...projectData[0], descriptors: descriptorsData };

	// 		if (datasData) {
	// 			project.data = datasData;

	// 			if (valuesData) {
	// 				for (const value of valuesData) {
	// 					const linkedData = project.data.find((data) => data.id === value.data_id);
	// 					if (linkedData) {
	// 						if (!linkedData.values) linkedData.values = [];
	// 						linkedData.values.push(value);
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}
	// });
</script>

<div class="flex flex-col justify-center items-center h-[var(--fh)]">
	<Project project={data.project} />
</div>
