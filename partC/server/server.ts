// CMPT 353
// Evangellos Wiegers
// eaw568
// 11176620

// Modules and packages
import { Application } from 'https://deno.land/x/oak/mod.ts';
import router from './routes.ts';
import { oakCors } from 'https://deno.land/x/cors/mod.ts';

// Port and Host
const PORT = 5000;
const HOST = '0.0.0.0';
const browserPort = 8000;

// ######################################################################################################################################

// Create Server app
const app = new Application();

// CORS Middleware
app.use(
	oakCors({
		origin: `http://${HOST}:${browserPort}`,
		optionsSuccessStatus: 200,
	})
);

// // Bad Authentication Middleware
// app.use(async (ctx , next) => {
// 	const bearerHeader = ctx.request.headers.get('authorization');
// 	if (bearerHeader) {
// 		try {
// 			console.log(bearerHeader);
// 			const token = bearerHeader.split(' ')[1];
// 		} catch (err) {
// 			console.error(err);
// 		}
// 	}
// 	next();
// });

app.use(router.routes());
app.use(router.allowedMethods());

// Start Server
await app.listen({ port: PORT, hostname: HOST });
console.log(`Running on Host: ${HOST} Port: ${PORT}`);
