// deno-lint-ignore-file
import { verify, create } from 'https://deno.land/x/djwt/mod.ts';
import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts';
import { menu, orders, users, UsersSchema } from './db.ts';

const authenticate = async (request: any) => {
	try {
		const bearerHeader = request.headers.get('authorization');
		if (bearerHeader) {
			console.log(bearerHeader);
			const token = bearerHeader.split(' ')[1];
			const decoded = await verify(token, 'secretKey', 'HS512');
			return decoded?.user;
		}
	} catch (err) {
		console.error(err);
	}
};
// const authenticate = async (token: string) => {
// 	try {
// 		const decoded: any = await verify(token, 'secretKey', 'HS512');
// 		return decoded?.user;
// 	} catch (err) {
// 		console.error(err);
// 	}
// };

// ######################################################################################################################################
// Login

// POST Login Form
export const postLogin = async ({ request, response }: { request: any; response: any }) => {
	const email = request.body.email;
	const password = request.body.password;
	const userType = request.body.user;

	if (!email || !password) response.status = 400;
	else {
		try {
			const matchedUser = await users.findOne({ email: email, customer: userType == 1 });

			if (matchedUser) {
				if (await bcrypt.compare(password, matchedUser.password)) {
					const token = await create(
						{ alg: 'HS512', typ: 'JWT' },
						{
							user: {
								_id: matchedUser._id,
								first_name: matchedUser.first_name,
								last_name: matchedUser.last_name,
								customer: matchedUser.customer,
							},
							exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3, // 3 hours
						},
						'secretKey'
					);
					response.status = 202;
					response.body = { token };
				}
			} else response.status(400).send('Could not find user');
		} catch (err) {
			console.log(err);
			response.status = 500;
		}
	}
};

// GET Login Check
export const getLogin = async ({ request, response }: { request: any; response: any }) => {
	const user = await authenticate(request);
	response.status = 200;
	response.body = { user };
};

// ######################################################################################################################################
// Register

// POST registration form
export const postRegister = async ({ request, response }: { request: any; response: any }) => {
	const first_name = request.body.first_name;
	const last_name = request.body.last_name;
	const email = request.body.email;

	const password = request.body.password;
	if (!last_name || !email || !password) response.status = 400;
	else {
		try {
			const hashedPassword = await bcrypt.hash(password);
			await users.insertOne({
				first_name: first_name,
				last_name: last_name,
				email: email,
				password: hashedPassword,
				customer: request.body.user == 1,
				date: new Date(),
			});
			response.status = 201;
		} catch (err) {
			console.log(err);
			response.status = 500;
		}
	}
};

// ######################################################################################################################################
// Customers

// GET menu items
export const getMenu = async ({ request, response }: { request: any; response: any }) => {
	try {
		const result = await menu.find();
		response.status = 200;
		response.body = { result };
	} catch (err) {
		response.status = 500;
	}
};

// GET all orders ready for pickup
export const getReadyOrders = async ({ request, response }: { request: any; response: any }) => {
	try {
		const allReadyOrders = await orders
			.find({ cancelled: false, notified_customer: true })
			.sort({ created_at: -1 });
		response.status = 200;
		response.body = { allReadyOrders };
	} catch (err) {
		console.error(err);
		response.status = 500;
	}
};

// POST new order
export const postSubmitOrder = async ({ request, response }: { request: any; response: any }) => {
	const user: UsersSchema | any = await authenticate(request);
	const items = Object.keys(request.body);

	if (user && items && items.length > 0) {
		try {
			// Get the items in the order
			let cost = 0;
			const foundItems = await Promise.all(
				items.map(async (item: any) => {
					const id = item.split('_')[0];
					const quantity = item.split('_')[1];
					const foundItem = await menu.findOne({ _id: id });
					if (foundItem) {
						cost += foundItem.price * quantity;
						return {
							item_id: foundItem._id,
							name: foundItem.name,
							quantity: quantity,
							price: foundItem.price,
						};
					}
					return null;
				})
			);

			// Place the Order
			await orders.insertOne({
				first_name: user.first_name,
				last_name: user.last_name,
				customer_id: user._id,
				items: foundItems.filter(Boolean).map((item) => {
					if (item)
						return {
							item_id: item.item_id,
							name: item.name,
							quantity: item.quantity,
							price: item.price,
						};
				}),
				cost: cost,
				cancelled: false,
				created_at: new Date(),
				notified_customer: false,
			});
			response.status = 201;
		} catch (err) {
			console.error(err);
			response.status = 500;
		}
	} else response.status = 400;
};

// GET past orders of a customer
export const getOrders = async ({ request, response }: { request: any; response: any }) => {
	const user: UsersSchema | any = await authenticate(request);

	if (user) {
		try {
			const usersPastOrders = await orders.find({ customer_id: user._id }).sort({ created_at: -1 });
			response.status = 200;
			response.body = { usersPastOrders };
		} catch (err) {
			console.error(err);
			response.status = 500;
		}
	} else response.status = 400;
};

// POST check past order
export const postCheckOrder = async ({ request, response }: { request: any; response: any }) => {
	const user: UsersSchema | any = await authenticate(request);
	const order_id = request.body.order_id;

	if (user && order_id) {
		try {
			const pastOrder = await orders.findOne({ _id: order_id, customer_id: user._id });
			if (pastOrder) {
				response.status = 200;
				response.body = { pastOrder };
			}
		} catch (err) {
			console.error(err);
			response.status = 500;
		}
	} else response.status = 400;
};

// POST Cancel past order
export const postCancelOrder = async ({ request, response }: { request: any; response: any }) => {
	const user: UsersSchema | any = await authenticate(request);
	const order_id = request.body.order_id;

	if (user && order_id) {
		try {
			await orders.updateOne(
				{ _id: order_id, customer_id: user._id },
				{
					$set: {
						cancelled: true,
						completed: true,
					},
				}
			);
			response.status = 200;
		} catch (err) {
			console.error(err);
			response.status = 500;
		}
	} else response.status = 400;
};

// ######################################################################################################################################
// Employees

// POST add menu item
export const postAddMenuItem = async ({ request, response }: { request: any; response: any }) => {
	const name = request.body.name;
	const size = request.body.size;
	const price = request.body.price;
	const description = request.body.description;
	if (!name || !size || !price || !description) response.status = 400;
	else {
		const user: UsersSchema | any = await authenticate(request);

		if (user && !user.customer) {
			try {
				await menu.insertOne({
					name: name,
					size: size,
					price: price,
					description: description,
					removed: false,
					date: new Date(),
				});
				response.status = 201;
			} catch (err) {
				console.error(err);
				response.status = 500;
			}
		} else response.status = 400;
	}
};

// POST delete menu item
export const postDeleteMenuItem = async ({ request, response }: { request: any; response: any }) => {
	const menu_id = request.body.menu_id;
	const user: UsersSchema | any = await authenticate(request);

	if (user && menu_id && !user.customer) {
		try {
			await menu.deleteOne({ _id: menu_id });
			response.status = 200;
		} catch (err) {
			console.error(err);
			response.status = 500;
		}
	} else response.status = 400;
};

// GET all open orders
export const getAllOpenOrders = async ({ request, response }: { request: any; response: any }) => {
	const user: UsersSchema | any = await authenticate(request);

	if (user && !user.customer) {
		try {
			const allOpenOrders = await orders
				.find({ cancelled: false, notified_customer: false })
				.sort({ created_at: 1 });
			response.status = 200;
			response.body = { allOpenOrders };
		} catch (err) {
			console.error(err);
			response.status = 500;
		}
	} else response.status = 400;
};

// POST order ready for pickup/notifying customer
export const postInformCustomer = async ({ request, response }: { request: any; response: any }) => {
	const user: UsersSchema | any = await authenticate(request);
	const order_id = request.body.order_id;

	if (user && order_id && !user.customer) {
		try {
			await orders.updateOne(
				{ _id: order_id },
				{
					$set: {
						notified_customer: true,
						finished_at: new Date(),
					},
				}
			);
			response.status = 200;
		} catch (err) {
			console.error(err);
			response.status = 500;
		}
	} else response.status = 400;
};
