import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import type { ProjectT } from '$lib/types';
import { projects as prj } from '$lib/store';
import { page } from '$app/stores';
import { get } from 'svelte/store';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export function getProjects() {
	if (!localStorage.getItem('projects')) {
		localStorage.setItem('projects', JSON.stringify([]));
	}
	return JSON.parse(localStorage.getItem('projects')!) as ProjectT[];
}

export function setProjects(projects: ProjectT[], updateGlobalValue = false) {
	localStorage.setItem('projects', JSON.stringify(projects));
	localStorage.setItem('lastUpdated', new Date().toISOString());
	if (updateGlobalValue) prj.set(projects);
	sync(projects);
}

export function updateProject(project: ProjectT) {
	const projects = getProjects();
	setProjects(
		projects.map((p) => {
			if (p.id === project.id) {
				return project;
			}
			return p;
		}),
		true
	);
}

export async function sync(projects?: ProjectT[]) {
	if (navigator.onLine && get(page).data.session) {
		if (!projects) {
			projects = getProjects();
		}

		const masterPassword = localStorage.getItem('password')!;

		let encoded: string;

		try {
			encoded = await encode(masterPassword, { projects, lastUpdated: new Date().toISOString() });
		} catch {
			return { success: false, code: 'password' };
		}

		const res = await fetch('/api/sync', {
			method: 'POST',
			body: encoded
		});
		return { success: res.ok, code: 'network' };
	}
	return { success: false, code: 'offline' };
}

export async function encode(
	masterPassword: string,
	jsonObject: { projects: ProjectT[]; lastUpdated: string }
): Promise<string> {
	const passwordKey = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(masterPassword),
		{ name: 'PBKDF2' },
		false,
		['deriveKey']
	);

	const salt = crypto.getRandomValues(new Uint8Array(16));
	const derivedKey = await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		passwordKey,
		{ name: 'AES-GCM', length: 256 },
		true,
		['encrypt', 'decrypt']
	);

	const text = JSON.stringify(jsonObject);

	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encodedData = new TextEncoder().encode(text);
	const encryptedData = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: iv
		},
		derivedKey,
		encodedData
	);

	const combinedArray = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
	combinedArray.set(salt);
	combinedArray.set(iv, salt.length);
	combinedArray.set(new Uint8Array(encryptedData), salt.length + iv.length);

	const combinedArrayString = String.fromCharCode(...combinedArray);
	return btoa(combinedArrayString);
}

export async function decode(
	masterPassword: string,
	base64String: string
): Promise<{ projects: ProjectT[]; lastUpdated: string }> {
	const combinedArray = new Uint8Array(
		atob(base64String)
			.split('')
			.map((c) => c.charCodeAt(0))
	);

	const salt = combinedArray.slice(0, 16);
	const iv = combinedArray.slice(16, 28);
	const encryptedData = combinedArray.slice(28);

	const passwordKey = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(masterPassword),
		{ name: 'PBKDF2' },
		false,
		['deriveKey']
	);

	const derivedKey = await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		passwordKey,
		{ name: 'AES-GCM', length: 256 },
		true,
		['encrypt', 'decrypt']
	);

	const decryptedData = await crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv: iv
		},
		derivedKey,
		encryptedData
	);

	return JSON.parse(new TextDecoder().decode(decryptedData));
}
