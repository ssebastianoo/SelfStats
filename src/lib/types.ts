export type ProjectT = {
	id: number;
	name: string;
	description: string | null;
	descriptors: DescriptorT[];
	data: DataT[];
	showEmptyDays: boolean;
};

export type DataT = {
	id: number;
	project_id: number;
	created_at: string;
	values: ValueT[];
};

export type DescriptorT = {
	id: number;
	name: string;
	description: string | null;
	project_id: number;
	type: string;
};

export type ValueT = {
	id: number;
	descriptor_id: number;
	name: string;
	description: string | null;
	value: string;
	type: string;
	project_id: number;
};
