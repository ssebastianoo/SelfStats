import { writable } from 'svelte/store';
import type { ProjectT } from './types';

export const user = writable<{ id: string } | null>(null);
export const project = writable<ProjectT>();
export const projects = writable<ProjectT[]>([]);
export const alert = writable({
	show: false,
	danger: false,
	title: '',
	description: '' as string | null
});
export const loading = writable(false);
