import { writable } from 'svelte/store';

export const user = writable<{ id: string } | null>(null);
