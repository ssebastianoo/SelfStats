import { writable } from 'svelte/store';
import type { ProjectT } from './types';

export const user = writable<{ id: string } | null>(null);
export const project = writable<ProjectT>();
