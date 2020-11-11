// CMPT 353
// Evangellos Wiegers
// eaw568
// 11176620

'use strict';

// Modules and packages
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const util = require('util');

// Port and Host
const PORT = 8080;
const HOST = '0.0.0.0';

// Database Assignment with table posts
const databaseInfo = {
	host: 'mysql_a',
	user: 'root',
	database: 'coffeeShopPartA',
	password: 'admin',
};
const db = mysql.createConnection(databaseInfo);
db.connect((err) => {
	if (err) throw err;
	console.log(
		`Connected to host ${databaseInfo.host} database ${databaseInfo.database} with user ${databaseInfo.user}`
	);
});
const query = util.promisify(db.query).bind(db);

query(`CREATE TABLE IF NOT EXISTS menu_items(
            menu_id int NOT NULL AUTO_INCREMENT,
            name VARCHAR(50) NOT NULL,
            size VARCHAR(50) NOT NULL,
            price DECIMAL(15,2) NOT NULL,
            time_required int NOT NULL,
            description VARCHAR(1000),
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

// Create Server app
const app = new express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// HTML files for testing post forms
app.use('/', express.static(path.join(__dirname, 'pages')));

// Bad Authentication Middleware
let token = null;
let auth_id = null;
let customer = null;
const authentication = async (req, res, next) => {
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

// HTML files for testing post forms
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Login
app.get('/login', (req, res) => {
	if (auth_id !== null) res.redirect(`/?token=${token}`);
	else res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

app.post('/login', async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const userType = req.body.user;
	if (!email || !password) res.sendFile(path.join(__dirname, 'pages', 'login.html'));

	try {
		const customer = userType == 1;

		const resultUsers = await query(
			customer
				? `SELECT * FROM customers WHERE email = '${email}' and password = '${password}';`
				: `SELECT * FROM employees WHERE email = '${email}' and password = '${password}';`
		);

		const id = customer ? resultUsers[0].customer_id : resultUsers[0].user_id;
		await query(`INSERT INTO tokens(customer, user_id, last_used) VALUES(${userType}, ${id}, now());`);

		const resultTokens = await query(
			`SELECT * FROM tokens WHERE user_id = ${id} and minute(last_used) = minute(curtime());`
		);
		res.redirect(`/?token=${resultTokens[0].token}`);
	} catch (err) {
		console.log(err);
		res.sendFile(path.join(__dirname, 'pages', 'login.html'));
	}
});

// Register
app.get('/register', (req, res) => {
	if (auth_id !== null) res.redirect(`/?token=${token}`);
	else res.sendFile(path.join(__dirname, 'pages', 'register.html'));
});

app.post('/register', async (req, res) => {
	const first_name = req.body.first_name;
	const last_name = req.body.last_name;
	const email = req.body.email;
	const password = req.body.password;
	if (!last_name || !email || !password) res.status(400).send('Invalid Input Parameters');

	try {
		const sql = first_name
			? `INSERT INTO customers (first_name, last_name, email, password) VALUES ('${first_name}', '${last_name}', '${email}', '${password}');`
			: `INSERT INTO customers (last_name, email, password) VALUES ('${last_name}', '${email}', '${password}');`;
		await query(sql);
		res.redirect('/login');
	} catch (err) {
		console.log(err);
		res.sendFile(path.join(__dirname, 'pages', 'register.html'));
	}
});

// Customers

app.get('/menu', async (req, res) => {
	try {
		const result = await query(`SELECT * FROM menu_items;`);
		res.send(result);
	} catch (err) {
		res.status(500).send('Failed to get menu items');
	}
});

app.get('/orders', (req, res) => {
	if (auth_id === null) res.redirect(`/login?token=${token}`);
	else red.sendFile(path.join(__dirname, 'pages', 'order.html'));
});

app.post('/createorder', (req, res) => {});

app.post('/submitorder', async (req, res) => {
	const items = req.body.items;
	if (auth_id !== null && customer) {
		try {
			await query(`INSERT INTO orders(customer_id, created_at) VALUES (${auth_id}, now());`);

			const result = await query(`SELECT * FROM orders WHERE minute(created_at) = minute(curtime());`);

			await Promise.all(
				items.map(async (item) => {
					await query(
						`INSERT INTO ordered_items(menu_id, order_id, quantity) VALUES (${item.menu_item.id}, ${result[0].order_id}, ${item.quantity});`
					);
				})
			);

			red.send('Completed');
		} catch (err) {
			console.log(err);
			res.status(500).send('Invalid Input Parameters');
		}
	} else res.status(400).send('Failed to submit order');
});

app.get('/getorders', async (req, res) => {
	if (auth_id) {
		try {
			const sql = customer
				? `SELECT * FROM orders WHERE customer_id = ${auth_id} ORDER BY DESC created_at;`
				: `SELECT * FROM orders WHERE completed_at <= now() ORDER BY ESC created_at;`;
			const result = await query(sql);

			res.send(result);
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to get orders');
		}
	} else res.status(400).send('Invalid Permission');
});

app.post('/checkorder', async (req, res) => {
	const order_id = req.body.order_id;
	if (auth_id) {
		try {
			const result = await query(`SELECT * FROM orders WHERE order_id = ${order_id};`);
			const resultItems = await query(`SELECT * FROM ordered_items WHERE order_id = ${order_id};`);
			const order = {
				completed: new Date(result[0].completed_at < new Date()),
				cancelled: result[0].cancelled,
				cost: resultItems.reduce((acc, cur) => acc + cur.price),
				items: resultItems,
			};
			res.send(order);
		} catch (err) {
			console.log(err);
			res.status(500).send('Could not find order');
		}
	} else res.status(400).send('Invalid Permission');
});

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

// Employees

app.post('/createmenu', async (req, res) => {
	if (auth_id && !customer) {
		try {
			const sql = `CREATE TABLE menu_items(
                    menu_id int NOT NULL AUTO_INCREMENT,
                    employee_id int,
                    name VARCHAR(50) NOT NULL,
                    size VARCHAR(50) NOT NULL,
                    price NUMERIC NOT NULL,
                    time_required TIME NOT NULL,
                    description VARCHAR(50), c
                    reated_at TIMESTAMP,
                    PRIMARY KEY (menu_id)
                    );`;
			await query(sql);
			res.send('Created Menu');
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to create menu');
		}
	} else res.status(400).send('Improper access permissions');
});

app.post('/deletemenu', async (req, res) => {
	if (auth_id && !customer) {
		try {
			await query(`DROP TABLE menu_items;`);
			await query(`UPDATE orders SET cancelled = 1;`);
			await query(`TRUNCATE TABLE ordered_items;`);
			res.send('Deleted Menu');
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to delete menu');
		}
	} else res.status(400).send('Improper access permissions');
});

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

app.post('/deletemenuitem', async (req, res) => {
	const name = req.body.name;
	const size = req.body.size;
	if (auth_id && !customer) {
		try {
			const result = await query(`SELECT * FROM menu_items WHERE name = name and size = size;`);

			await query(`DELETE FROM menu_items WHERE menu_id = ${result[0].menu_id} LIMIT 1;`);

			await query(`DELETE FROM ordered_items WHERE menu_id = ${result[0].menu_id};`);

			res.send('Deleted Menu Item');
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to delete menu item');
		}
	} else res.status(400).send('Improper access permissions');
});

app.get('/allopenorders', async (req, res) => {
	if (auth_id && !customer) {
		try {
			const result = await query(
				`SELECT * FROM orders WHERE completed_at > now() and cancelled = 0 ORDER BY created_at ESC;`
			);
			res.send(result);
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to get orders');
		}
	} else res.status(400).send('Improper access permissions');
});

app.get('/ordersready', async (req, res) => {
	try {
		let resultOrders = await query(
			`SELECT * FROM orders WHERE completed_at <= now() and cancelled = 0 ORDER BY created_at;`
		);

		let orders = await Promise.all(
			resultOrders.map(async (order) => {
				console.log(order);
				let customers = await query(`SELECT * FROM customers WHERE customer_id = ${order.customer_id};`);
				let name = customers[0].last_name;
				let items = await query(`SELECT * FROM ordered_items WHERE customer_id = ${order.customer_id};`);
				return { name: name, items: items.map((item) => `${item.quantity} ${item.name} ${item.size}`) };
			})
		);
		res.send(orders);
	} catch (err) {
		console.log(err);
		res.status(500).send('Failed to get orders');
	}
});

// Start Server
const server = app.listen(PORT, HOST, () => {
	console.log(`Running on Host: ${HOST} Port: ${PORT}`);
});
