export type ProjectT = {
	id: number;
	name: string;
	description: string | null;
	user_id: string;
	descriptors: DescriptorT[];
	data: DataT[];
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
	data_id: string;
	name: string;
	description: string | null;
	value: string;
	type: string;
	project_id: number;
};
