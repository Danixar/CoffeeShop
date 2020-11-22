// CMPT 353
// Evangellos Wiegers
// eaw568
// 11176620

// Modules and packages
import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose, { Collection, mongo } from 'mongoose';
import bodyParser from 'body-parser';
import { menu, users, orders } from './schemas';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Port and Host
const PORT = 5000;
const HOST = '0.0.0.0';

// ######################################################################################################################################

// Database Assignment with table posts
const container: string = 'localhost';
const database: string = 'coffeeShop';
mongoose
	.connect(`mongodb://${container}:27017/${database}`, { useNewUrlParser: true })
	.then(() => console.log(`Connected to MongoDB Database ${database} on ${container}`))
	.catch((err) => console.log(err));
const conn: mongoose.Connection = mongoose.connection;
conn.on('error', (err) => console.error(err));
conn.on('open', () => {
	console.log(`${database} Opened`);
	conn.db.listCollections().toArray((err, collections) => {
		if (err) throw err;
		['menu', 'users', 'orders', 'tokens'].forEach((collection) => {
			// if (!(collections.map(col => col.name).indexOf(collection) >= 0))
		});
		console.log(collections);
	});
});

// ######################################################################################################################################

// Create Server app
const app: Application = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req: Request, res: Response) => {
	try {
		const menuItems = await menu.find();
		console.log(menuItems);
		res.json(menuItems);
	} catch (err) {
		res.status(500).json({ message: 'error!' });
	}
});

app.post('/test', async (req: Request, res: Response) => {
	try {
		const name = 'test';
		const size = 'Test';
		const price = 19.99;
		const time_required = 10;
		const description = 'test';
		const removed = false;
		const date = new Date();

		const item = new menu({
			name: name,
			size: size,
			price: price,
			time_required: time_required,
			description: description,
			removed: removed,
			date: date,
		});

		const newItem = await item.save();
		console.log(newItem);
		res.status(201).json(newItem);
	} catch (err) {
		res.status(500).json({ message: 'error!' });
	}
});

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
	if (decoded.user) return decoded.user;
	else return null;
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
		const matchedUsers = await users.find({ email: email, customer: userType == 1 });

		matchedUsers.every(async (matchedUser) => {
			if (bcrypt.compare(password, matchedUser.password)) {
				const token = await jwt.sign(
					{
						user: { _id: matchedUser._id, customer: matchedUser.customer },
						exp: Math.floor(Date.now() / 1000) + 60 * 60,
					},
					'secretKey'
				);
				// const submittingToken = new tokens({
				// 	user: {
				// 		user_id: matchedUser._id,
				// 		customer: matchedUser.customer,
				// 	},
				// 	token: token,
				// 	last_used: new Date(),
				// });
				// await submittingToken.save();

				res.status(202).json(token);
				return false;
			}
		});
		res.status(400).send('Could not find user');

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

// // GET menu items
// app.get('/menu', async (req, res) => {
// 	try {
// 		const result = await query(`SELECT * FROM menu_items WHERE removed = 0;`);
// 		res.send(result);
// 	} catch (err) {
// 		res.status(500).send('Failed to get menu items');
// 	}
// });

// // GET order page
// app.get('/customerorders', (req, res) => {
// 	console.log(token, auth_id, customer);
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

// // POST new order
// app.post('/submitorder', async (req, res) => {
// 	const items = Object.values(req.body);
// 	console.log(token, auth_id, customer);
// 	if (auth_id !== null && customer) {
// 		try {
// 			await query(`INSERT INTO orders(customer_id, created_at) VALUES (${auth_id}, now());`);

// 			const result = await query(`SELECT * FROM orders WHERE customer_id=${auth_id};`);

// 			let timeMinutes = 0;
// 			await Promise.all(
// 				items.map(async (item) => {
// 					let itemName = item.split('_')[0];
// 					let quantity = item.split('_')[1];
// 					await query(
// 						`INSERT INTO ordered_items(menu_id, order_id, quantity) VALUES (${itemName}, ${
// 							result[result.length - 1].order_id
// 						}, ${quantity});`
// 					);

// 					const menu_item = await query(`SELECT * FROM menu_items WHERE menu_id=${itemName};`);
// 					console.log(menu_item[0].time_required);
// 					if (menu_item[0].time_required > 0) timeMinutes = menu_item[0].time_required;
// 				})
// 			);

// 			await query(
// 				`UPDATE orders SET completed_at=ADDTIME(now(), "${timeMinutes * 100}") WHERE order_id = ${
// 					result[result.length - 1].order_id
// 				} and customer_id=${auth_id};`
// 			);

// 			res.send('Completed');
// 		} catch (err) {
// 			console.log(err);
// 			res.status(500).send('Invalid Input Parameters');
// 		}
// 	} else if (auth_id !== null && !customer) {
// 		res.send('Employees Cannot submit an order');
// 	} else res.status(400).send('Failed to submit order');
// });

// const check = async (order_id) => {
// 	const result = await query(`SELECT * FROM orders WHERE order_id = ${order_id};`);
// 	const resultItems = await query(`SELECT * FROM ordered_items WHERE order_id = ${order_id};`);
// 	const items = await Promise.all(
// 		resultItems.map(async (item) => {
// 			let itemCheck = await query(`SELECT * FROM menu_items WHERE menu_id=${item.menu_id};`);
// 			let firstItem = itemCheck[0];
// 			firstItem['quantity'] = item.quantity;
// 			return firstItem;
// 		})
// 	);
// 	const order = {
// 		order_id: order_id,
// 		finished: result[0].completed_at < new Date() || result[0].cancelled == 1,
// 		created: result[0].created_at,
// 		cancelled: result[0].cancelled == 1,
// 		cost: items
// 			.map((item) => item.price * item.quantity)
// 			.reduce((acc, cur) => acc * 1.15 + cur)
// 			.toFixed(2),
// 		items: items.map((item) => ' ' + item.quantity + ' ' + item.name),
// 	};

// 	return order;
// };

// // GET past orders
// app.get('/getorders', async (req, res) => {
// 	if (auth_id) {
// 		try {
// 			const sql = customer
// 				? `SELECT * FROM orders WHERE customer_id = ${auth_id} ORDER BY created_at DESC;`
// 				: `SELECT * FROM orders WHERE completed_at <= now() ORDER BY created_at ASC;`;
// 			const result = await query(sql);
// 			const items = await Promise.all(result.map(async (item) => await check(item.order_id)));

// 			res.send(items);
// 		} catch (err) {
// 			console.log(err);
// 			res.status(500).send('Failed to get orders');
// 		}
// 	} else res.status(400).send('Invalid Permission');
// });

// // POST check past order
// app.post('/checkorder', async (req, res) => {
// 	const order_id = req.body.order_id;
// 	if (auth_id) {
// 		try {
// 			const order = await check(order_id);
// 			res.send(order);
// 		} catch (err) {
// 			console.log(err);
// 			res.status(500).send('Could not find order');
// 		}
// 	} else res.status(400).send('Invalid Permission');
// });

// // POST Cancel past order
// app.post('/cancelorder', async (req, res) => {
// 	let order_id = req.body.order_id;
// 	if (auth_id) {
// 		try {
// 			await query(`UPDATE orders SET cancelled=1 WHERE order_id = ${order_id} LIMIT 1;`);
// 			res.send(`Succesfully cancelled order: ${order_id}`);
// 		} catch (err) {
// 			console.log(err);
// 			res.status(500).send('Could not find order');
// 		}
// 	} else res.status(400).send('Invalid Permission');
// });

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

// // const createMenu = async () => {
// // 	const sql = `CREATE TABLE IF NOT EXISTS menu_items(
// //         menu_id int NOT NULL AUTO_INCREMENT,
// //         employee_id int,
// //         name VARCHAR(50) NOT NULL,
// //         size VARCHAR(50) NOT NULL,
// //         price NUMERIC NOT NULL,
// //         time_required TIME NOT NULL,
// //         description VARCHAR(50), c
// //         reated_at TIMESTAMP,
// //         PRIMARY KEY (menu_id)
// //         );`;
// // 	await query(sql);
// // };

// // // POST create menu
// // app.post('/createmenu', async (req, res) => {
// // 	if (auth_id && !customer) {
// // 		try {
// // 			const sql = `CREATE TABLE IF NOT EXISTS menu_items(
// //                     menu_id int NOT NULL AUTO_INCREMENT,
// //                     employee_id int,
// //                     name VARCHAR(50) NOT NULL,
// //                     size VARCHAR(50) NOT NULL,
// //                     price NUMERIC NOT NULL,
// //                     time_required TIME NOT NULL,
// //                     description VARCHAR(50), c
// //                     reated_at TIMESTAMP,
// //                     PRIMARY KEY (menu_id)
// //                     );`;
// // 			await query(sql);
// // 			res.send('Created Menu');
// // 		} catch (err) {
// // 			console.log(err);
// // 			res.status(500).send('Failed to create menu');
// // 		}
// // 	} else res.status(400).send('Improper access permissions');
// // });

// // // POST delete menu
// // app.post('/deletemenu', async (req, res) => {
// // 	if (auth_id && !customer) {
// // 		try {
// // 			await query(`DROP TABLE menu_items;`);
// // 			await query(`UPDATE orders SET cancelled = 1;`);
// // 			await query(`TRUNCATE TABLE ordered_items;`);
// // 			await createMenu(); // Create new empty menu
// // 			res.send('Deleted Menu');
// // 		} catch (err) {
// // 			console.log(err);
// // 			res.status(500).send('Failed to delete menu');
// // 		}
// // 	} else res.status(400).send('Improper access permissions');
// // });

// // POST add menu item
// app.post('/addmenuitem', async (req, res) => {
// 	const name = req.body.name;
// 	const size = req.body.size;
// 	const price = req.body.price;
// 	const time_required = req.body.time_required;
// 	const description = req.body.description;

// 	if (!name || !size || !price || !time_required || !description) res.status(400).send('Invalid Fields');

// 	if (auth_id && !customer) {
// 		try {
// 			await query(
// 				`INSERT INTO menu_items(name, size, price, time_required, description) VALUES ('${name}', '${size}', ${price}, ${time_required}, '${description}');`
// 			);
// 			res.send(`Added menu item ${name} ${size}`);
// 		} catch (err) {
// 			console.log(err);
// 			res.status(500).send('Failed to add menu item');
// 		}
// 	} else res.status(400).send('Improper access permissions');
// });

// // POST delete menu item
// app.post('/deletemenuitem', async (req, res) => {
// 	const menu_id = req.body.menu_id;
// 	if (auth_id && !customer) {
// 		try {
// 			const result = await query(`SELECT * FROM menu_items WHERE menu_id = ${menu_id};`);

// 			await query(`UPDATE menu_items SET removed = 1 WHERE menu_id = ${result[0].menu_id};`);

// 			res.send('Deleted Menu Item');
// 		} catch (err) {
// 			console.log(err);
// 			res.status(500).send('Failed to delete menu item');
// 		}
// 	} else res.status(400).send('Improper access permissions');
// });

// // GET all open orders
// app.get('/allopenorders', async (req, res) => {
// 	if (auth_id && !customer) {
// 		try {
// 			const result = await query(
// 				`SELECT * FROM orders WHERE completed_at > CURDATE() AND cancelled = 0 ORDER BY created_at DESC;`
// 			);
// 			const orders = await Promise.all(result.map(async (item) => await check(item.order_id)));
// 			res.send(orders);
// 		} catch (err) {
// 			console.log(err);
// 			res.status(500).send('Failed to get orders');
// 		}
// 	} else res.status(400).send('Improper access permissions');
// });

// // GET all completed orders
// app.get('/allcompletedorders', async (req, res) => {
// 	if (auth_id && !customer) {
// 		try {
// 			const result = await query(
// 				`SELECT * FROM orders WHERE completed_at <= CURDATE() AND cancelled = 0 ORDER BY created_at DESC;`
// 			);
// 			const orders = await Promise.all(result.map(async (item) => await check(item.order_id)));
// 			res.send(orders);
// 		} catch (err) {
// 			console.log(err);
// 			res.status(500).send('Failed to get orders');
// 		}
// 	} else res.status(400).send('Improper access permissions');
// });

// // POST order ready for pickup
// app.post('/informcustomer', async (req, res) => {
// 	try {
// 		const order_id = req.body.order_id;
// 		const result = await query(`SELECT * FROM orders WHERE order_id = ${order_id};`);
// 		const customer_id = result[0].customer_id;
// 		const customer = await query(`SELECT * FROM customers WHERE customer_id = ${customer_id}`);
// 		const name = `${customer[0].first_name} ${customer[0].last_name}`;
// 		await query(
// 			`INSERT INTO ready_orders (customer_id, name, order_id, posted) VALUES (${customer_id}, "${name}", ${result[0].order_id}, now())`
// 		);
// 		res.send('Customer Informed');
// 	} catch (err) {
// 		console.log(err);
// 		res.status(500).send('Failed to inform customer');
// 	}
// });

// // GET all orders ready for pickup
// app.get('/ordersready', async (req, res) => {
// 	try {
// 		await query(`DELETE FROM ready_orders WHERE HOUR(now()) != HOUR(posted)`);
// 		const result = await query(`SELECT * FROM ready_orders;`);
// 		res.send(result);
// 	} catch (err) {
// 		console.log(err);
// 		res.status(500).send('Failed to get orders');
// 	}
// });

// ######################################################################################################################################

// Start Server
const server = app.listen(PORT, HOST, () => {
	console.log(`Running on Host: ${HOST} Port: ${PORT}`);
});
