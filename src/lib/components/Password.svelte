<script lang="ts">
	import Button from './ui/button/button.svelte';
	import Input from './ui/input/input.svelte';
	import { decode, sync } from '$lib/utils';
	import { alert } from '$lib/store';
	import type { ProjectT } from '$lib/types';

	export let firstTime: boolean;
	export let error: boolean;

	let open = true;

	async function checkPassword(e: Event) {
		const target = e.target as HTMLFormElement;
		const password = target.password.value;

		if (firstTime) {
			localStorage.setItem('password', password);
			const status = await sync();
			if (status.success) {
				$alert = {
					show: true,
					danger: false,
					title: 'Success',
					description: 'Your data has been successfully synced'
				};
				open = false;
			} else {
				if (status.code === 'network') {
					$alert = {
						show: true,
						danger: true,
						title: 'Server error',
						description: 'Please try again later'
					};
				}
			}
			return;
		}

		const res = await fetch('/api/sync');
		const text = await res.text();

		let decoded: { projects: ProjectT[]; lastUpdated: string };

		try {
			decoded = await decode(password, text);
		} catch {
			$alert = {
				show: true,
				danger: true,
				title: 'Wrong password',
				description: 'The password you entered is wrong'
			};
			return;
		}

		localStorage.setItem('password', password);
		$alert = {
			show: true,
			danger: false,
			title: 'Success',
			description: 'Password is correct'
		};
		location.reload();
	}
</script>

<div class="flex justify-center">
	<div class="max-w-[400px] w-full">
		<div class="mb-1">
			{#if firstTime}
				<h2>Set a new password</h2>
				<p class="text-muted-foreground italic text-xs mb-2">
					This password will be used to encrypt your data, don't lose it.
				</p>
			{:else if error}
				<h2>Your password changed, please type it again</h2>
			{:else}
				<h2>Enter your password</h2>
			{/if}
		</div>
		<form class="flex flex-col gap-2" on:submit|preventDefault={checkPassword}>
			<Input
				placeholder={firstTime
					? "don't use the word password as password"
					: "you didn't use password as password right?"}
				type="password"
				name="password"
				required
			/>
			<div class="text-right">
				<Button type="submit" size="sm">Save</Button>
			</div>
		</form>
	</div>
</div>
