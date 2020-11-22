import mongoose, { Schema, Types, model, Document } from 'mongoose';

const menuSchema = new Schema(
	{
		name: String,
		size: String,
		price: Number,
		time_required: Number,
		description: String,
		removed: Boolean,
		date: Date,
	},
	{
		collection: 'menu',
	}
);

interface MenuDoc extends mongoose.Document {
	name: string;
	size: string;
	price: number;
	time_required: number;
	description: string;
	removed: boolean;
	date: Date;
}

const usersSchema = new Schema(
	{
		first_name: String,
		last_name: String,
		email: String,
		password: String,
		customer: Boolean,
		date: Date,
	},
	{
		collection: 'users',
	}
);

interface UsersDoc extends mongoose.Document {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	customer: boolean;
	date: Date;
}

const ordersSchema = new Schema(
	{
		customer: {
			first_name: String,
			last_name: String,
			customer_id: Types.ObjectId,
		},
		items: [
			{
				item_id: Types.ObjectId,
				quantity: Number,
			},
		],
		cancelled: Boolean,
		created_at: Date,
		finished_at: Date,
		completed: Boolean,
		notified_customer: Boolean,
	},
	{
		collection: 'orders',
	}
);

interface OrdersDoc extends mongoose.Document {
	customer: {
		first_name: string;
		last_name: string;
		customer_id: Types.ObjectId;
	};
	items: [
		{
			item_id: Types.ObjectId;
			quantity: number;
		}
	];
	cancelled: boolean;
	created_at: Date;
	finished_at: Date;
	completed: boolean;
	notified_customer: boolean;
}

// const tokensSchema = new Schema(
// 	{
// 		user: {
// 			user_id: Types.ObjectId,
// 			customer: Boolean,
// 		},
// 		token: String,
// 		last_used: Date,
// 	},
// 	{
// 		collection: 'tokens',
// 	}
// );

// interface TokensDoc extends mongoose.Document {
// 	user: {
// 		user_id: Types.ObjectId;
// 		customer: boolean;
// 	};
// 	token: string;
// 	last_used: Date;
// }

const menu = model<MenuDoc>('menu', menuSchema);
const users = model<UsersDoc>('users', usersSchema);
const orders = model<OrdersDoc>('orders', ordersSchema);
// const tokens = model<TokensDoc>('tokens', tokensSchema);

export { menu, users, orders };
