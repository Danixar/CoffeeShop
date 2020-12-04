interface Menu {
	_id: string;
	name: string;
	size: string;
	price: number;
	time_required: number;
	description: string;
	removed: boolean;
	date: Date;
}

interface User {
	_id: string;
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	customer: boolean;
	date: Date;
}

interface Order {
	_id: string;
	first_name: string;
	last_name: string;
	customer_id: string;
	items: [
		{
			item_id: string;
			name: string;
			quantity: number;
			price: number;
		}
	];
	cost: number;
	cancelled: boolean;
	created_at: Date;
	finished_at: Date;
	notified_customer: boolean;
}

export type { Menu, User, Order };
