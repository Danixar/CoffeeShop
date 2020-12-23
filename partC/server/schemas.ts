import { MongoClient, Bson } from 'https://deno.land/x/mongo/mod.ts';

// const menuSchema = new Schema(
// 	{
// 		name: String,
// 		size: String,
// 		price: Number,
// 		time_required: Number,
// 		description: String,
// 		removed: Boolean,
// 		date: Date,
// 	},
// 	{
// 		collection: 'menu',
// 	}
// );

// interface MenuDoc extends mongoose.Document {
// 	name: string;
// 	size: string;
// 	price: number;
// 	time_required: number;
// 	description: string;
// 	removed: boolean;
// 	date: Date;
// }

// const usersSchema = new Schema(
// 	{
// 		first_name: String,
// 		last_name: String,
// 		email: String,
// 		password: String,
// 		customer: Boolean,
// 		date: Date,
// 	},
// 	{
// 		collection: 'users',
// 	}
// );

// interface UsersDoc extends mongoose.Document {
// 	first_name: string;
// 	last_name: string;
// 	email: string;
// 	password: string;
// 	customer: boolean;
// 	date: Date;
// }

// const ordersSchema = new Schema(
// 	{
// 		first_name: String,
// 		last_name: String,
// 		customer_id: Types.ObjectId,
// 		items: [
// 			{
// 				item_id: Types.ObjectId,
// 				name: String,
// 				quantity: Number,
// 				price: Number,
// 			},
// 		],
// 		cost: Number,
// 		cancelled: Boolean,
// 		created_at: Date,
// 		finished_at: Date,
// 		notified_customer: Boolean,
// 	},
// 	{
// 		collection: 'orders',
// 	}
// );

// interface OrdersDoc extends mongoose.Document {
// 	first_name: string;
// 	last_name: string;
// 	customer_id: Types.ObjectId;
// 	items: [
// 		{
// 			item_id: Types.ObjectId;
// 			name: string;
// 			quantity: number;
// 			price: number;
// 		}
// 	];
// 	cost: number;
// 	cancelled: boolean;
// 	created_at: Date;
// 	finished_at: Date;
// 	notified_customer: boolean;
// }

// const menu = model<MenuDoc>('menu', menuSchema);
// const users = model<UsersDoc>('users', usersSchema);
// const orders = model<OrdersDoc>('orders', ordersSchema);

// export { menu, users, orders };
