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
const container: string = 'localhost';
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

// // HTML files for testing post forms
// app.use('/', express.static(path.join(__dirname, 'pages')));

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
	const decoded: any = jwt.verify(token, 'secretKey');
	return decoded?.user;
};

// // ######################################################################################################################################

// // Main Page
// app.get('/', (req, res) => {
// 	console.log(token, auth_id, customer);
// 	if (auth_id !== null) res.redirect(`/?token=${token}`);
// 	res.sendFile(path.join(__dirname, 'pages', 'index.html'));
// });
// app.get('/main', (req, res) => {
// 	if (auth_id !== null) res.redirect(`/?token=${token}`);
// 	else res.redirect(`/`);
// });

// // ######################################################################################################################################
// // Login

// // GET Login page
// app.get('/login', (req, res) => {
// 	console.log(token, auth_id, customer);
// 	if (auth_id !== null) res.redirect(`/?token=${token}`);
// 	else res.sendFile(path.join(__dirname, 'pages', 'login.html'));
// });

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
						exp: Math.floor(Date.now() / 1000) + 60 * 60,
					},
					'secretKey'
				);

				console.log(token);
				console.log('hi');
				res.status(202).json({ token: token });
			}
		} else res.status(400).send('Could not find user');

		// res.redirect(`/?token=${resultTokens[resultTokens.length - 1].token}`);
	} catch (err) {
		console.log(err);
		res.status(500).send();
		// res.sendFile(path.join(__dirname, 'pages', 'login.html'));
	}
});

// // ######################################################################################################################################
// // Register

// // GET registration page
// app.get('/register', (req, res) => {
// 	console.log(token, auth_id, customer);
// 	if (auth_id !== null) res.redirect(`/?token=${token}`);
// 	else res.sendFile(path.join(__dirname, 'pages', 'register.html'));
// });

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
// // Sign Out
// app.get('/signout', (req, res) => {
// 	token = null;
// 	auth_id = null;
// 	customer = null;
// 	res.redirect('/login');
// });

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

// // GET order page
// app.get('/customerorders', (req, res) => {
// 	if (auth_id === null) res.redirect(`/login?token=${token}`);
// 	else if (auth_id !== null && !customer) {
// 		res.redirect(`/employeerevoked?token=${token}`);
// 	} else res.sendFile(path.join(__dirname, 'pages', 'customer-orders.html'));
// });

// app.get('/employeerevoked', async (req, res) => {
// 	res.sendFile(path.join(__dirname, 'pages', 'employee-revoked.html'));
// });

// // GET past orders
// app.get('/orders', (req, res) => {
// 	if (auth_id === null) res.redirect(`/login?token=${token}`);
// 	else red.sendFile(path.join(__dirname, 'pages', 'past-orders.html'));
// });

// POST new order
app.post('/submitorder', async (req, res) => {
	const user = await authenticate(req.token);
	const items = Object.values(req.body);

	if (user && items) {
		try {
			// Get the items in the order
			let timeRequired = 0;
			let cost = 0;
			const foundItems = await Promise.all(
				items.map(async (item: any) => {
					const id = item.split('_')[0];
					const quantity = item.split('_')[1];
					const foundItem = await menu.findById(id);
					if (foundItem) {
						cost += foundItem.price * quantity;
						if (foundItem.time_required > timeRequired) timeRequired = foundItem.time_required;
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

			// Get Time required for order
			let completionTime = new Date();
			completionTime.setMinutes(completionTime.getMinutes() + timeRequired);

			// Place the Order
			const order = new orders({
				first_name: user.first_name,
				last_name: user.second_name,
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
				finished_at: completionTime,
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
			const usersPastOrders = await orders.find({ customer_id: user._id });
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

// // GET employee portal
// app.get('/employeeportal', async (req, res) => {
// 	console.log(token, auth_id, customer);
// 	if (auth_id === null) res.redirect(`/login?token=${token}`);
// 	else if (auth_id !== null && customer) {
// 		res.redirect(`/customerrevoked?token=${token}`);
// 	} else res.sendFile(path.join(__dirname, 'pages', 'employee-portal.html'));
// });

// app.get('/customerrevoked', async (req, res) => {
// 	res.sendFile(path.join(__dirname, 'pages', 'customer-revoked.html'));
// });

// POST add menu item
app.post('/addmenuitem', async (req, res) => {
	const name = req.body.name;
	const size = req.body.size;
	const price = req.body.price;
	const time_required = req.body.time_required;
	const description = req.body.description;
	if (!name || !size || !price || !time_required || !description) res.status(400).send();

	const user = await authenticate(req.token);

	if (user) {
		try {
			const usersPastOrders = await orders.find({ customer_id: user._id });
			const menuItem = new menu({
				name: name,
				size: size,
				price: price,
				time_required: time_required,
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

	if (user && menu_id) {
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

	if (user) {
		try {
			const allOpenOrders = await orders
				.find({ cancelled: false, finished_at: { $gt: new Date() } })
				.sort({ created_at: -1 });
			res.status(200).json(allOpenOrders);
		} catch (err) {
			console.error(err);
			res.status(500).send();
		}
	} else res.status(400).send();
});

// GET all completed orders that the customer hasn't recieved yet
app.get('/allcompletedorders', async (req, res) => {
	const user = await authenticate(req.token);

	if (user) {
		try {
			const allCompletedOrders = await orders
				.find({ cancelled: false, notified_customer: false, finished_at: { $lt: new Date() } })
				.sort({ created_at: -1 });
			res.status(200).json(allCompletedOrders);
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

	if (user && order_id) {
		try {
			await orders.updateOne(
				{ _id: order_id },
				{
					$set: {
						notified_customer: true,
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

// ######################################################################################################################################

// Start Server
const server = app.listen(PORT, HOST, () => {
	console.log(`Running on Host: ${HOST} Port: ${PORT}`);
});
