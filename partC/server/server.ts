// CMPT 353
// Evangellos Wiegers
// eaw568
// 11176620

// Modules and packages
import { Application } from 'https://deno.land/x/oak/mod.ts';
import router from './routes.ts';
import { oakCors } from 'https://deno.land/x/cors/mod.ts';

// import express, { Application, Request, Response, NextFunction } from 'express';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
// import { menu, users, orders } from './schemas';
// import * as bcrypt from 'bcrypt';
// import * as jwt from 'jsonwebtoken';

// Port and Host
const PORT = 5000;
const HOST = '0.0.0.0';
const browserPort = 8000;

// ######################################################################################################################################

// // Database Assignment with table posts
// const container: string = 'dbPartB';
// // const container: string = 'localhost';
// const database: string = 'coffeeShop';
// mongoose
// 	.connect(`mongodb://${container}:27017/${database}`, { useNewUrlParser: true, useUnifiedTopology: true })
// 	.then(() => console.log(`Connected to MongoDB Database ${database} on ${container}`))
// 	.catch((err) => console.log(err));
// const conn: mongoose.Connection = mongoose.connection;
// conn.on('error', (err) => console.error(err));

// ######################################################################################################################################

// Create Server app
const app = new Application();

// // Body Parser Middleware
// app.use(bodyParser.urlencoded({ extended: true }));

// CORS Middleware
app.use(
	oakCors({
		origin: `http://${HOST}:${browserPort}`,
		optionsSuccessStatus: 200,
	})
);

// // Bad Authentication Middleware and Supporting function
// const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
// 	const bearerHeader = req.headers['authorization']; // Authorization: Bearer <access_token>
// 	if (bearerHeader) {
// 		try {
// 			const token = bearerHeader.split(' ')[1];
// 			req.token = token;
// 		} catch (err) {
// 			console.error(`Verification error for bearer header ${bearerHeader}`);
// 			console.error(err);
// 		}
// 	}
// 	next();
// };
// app.use(verifyToken);
// const authenticate = async (token: string) => {
// 	try {
// 		const decoded: any = await jwt.verify(token, 'secretKey');
// 		return decoded?.user;
// 	} catch (err) {
// 		console.error(err);
// 	}
// };

app.use(router.routes());
app.use(router.allowedMethods());

// Start Server
await app.listen({ port: PORT, hostname: HOST });
console.log(`Running on Host: ${HOST} Port: ${PORT}`);
