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
const fs = require('fs');

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
const authentication = (req, res, next) => {
	token = req.query.token;
	if (token) {
		let sql = `SELECT * FROM tokens WHERE token = ${token} and hour(last_used) = hour(curtime());`;
		db.query(sql, (err, result) => {
			if (err) throw err;

			if (result[0]) {
				auth_id = result[0].user_id;
				customer = result[0].customer;
				sql = `UPDATE tokens SET last_used = now() WHERE token = ${token} and user_id = ${auth_id} and customer = ${customer};`;
				db.query(sql, (err) => {
					if (err) throw err;
					next();
				});
			} else next();
		});
	} else next();
};
app.use(authentication);

// HTML files for testing post forms
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Login
app.get('/login', (req, res) => {
	console.log(token, auth_id, customer);
	if (auth_id !== null) res.redirect(`/?token=${token}`);
	else res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

app.post('/login', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const userType = req.body.user;
	if (!email || !password) res.sendFile(path.join(__dirname, 'pages', 'login.html'));

	let sql = ``;
	let id = null;

	if (userType == 1) sql = `SELECT * FROM customers WHERE email = '${email}' and password = '${password}';`;
	else sql = `SELECT * FROM employees WHERE email = '${email}' and password = '${password}';`;
	try {
		db.query(sql, (err, resultUsers) => {
			if (err) throw err;
			if (resultUsers[0]) {
				if (userType == 1) id = resultUsers[0].customer_id;
				else id = resultUsers[0].user_id;
				sql = `INSERT INTO tokens(customer, user_id, last_used) VALUES(${userType}, ${id}, now());`;
				db.query(sql, (err) => {
					if (err) throw err;
					sql = `SELECT * FROM tokens WHERE user_id = ${id} and minute(last_used) = minute(curtime());`;
					db.query(sql, (err, resultTokens) => {
						if (err) throw err;
						if (resultTokens[0]) res.redirect(`/?token=${resultTokens[0].token}`);
					});
				});
			}
		});
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

app.post('/register', (req, res) => {
	const first_name = req.body.first_name;
	const last_name = req.body.last_name;
	const email = req.body.email;
	const password = req.body.password;
	if (!last_name || !email || !password) res.status(400).send('Invalid Input Parameters');

	let sql = '';
	if (first_name)
		sql = `INSERT INTO customers (first_name, last_name, email, password) VALUES ('${first_name}', '${last_name}', '${email}', '${password}');`;
	else sql = `INSERT INTO customers (last_name, email, password) VALUES ('${last_name}', '${email}', '${password}');`;
	try {
		db.query(sql, (err) => {
			if (err) throw err;
			res.redirect('/login');
		});
	} catch (err) {
		console.log(err);
		res.sendFile(path.join(__dirname, 'pages', 'register.html'));
	}
});

// Customers

app.get('/menu', (req, res) => {
	const sql = `SELECT * FROM menu_items;`;
	db.query(sql, (err, result) => {
		if (err) throw err;
		res.send(result);
	});
});

app.get('/orders', (req, res) => {
	if (auth_id === null) res.redirect(`/login?token=${token}`);
	else red.sendFile(path.join(__dirname, 'pages', 'order.html'));
});

app.post('/createorder', (req, res) => {});

app.post('/submitorder', (req, res) => {
	const items = req.body.items;
	if (auth_id !== null && customer) {
		try {
			let sql = `INSERT INTO orders(customer_id, created_at) VALUES (${auth_id}, now());`;
			db.query(sql, (err) => {
				if (err) throw err;
				sql = `SELECT * FROM orders WHERE minute(created_at) = minute(curtime());`;
				db.query(sql, (err, result) => {
					if (err) throw err;
					items
						.foreach((item) => {
							sql = `INSERT INTO ordered_items(menu_id, order_id, quantity) VALUES (${item.menu_item.id}, ${result[0].order_id}, ${item.quantity});`;
							db.query(sql, (err) => {
								if (err) throw err;
							});
						})
						.then(red.send('Completed'));
				});
			});
		} catch (err) {
			console.log(err);
			res.status(500).send('Invalid Input Parameters');
		}
	} else res.status(400).send('Failed to submit order');
});

app.get('/getorders', (req, res) => {
	if (auth_id) {
		let sql = ``;
		if (customer) sql = `SELECT * FROM orders WHERE customer_id = ${auth_id} ORDER BY created_at DESC;`;
		else sql = `SELECT * FROM orders WHERE completed_at <= now() ORDER BY created_at ESC;`;

		try {
			db.query(sql, (err, result) => {
				if (err) throw err;
				res.json(result);
			});
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to get orders');
		}
	} else res.status(400).send('Invalid Permission');
});

app.post('/checkorder', (req, res) => {
	const order_id = req.body.order_id;
	if (auth_id) {
		try {
			let sql = `SELECT * FROM orders WHERE order_id = ${order_id};`;
			db.query(sql, (err, result) => {
				if (err) throw err;
				if (result[0]) {
					let sql = `SELECT * FROM ordered_items WHERE order_id = ${order_id};`;
					db.query(sql, (err, resultItems) => {
						if (err) throw err;
						let order = {
							completed: new Date(result[0].completed_at < new Date()),
							cancelled: result[0].cancelled,
							cost: resultItems.reduce((acc, cur) => acc + cur.price),
							items: resultItems,
						};
						res.json(order);
					});
				}
			});
		} catch (err) {
			console.log(err);
			res.status(500).send('Could not find order');
		}
	} else res.status(400).send('Invalid Permission');
});

app.post('/cancelorder', (req, res) => {
	let order_id = req.body.order_id;
	if (auth_id) {
		try {
			let sql = `UPDATE orders SET cancelled=1 WHERE order_id = ${order_id} LIMIT 1;`;
			db.query(sql, (err) => {
				if (err) throw err;
				res.send(`Succesfully cancelled order: ${order_id}`);
			});
		} catch (err) {
			console.log(err);
			res.status(500).send('Could not find order');
		}
	} else res.status(400).send('Invalid Permission');
});

// Employees

app.post('/createmenu', (req, res) => {
	if (auth_id && !customer) {
		try {
			sql = `CREATE TABLE menu_items(
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
			db.query(sql, (err) => {
				if (err) throw err;
				res.send('Created Menu');
			});
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to create menu');
		}
	} else res.status(400).send('Improper access permissions');
});

app.post('/deletemenu', (req, res) => {
	if (auth_id && !customer) {
		try {
			sql = `DROP TABLE menu_items;`;
			db.query(sql, (err) => {
				if (err) throw err;
				sql = `UPDATE orders SET cancelled = 1;`;
				db.query(sql, (err) => {
					sql = `TRUNCATE TABLE ordered_items;`;
					db.query(sql, (err) => {
						if (err) throw err;
						res.send('Deleted Menu');
					});
				});
			});
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to delete menu');
		}
	} else res.status(400).send('Improper access permissions');
});

app.post('/addmenuitem', (req, res) => {
	const name = req.body.name;
	const size = req.body.size;
	const price = req.body.price;
	const time_required = req.body.time_required;
	const description = req.body.description;

	if (!name || !size || !price || !time_required || !description) res.status(400).send('Invalid Fields');

	if (auth_id && !customer) {
		try {
			sql = `INSERT INTO menu_items(name, size, price, time_required, description) VALUES ('${name}', '${size}', ${price}, ${time_required}, '${description}');`;
			db.query(sql, (err) => {
				if (err) throw err;
				res.send(`Added menu item ${name} ${size}`);
			});
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to add menu item');
		}
	} else res.status(400).send('Improper access permissions');
});

app.post('/deletemenuitem', (req, res) => {
	const name = req.body.name;
	const size = req.body.size;
	if (auth_id && !customer) {
		try {
			sql = `SELECT * FROM menu_items WHERE name = name and size = size;`;
			db.query(sql, (err, result) => {
				if (err) throw err;
				if (result[0]) {
					sql = `DELETE FROM menu_items WHERE menu_id = ${result[0].menu_id} LIMIT 1;`;
					db.query(sql, (err) => {
						sql = `DELETE FROM ordered_items WHERE menu_id = ${result[0].menu_id};`;
						db.query(sql, (err) => {
							if (err) throw err;
							res.send('Deleted Menu Item');
						});
					});
				}
			});
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to delete menu item');
		}
	} else res.status(400).send('Improper access permissions');
});

app.get('/allopenorders', (req, res) => {
	if (auth_id && !customer) {
		const sql = `SELECT * FROM orders WHERE completed_at > now() and cancelled = 0 ORDER BY created_at ESC;`;

		try {
			db.query(sql, (err, result) => {
				if (err) throw err;
				res.json(result);
			});
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to get orders');
		}
	} else res.status(400).send('Improper access permissions');
});

app.post('/ordersready', (req, res) => {
	// if (auth_id && !customer) {
	// 	try {
	// 		let resultOrders = await db.query(
	// 			`SELECT * FROM orders WHERE completed_at <= now() and cancelled = 0 ORDER BY created_at ESC;`
	// 		);
	// 		let orders = await Promise.all(
	// 			resultOrders.map(async (order) => {
	// 				let customers = await db.query(`SELECT * FROM customers WHERE customer_id = ${order.customer_id};`);
	// 				let name = customers[0].last_name;
	// 				let items = await db
	// 					.query(`SELECT * FROM ordered_items WHERE customer_id = ${order.customer_id};`)
	// 					.map((item) => `${item.quantity} ${item.name} ${item.size}`);
	// 				return { name: name, items: items };
	// 			})
	// 		);
	// 		res.send(orders);
	// 	} catch (err) {
	// 		console.log(err);
	// 		res.status(500).send('Failed to get orders');
	// 	}
	// } else res.status(400).send('Improper access permissions');

	if (auth_id && !customer) {
		try {
			const sql = `SELECT * FROM orders WHERE completed_at <= now() and cancelled = 0 ORDER BY created_at ESC;`;
			db.query(sql, (err, resultOrders) => {
				if (err) throw err;
				let readyOrders = [];
				resultOrders
					.foreach((order) => {
						sql = `SELECT * FROM customers WHERE customer_id = ${order.customer_id}`;
						db.query(sql, (err, resultCustomers) => {
							if (resultCustomers[0])
								readyOrders.push({ order: order, name: resultCustomers[0].last_name });
						});
					})
					.then(res.json(readyOrders));
			});
		} catch (err) {
			console.log(err);
			res.status(500).send('Failed to get orders');
		}
	} else res.status(400).send('Improper access permissions');
});

// Start Server
const server = app.listen(PORT, HOST, () => {
	console.log(`Running on Host: ${HOST} Port: ${PORT}`);
});
