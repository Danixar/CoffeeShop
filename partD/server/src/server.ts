// CMPT 353
// Evangellos Wiegers
// eaw568
// 11176620

// Modules and packages
import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import util from 'util';

// Port and Host
const PORT = 8888;
const HOST = '0.0.0.0';

// ######################################################################################################################################

// Database Assignment with table posts
const databaseInfo = {
	host: 'mysql_a',
	user: 'root',
	database: 'coffeeShopPartA',
	password: 'admin',
};
const db = mysql.createConnection(databaseInfo);
const query = util.promisify(db.query).bind(db);
const setupTables = async () => {
	query(`CREATE TABLE IF NOT EXISTS menu_items(
            menu_id int NOT NULL AUTO_INCREMENT,
            name VARCHAR(50) NOT NULL,
            size VARCHAR(50) NOT NULL,
            price DECIMAL(15,2) NOT NULL,
            time_required int NOT NULL,
            description VARCHAR(1000),
            removed BOOLEAN default 0,
            PRIMARY KEY (menu_id)
            );`);
	query(`CREATE TABLE IF NOT EXISTS employees(
            employee_id int NOT NULL AUTO_INCREMENT,
            first_name VARCHAR(50) NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL,
            password VARCHAR(50) NOT NULL,
            UNIQUE (email),
            PRIMARY KEY (employee_id)
            );`);
	query(`CREATE TABLE IF NOT EXISTS customers(
            customer_id int NOT NULL AUTO_INCREMENT,
            first_name VARCHAR(50) NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL,
            password VARCHAR(50) NOT NULL,
            UNIQUE (email),
            PRIMARY KEY (customer_id)
            );`);
	query(`CREATE TABLE IF NOT EXISTS orders(
            order_id int NOT NULL AUTO_INCREMENT,
            customer_id int NOT NULL,
            cancelled BOOLEAN default 0,
            created_at TIMESTAMP NULL,
            completed_at TIMESTAMP NULL,
            PRIMARY KEY (order_id)
            );`);
	query(`CREATE TABLE IF NOT EXISTS ordered_items(
            item_id int NOT NULL AUTO_INCREMENT,
            menu_id int NOT NULL,
            order_id int NOT NULL,
            quantity int NOT NULL default 1,
            PRIMARY KEY (item_id)
            );`);
	query(`CREATE TABLE IF NOT EXISTS tokens(
            token int NOT NULL AUTO_INCREMENT PRIMARY KEY,
            customer boolean NOT NULL default 1,
            user_id int NOT NULL,
            last_used timestamp NOT NULL
            );`);
	query(`CREATE TABLE IF NOT EXISTS ready_orders(
            ready_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
            customer_id int NOT NULL,
            name VARCHAR(100) NOT NULL,
            order_id int NOT NULL,
            posted timestamp NOT NULL
            );`);
};
db.connect((err) => {
	if (err) throw err;
	console.log(
		`Connected to host ${databaseInfo.host} database ${databaseInfo.database} with user ${databaseInfo.user}`
	);
	setupTables();
});

// ######################################################################################################################################

// Create Server app
const app: Application = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// HTML files for testing post forms
app.use('/', express.static(path.join(__dirname, 'pages')));

// Bad Authentication Middleware
let token = null;
let auth_id = null;
let customer = null;
const authentication = async (req: Request, res: Response, next: NextFunction) => {
	token = req.query.token;
	if (token) {
		try {
			let result = await query(
				`SELECT * FROM tokens WHERE token = ${token} and hour(last_used) = hour(curtime());`
			);
			if (result[0]) {
				auth_id = result[0].user_id;
				customer = result[0].customer;
				await query(
					`UPDATE tokens SET last_used = now() WHERE token = ${token} and user_id = ${auth_id} and customer = ${customer};`
				);
			}
		} catch (err) {
			console.log(`Verification error for token ${token}`);
			console.log(err);
		}
	}
	next();
};
app.use(authentication);

// ######################################################################################################################################

// Main Page
app.get('/', (req, res) => {
	console.log(token, auth_id, customer);
	if (auth_id !== null) res.redirect(`/?token=${token}`);
	res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});
app.get('/main', (req, res) => {
	if (auth_id !== null) res.redirect(`/?token=${token}`);
	else res.redirect(`/`);
});

// ######################################################################################################################################
// Login

// GET Login page
app.get('/login', (req, res) => {
	console.log(token, auth_id, customer);
	if (auth_id !== null) res.redirect(`/?token=${token}`);
	else res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

// POST Login Form
app.post('/login', async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const userType = req.body.user;
	console.log(email, password, userType);
	if (!email || !password) res.sendFile(path.join(__dirname, 'pages', 'login.html'));

	try {
		const customer = userType == 1;

		const resultUsers = await query(
			customer
				? `SELECT * FROM customers WHERE email = '${email}' and password = '${password}';`
				: `SELECT * FROM employees WHERE email = '${email}' and password = '${password}';`
		);

		const id = customer ? resultUsers[0].customer_id : resultUsers[0].employee_id;
		await query(`INSERT INTO tokens(customer, user_id, last_used) VALUES(${userType}, ${id}, now());`);

		const resultTokens = await query(`SELECT * FROM tokens WHERE user_id = ${id};`);
		auth_id = resultTokens[0].user_id;

		res.redirect(`/?token=${resultTokens[resultTokens.length - 1].token}`);
	} catch (err) {
		console.log(err);
		res.sendFile(path.join(__dirname, 'pages', 'login.html'));
	}
});

// ######################################################################################################################################
// Register

// GET registration page
app.get('/register', (req, res) => {
	console.log(token, auth_id, customer);
	if (auth_id !== null) res.redirect(`/?token=${token}`);
	else res.sendFile(path.join(__dirname, 'pages', 'register.html'));
});

// POST registration form
app.post('/register', async (req, res) => {
	const first_name = req.body.first_name;
	const last_name = req.body.last_name;
	const email = req.body.email;
	const password = req.body.password;
	if (!last_name || !email || !password) res.status(400).send('Invalid Input Parameters');

	try {
		const userType = req.body.user == 1 ? 'customers' : 'employees';
		const sql = first_name
			? `INSERT INTO ${userType} (first_name, last_name, email, password) VALUES ('${first_name}', '${last_name}', '${email}', '${password}');`
			: `INSERT INTO ${userType} (last_name, email, password) VALUES ('${last_name}', '${email}', '${password}');`;
		await query(sql);
		res.redirect('/login');
	} catch (err) {
		console.log(err);
		res.sendFile(path.join(__dirname, 'pages', 'register.html'));
	}
});

// ######################################################################################################################################
// Sign Out
app.get('/signout', (req, res) => {
	token = null;
	auth_id = null;
	customer = null;
	res.redirect('/login');
});

// ######################################################################################################################################
// Customers

// GET menu items
app.get('/menu', async (req, res) => {
	try {
		const result = await query(`SELECT * FROM menu_items WHERE removed = 0;`);
		res.send(result);
	} catch (err) {
		res.status(500).send('Failed to get menu items');
	}
});

// GET order page
app.get('/customerorders', (req, res) => {
	console.log(token, auth_id, customer);
	if (auth_id === null) res.redirect(`/login?token=${token}`);
	else if (auth_id !== null && !customer) {
		res.redirect(`/employeerevoked?token=${token}`);
	} else res.sendFile(path.join(__dirname, 'pages', 'customer-orders.html'));
});

app.get('/employeerevoked', async (req, res) => {
	res.sendFile(path.join(__dirname, 'pages', 'employee-revoked.html'));
});

// GET past orders
app.get('/orders', (req, res) => {
	if (auth_id === null) res.redirect(`/login?token=${token}`);
	else red.sendFile(path.join(__dirname, 'pages', 'past-orders.html'));
});

// POST new order
app.post('/submitorder', async (req, res) => {
	const items = Object.values(req.body);
	console.log(token, auth_id, customer);
	if (auth_id !== null && customer) {
		try {
			await query(`INSERT INTO orders(customer_id, created_at) VALUES (${auth_id}, now());`);

			const result = await query(`SELECT * FROM orders WHERE customer_id=${auth_id};`);

			let timeMinutes = 0;
			await Promise.all(
				items.map(async (item) => {
					let itemName = item.split('_')[0];
					let quantity = item.split('_')[1];
					await query(
						`INSERT INTO ordered_items(menu_id, order_id, quantity) VALUES (${itemName}, ${
							result[result.length - 1].order_id
						}, ${quantity});`
					);

					const menu_item = await query(`SELECT * FROM menu_items WHERE menu_id=${itemName};`);
					console.log(menu_item[0].time_required);
					if (menu_item[0].time_required > 0) timeMinutes = menu_item[0].time_required;
				})
			);

			await query(
				`UPDATE orders SET completed_at=ADDTIME(now(), "${timeMinutes * 100}") WHERE order_id = ${
					result[result.length - 1].order_id
				} and customer_id=${auth_id};`
			);

			res.send('Completed');
		} catch (err) {
			console.log(err);
			res.status(500).send('Invalid Input Parameters');
		}
	} else if (auth_id !== null && !customer) {
		res.send('Employees Cannot submit an order');
	} else res.status(400).send('Failed to submit order');
});

const check = async (order_id) => {
	const result = await query(`SELECT * FROM orders WHERE order_id = ${order_id};`);
	const resultItems = await query(`SELECT * FROM ordered_items WHERE order_id = ${order_id};`);
	const items = await Promise.all(
		resultItems.map(async (item) => {
			let itemCheck = await query(`SELECT * FROM menu_items WHERE menu_id=${item.menu_id};`);
			let firstItem = itemCheck[0];
			firstItem['quantity'] = item.quantity;
			return firstItem;
		})
	);
	const order = {
		order_id: order_id,
		finished: result[0].completed_at < new Date() || result[0].cancelled == 1,
		created: result[0].created_at,
		cancelled: result[0].cancelled == 1,
		cost: items
			.map((item) => item.price * item.quantity)
			.reduce((acc, cur) => acc * 1.15 + cur)
			.toFixed(2),
		items: items.map((item) => ' ' + item.quantity + ' ' + item.name),
	};

	return order;
};

// GET past orders
app.get('/getorders', async (req, res) => {
	if (auth_id) {
		try {
			const sql = customer
				? `SELECT * FROM orders WHERE customer_id = ${auth_id} ORDER BY created_at DESC;`
				: `SELECT * FROM orders WHERE completed_at <= now() ORDER BY created_at ASC;`;
			const result = await query(sql);
			const items = await Promise.all(result.map(async (item) => await check(item.order_id)));

			res.send(items);
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to get orders');
		}
	} else res.status(400).send('Invalid Permission');
});

// POST check past order
app.post('/checkorder', async (req, res) => {
	const order_id = req.body.order_id;
	if (auth_id) {
		try {
			const order = await check(order_id);
			res.send(order);
		} catch (err) {
			console.log(err);
			res.status(500).send('Could not find order');
		}
	} else res.status(400).send('Invalid Permission');
});

// POST Cancel past order
app.post('/cancelorder', async (req, res) => {
	let order_id = req.body.order_id;
	if (auth_id) {
		try {
			await query(`UPDATE orders SET cancelled=1 WHERE order_id = ${order_id} LIMIT 1;`);
			res.send(`Succesfully cancelled order: ${order_id}`);
		} catch (err) {
			console.log(err);
			res.status(500).send('Could not find order');
		}
	} else res.status(400).send('Invalid Permission');
});

// ######################################################################################################################################
// Employees

// GET employee portal
app.get('/employeeportal', async (req, res) => {
	console.log(token, auth_id, customer);
	if (auth_id === null) res.redirect(`/login?token=${token}`);
	else if (auth_id !== null && customer) {
		res.redirect(`/customerrevoked?token=${token}`);
	} else res.sendFile(path.join(__dirname, 'pages', 'employee-portal.html'));
});

app.get('/customerrevoked', async (req, res) => {
	res.sendFile(path.join(__dirname, 'pages', 'customer-revoked.html'));
});

// const createMenu = async () => {
// 	const sql = `CREATE TABLE IF NOT EXISTS menu_items(
//         menu_id int NOT NULL AUTO_INCREMENT,
//         employee_id int,
//         name VARCHAR(50) NOT NULL,
//         size VARCHAR(50) NOT NULL,
//         price NUMERIC NOT NULL,
//         time_required TIME NOT NULL,
//         description VARCHAR(50), c
//         reated_at TIMESTAMP,
//         PRIMARY KEY (menu_id)
//         );`;
// 	await query(sql);
// };

// // POST create menu
// app.post('/createmenu', async (req, res) => {
// 	if (auth_id && !customer) {
// 		try {
// 			const sql = `CREATE TABLE IF NOT EXISTS menu_items(
//                     menu_id int NOT NULL AUTO_INCREMENT,
//                     employee_id int,
//                     name VARCHAR(50) NOT NULL,
//                     size VARCHAR(50) NOT NULL,
//                     price NUMERIC NOT NULL,
//                     time_required TIME NOT NULL,
//                     description VARCHAR(50), c
//                     reated_at TIMESTAMP,
//                     PRIMARY KEY (menu_id)
//                     );`;
// 			await query(sql);
// 			res.send('Created Menu');
// 		} catch (err) {
// 			console.log(err);
// 			res.status(500).send('Failed to create menu');
// 		}
// 	} else res.status(400).send('Improper access permissions');
// });

// // POST delete menu
// app.post('/deletemenu', async (req, res) => {
// 	if (auth_id && !customer) {
// 		try {
// 			await query(`DROP TABLE menu_items;`);
// 			await query(`UPDATE orders SET cancelled = 1;`);
// 			await query(`TRUNCATE TABLE ordered_items;`);
// 			await createMenu(); // Create new empty menu
// 			res.send('Deleted Menu');
// 		} catch (err) {
// 			console.log(err);
// 			res.status(500).send('Failed to delete menu');
// 		}
// 	} else res.status(400).send('Improper access permissions');
// });

// POST add menu item
app.post('/addmenuitem', async (req, res) => {
	const name = req.body.name;
	const size = req.body.size;
	const price = req.body.price;
	const time_required = req.body.time_required;
	const description = req.body.description;

	if (!name || !size || !price || !time_required || !description) res.status(400).send('Invalid Fields');

	if (auth_id && !customer) {
		try {
			await query(
				`INSERT INTO menu_items(name, size, price, time_required, description) VALUES ('${name}', '${size}', ${price}, ${time_required}, '${description}');`
			);
			res.send(`Added menu item ${name} ${size}`);
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to add menu item');
		}
	} else res.status(400).send('Improper access permissions');
});

// POST delete menu item
app.post('/deletemenuitem', async (req, res) => {
	const menu_id = req.body.menu_id;
	if (auth_id && !customer) {
		try {
			const result = await query(`SELECT * FROM menu_items WHERE menu_id = ${menu_id};`);

			await query(`UPDATE menu_items SET removed = 1 WHERE menu_id = ${result[0].menu_id};`);

			res.send('Deleted Menu Item');
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to delete menu item');
		}
	} else res.status(400).send('Improper access permissions');
});

// GET all open orders
app.get('/allopenorders', async (req, res) => {
	if (auth_id && !customer) {
		try {
			const result = await query(
				`SELECT * FROM orders WHERE completed_at > CURDATE() AND cancelled = 0 ORDER BY created_at DESC;`
			);
			const orders = await Promise.all(result.map(async (item) => await check(item.order_id)));
			res.send(orders);
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to get orders');
		}
	} else res.status(400).send('Improper access permissions');
});

// GET all completed orders
app.get('/allcompletedorders', async (req, res) => {
	if (auth_id && !customer) {
		try {
			const result = await query(
				`SELECT * FROM orders WHERE completed_at <= CURDATE() AND cancelled = 0 ORDER BY created_at DESC;`
			);
			const orders = await Promise.all(result.map(async (item) => await check(item.order_id)));
			res.send(orders);
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to get orders');
		}
	} else res.status(400).send('Improper access permissions');
});

// POST order ready for pickup
app.post('/informcustomer', async (req, res) => {
	try {
		const order_id = req.body.order_id;
		const result = await query(`SELECT * FROM orders WHERE order_id = ${order_id};`);
		const customer_id = result[0].customer_id;
		const customer = await query(`SELECT * FROM customers WHERE customer_id = ${customer_id}`);
		const name = `${customer[0].first_name} ${customer[0].last_name}`;
		await query(
			`INSERT INTO ready_orders (customer_id, name, order_id, posted) VALUES (${customer_id}, "${name}", ${result[0].order_id}, now())`
		);
		res.send('Customer Informed');
	} catch (err) {
		console.log(err);
		res.status(500).send('Failed to inform customer');
	}
});

// GET all orders ready for pickup
app.get('/ordersready', async (req, res) => {
	try {
		await query(`DELETE FROM ready_orders WHERE HOUR(now()) != HOUR(posted)`);
		const result = await query(`SELECT * FROM ready_orders;`);
		res.send(result);
	} catch (err) {
		console.log(err);
		res.status(500).send('Failed to get orders');
	}
});

// ######################################################################################################################################

// Start Server
const server = app.listen(PORT, HOST, () => {
	console.log(`Running on Host: ${HOST} Port: ${PORT}`);
});
