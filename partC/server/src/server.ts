// CMPT 353
// Evangellos Wiegers
// eaw568
// 11176620

// Modules and packages
import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { menu, users, orders } from './schemas';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import cors from 'cors';

// Port and Host
const PORT = 5000;
const HOST = '0.0.0.0';

// ######################################################################################################################################

// Database Assignment with table posts
const container: string = 'dbPartC';
// const container: string = 'localhost';
const database: string = 'coffeeShop';
mongoose
	.connect(`mongodb://${container}:27017/${database}`, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log(`Connected to MongoDB Database ${database} on ${container}`))
	.catch((err) => console.log(err));
const conn: mongoose.Connection = mongoose.connection;
conn.on('error', (err) => console.error(err));

// ######################################################################################################################################

// Create Server app
const app: Application = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// CORS Middleware
app.use(cors());

// Bad Authentication Middleware and Supporting function
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
	const bearerHeader = req.headers['authorization']; // Authorization: Bearer <access_token>
	if (bearerHeader) {
		try {
			const token = bearerHeader.split(' ')[1];
			req.token = token;
		} catch (err) {
			console.error(`Verification error for bearer header ${bearerHeader}`);
			console.error(err);
		}
	}
	next();
};
app.use(verifyToken);
const authenticate = async (token: string) => {
	try {
		const decoded: any = await jwt.verify(token, 'secretKey');
		return decoded?.user;
	} catch (err) {
		console.error(err);
	}
};

// // ######################################################################################################################################
// // Login

// POST Login Form
app.post('/login', async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const userType = req.body.user;

	// if (!email || !password) res.sendFile(path.join(__dirname, 'pages', 'login.html'));
	if (!email || !password) res.status(400).send();

	try {
		const matchedUser = await users.findOne({ email: email, customer: userType == 1 });

		if (matchedUser) {
			if (await bcrypt.compare(password, matchedUser.password)) {
				const token = await jwt.sign(
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
				res.status(202).json({ token });
			}
		} else res.status(400).send('Could not find user');

		// res.redirect(`/?token=${resultTokens[resultTokens.length - 1].token}`);
	} catch (err) {
		console.log(err);
		res.status(500).send();
		// res.sendFile(path.join(__dirname, 'pages', 'login.html'));
	}
});

// GET Login Check
app.get('/login', async (req, res) => {
	const user = await authenticate(req.token);
	res.status(200).json(user);
});

// // ######################################################################################################################################
// // Register

// POST registration form
app.post('/register', async (req, res) => {
	const first_name = req.body.first_name;
	const last_name = req.body.last_name;
	const email = req.body.email;
	const password = req.body.password;
	if (!last_name || !email || !password) res.status(400).send('Invalid Input Parameters');

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new users({
			first_name: first_name,
			last_name: last_name,
			email: email,
			password: hashedPassword,
			customer: req.body.user == 1,
			date: new Date(),
		});

		await user.save();
		res.status(201).send();
		// res.redirect('/login');
	} catch (err) {
		console.log(err);
		res.status(500).send();
		// res.sendFile(path.join(__dirname, 'pages', 'register.html'));
	}
});

// // ######################################################################################################################################
// // Customers

// GET menu items
app.get('/menu', async (req, res) => {
	try {
		const result = await menu.find();
		res.status(200).json(result);
	} catch (err) {
		res.status(500).send('Failed to get menu items');
	}
});

// GET all orders ready for pickup
app.get('/readyorders', async (req, res) => {
	try {
		const allReadyOrders = await orders
			.find({ cancelled: false, notified_customer: true })
			.sort({ created_at: -1 });
		res.status(200).json(allReadyOrders);
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
});

// POST new order
app.post('/submitorder', async (req, res) => {
	const user = await authenticate(req.token);
	const items = Object.keys(req.body);

	if (user && items && items.length > 0) {
		try {
			// Get the items in the order
			let cost = 0;
			const foundItems = await Promise.all(
				items.map(async (item: any) => {
					const id = item.split('_')[0];
					const quantity = item.split('_')[1];
					const foundItem = await menu.findById(id);
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
			const order = new orders({
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
			await order.save();
			res.status(201).send();
		} catch (err) {
			console.error(err);
			res.status(500).send();
		}
	} else res.status(400).send();
});

// GET past orders of a customer
app.get('/getorders', async (req, res) => {
	const user = await authenticate(req.token);

	if (user) {
		try {
			const usersPastOrders = await orders.find({ customer_id: user._id }).sort({ created_at: -1 });
			res.status(200).json(usersPastOrders);
		} catch (err) {
			console.error(err);
			res.status(500).send();
		}
	} else res.status(400).send();
});

// POST check past order
app.post('/checkorder', async (req, res) => {
	const user = await authenticate(req.token);
	const order_id = req.body.order_id;

	if (user && order_id) {
		try {
			const pastOrder = await orders.findOne({ _id: order_id, customer_id: user._id });
			if (pastOrder) res.status(200).json(pastOrder);
		} catch (err) {
			console.error(err);
			res.status(500).send();
		}
	} else res.status(400).send();
});

// POST Cancel past order
app.post('/cancelorder', async (req, res) => {
	const user = await authenticate(req.token);
	const order_id = req.body.order_id;

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
			res.status(200).send();
		} catch (err) {
			console.error(err);
			res.status(500).send();
		}
	} else res.status(400).send();
});

// // ######################################################################################################################################
// // Employees

// POST add menu item
app.post('/addmenuitem', async (req, res) => {
	const name = req.body.name;
	const size = req.body.size;
	const price = req.body.price;
	const description = req.body.description;
	if (!name || !size || !price || !description) res.status(400).send();

	const user = await authenticate(req.token);

	if (user && !user.customer) {
		try {
			const usersPastOrders = await orders.find({ customer_id: user._id });
			const menuItem = new menu({
				name: name,
				size: size,
				price: price,
				description: description,
				removed: false,
				date: new Date(),
			});
			await menuItem.save();
			res.status(201).send();
		} catch (err) {
			console.error(err);
			res.status(500).send();
		}
	} else res.status(400).send();
});

// POST delete menu item
app.post('/deletemenuitem', async (req, res) => {
	const menu_id = req.body.menu_id;
	const user = await authenticate(req.token);

	if (user && menu_id && !user.customer) {
		try {
			await menu.deleteOne({ _id: menu_id });
			res.status(200).send();
		} catch (err) {
			console.error(err);
			res.status(500).send();
		}
	} else res.status(400).send();
});

// GET all open orders
app.get('/allopenorders', async (req, res) => {
	const user = await authenticate(req.token);

	if (user && !user.customer) {
		try {
			const allOpenOrders = await orders
				.find({ cancelled: false, notified_customer: false })
				.sort({ created_at: 1 });
			res.status(200).json(allOpenOrders);
		} catch (err) {
			console.error(err);
			res.status(500).send();
		}
	} else res.status(400).send();
});

// POST order ready for pickup/notifying customer
app.post('/informcustomer', async (req, res) => {
	const user = await authenticate(req.token);
	const order_id = req.body.order_id;

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
			res.status(200).json();
		} catch (err) {
			console.error(err);
			res.status(500).send();
		}
	} else res.status(400).send();
});

// ######################################################################################################################################

// Start Server
const server = app.listen(PORT, HOST, () => {
	console.log(`Running on Host: ${HOST} Port: ${PORT}`);
});
