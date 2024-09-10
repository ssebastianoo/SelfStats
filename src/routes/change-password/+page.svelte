<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { alert } from '$lib/store';
	import { decode, sync } from '$lib/utils';

	onMount(async () => {
		if (!$page.data.session) {
			goto('/signin');
		}
	});

	async function changePassword(e: Event) {
		const target = e.target as HTMLFormElement;

		const oldPassword = target.oldPassword.value;

		const res = await fetch('/api/sync');
		if (!res.ok) {
			$alert = {
				show: true,
				title: 'Error',
				danger: true,
				description: 'There was an error changing the password. Please try again.'
			};
			return;
		}

		const raw = await res.text();

		try {
			await decode(oldPassword, raw);
		} catch (e) {
			$alert = {
				show: true,
				title: 'Wrong password',
				danger: true,
				description: 'The old password is wrong. Please try again.'
			};
			return;
		}

		localStorage.setItem('password', target.newPassword.value);
		const syncRes = await sync();
		if (!syncRes.success) {
			$alert = {
				show: true,
				title: 'Error',
				danger: true,
				description: 'There was an error changing the password. Please try again.'
			};
			return;
		} else {
			$alert = {
				show: true,
				title: 'Password changed',
				danger: false,
				description: 'Your password has been changed successfully.'
			};
		}
		target.reset();
	}
</script>

<form on:submit|preventDefault={changePassword} class="w-96 flex flex-col gap-2">
	<h1>Change password</h1>
	<Input name="oldPassword" type="password" placeholder="Old password" required />
	<Input name="newPassword" type="password" placeholder="New password" required />
	<Button type="submit" class="w-40" size="sm">Change password</Button>
</form>
