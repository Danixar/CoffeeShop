import { MongoClient } from 'https://deno.land/x/mongo/mod.ts';

// Basic Info
const databaseHost = 27017;
// const container = 'dbPartC';
const container = 'localhost';
const database = 'coffeeShop';

// Connecting to client
const client = new MongoClient();
await client.connect(`mongodb://${container}:${databaseHost}`);

// Setting up schemas
export interface MenuSchema {
	_id?: number;
	name: string;
	size: string;
	price: number;
	time_required: number;
	description: string;
	removed: boolean;
	date: Date;
}

export interface UsersSchema {
	_id?: number;
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	customer: boolean;
	date: Date;
}

export interface OrdersSchema {
	_id?: number;
	first_name: string;
	last_name: string;
	customer_id: number;
	items: [
		{
			item_id: number;
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

// Connecting to Database and adding schemas
const db = await client.database(database);
const menu = db.collection<MenuSchema>('menu');
const users = db.collection<UsersSchema>('users');
const orders = db.collection<OrdersSchema>('orders');

// Exporting
console.log(`Connected to MongoDB Database ${database} on ${container}`);
export { menu, users, orders };
