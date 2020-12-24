import { Router, Context } from 'https://deno.land/x/oak/mod.ts';
import {
	getAllOpenOrders,
	getLogin,
	getMenu,
	getOrders,
	getReadyOrders,
	postAddMenuItem,
	postCancelOrder,
	postCheckOrder,
	postDeleteMenuItem,
	postInformCustomer,
	postLogin,
	postRegister,
	postSubmitOrder,
} from './controllers.ts';

const router = new Router();
// Login
router.get('/login', getLogin).post('/login', postLogin);
// Register
router.post('/regiser', postRegister);
// Customers
router
	.get('/menu', getMenu)
	.get('/readyorders', getReadyOrders)
	.post('/submitorder', postSubmitOrder)
	.get('/getorders', getOrders)
	.post('/checkorder', postCheckOrder)
	.post('/cancelorder', postCancelOrder);
// Employees
router
	.post('addmenuitem', postAddMenuItem)
	.post('deletemenuitem', postDeleteMenuItem)
	.get('allopenorders', getAllOpenOrders)
	.post('informcustomer', postInformCustomer);

// ######################################################################################################################################
export default router;
