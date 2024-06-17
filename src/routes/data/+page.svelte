<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { alert } from '$lib/store';
	import { setProjects } from '$lib/utils';

	function backup() {
		if (!localStorage.getItem('projects')) {
			$alert = {
				show: true,
				danger: true,
				title: 'No projects found',
				description: 'There are no projects to backup'
			};
			return;
		}

		const projects = localStorage.getItem('projects')!;

		const blob = new Blob([projects], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `SelfStats ${new Date().toISOString()}.json`;
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	function load() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files![0];

			const fileExt = file.name.split('.').pop();
			if (fileExt?.toLowerCase() !== 'json') {
				$alert = {
					show: true,
					danger: true,
					title: 'Invalid file',
					description: 'Please select a valid JSON file'
				};
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				const projects = JSON.parse(e.target!.result as string);
				localStorage.setItem('projects', JSON.stringify(projects));
				$alert = {
					show: true,
					danger: false,
					title: 'Backup loaded',
					description: 'Projects have been loaded successfully'
				};
			};
			reader.readAsText(file);
		};
		input.click();
		input.remove();
	}

	function reset() {
		setProjects([], true);

		$alert = {
			show: true,
			danger: false,
			title: 'Reset',
			description: 'Projects have been reset successfully'
		};
	}
</script>

<div
	class="flex items-center justify-center gap-2 flex-col"
	style={`height: calc(var(--fh) - 36px - 4.5rem)`}
>
	<Button class="w-32" size="sm" variant="outline" on:click={load}>Load</Button>
	<Button class="w-32" size="sm" variant="outline" on:click={backup}>Backup</Button>
	<Button class="w-32" size="sm" variant="destructive" on:click={reset}>Reset</Button>
</div>
