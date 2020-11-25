import React, { useEffect, useState } from 'react';

import { Menu, Order } from './interfaces';

interface ItemOrder {
	item: Menu;
	quantity: number;
}

interface Props {
	getToken: string | null;
	getMenu: Menu[];
}

export const Customers: React.FC<Props> = ({ getMenu, getToken }) => {
	const [getPastOrders, setPastOrders] = useState<Order[]>([]);
	const [getCurrentOrder, setCurrentOrder] = useState<ItemOrder[]>(
		getMenu.map((item) => {
			return { item: item, quantity: 0 };
		})
	);

	const displayMenu = (getMenu: Menu[]) => {
		if (getMenu.length === 0) return <div>No items on the Menu currently</div>;
		else {
			return getMenu.map((item) => {
				return (
					<div className="itemContainer" style={{ float: 'left' }}>
						<h4>{item.name}</h4>
						<h5>{item.size}</h5>
						<h5>{item.price}</h5>
						<h5>{item.description}</h5>
						<input
							type="number"
							id={item._id}
							min="0"
							max="5"
							defaultValue="0"
							onChange={(e) => alterOrder(e.target.id, e.target.value)}
						/>
					</div>
				);
			});
		}
	};

	const alterOrder = (id: string, value: string) => {
		const order = getCurrentOrder;
		setCurrentOrder(
			order.map((i) => {
				if (i.item._id === id) i.quantity = parseInt(value);
				return i;
			})
		);
	};

	const submitNewOrder = () => {
		if (getToken) {
			let params = ``;
			getCurrentOrder.map((item) => {
				if (item.quantity > 0) params += `&${item.item._id}_${item.quantity}`;
			});
			params = params.substring(1);
			fetch('http://localhost:5000/submitorder', {
				method: 'POST',
				body: params,
				headers: new Headers({
					Authorization: `Bearer ${getToken}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				}),
			})
				.then((res) => {
					if (res.status === 201) alert('Successfully ordered!');
					else alert('Could not submit order!');
					fetchPastOrders();
				})
				.catch((err) => {
					console.error(err);
				});
		}
	};

	const fetchPastOrders = () => {
		if (getToken) {
			fetch('http://localhost:5000/getorders', {
				method: 'GET',
				headers: new Headers({
					Authorization: `Bearer ${getToken}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					setPastOrders(res);
				});
		}
	};

	const displayPastOrders = (getPastOrders: Order[]) => {
		if (getPastOrders.length === 0) return <div>No previous orders</div>;
		else {
			return getPastOrders.map((order) => {
				return (
					<div className="itemContainer" style={{ float: 'left' }}>
						<h4>
							{order.items.map((item) => {
								return `${item.quantity} ${item.name} - `;
							})}
						</h4>
						<h5>{order.finished_at < new Date() || order.cancelled ? 'Completed' : 'In Progress'}</h5>
						<h5>Created on {order.created_at}</h5>
						{order.cancelled || order.finished_at > new Date() ? (
							<h5>Done</h5>
						) : (
							<button className="button1" id={order._id} onClick={(e) => cancelSelectedOrder(e)}>
								{' '}
								Cancel Order{' '}
							</button>
						)}
					</div>
				);
			});
		}
	};

	const cancelSelectedOrder = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		const id = event.currentTarget.id;
		if (getToken) {
			fetch('http://localhost:5000/cancelorder', {
				method: 'POST',
				body: `order_id=${id}`,
				headers: new Headers({
					Authorization: `Bearer ${getToken}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				}),
			})
				.then((res) => {
					if (res.status === 200) alert('Cancelled order!');
					else alert('Could not cancel order!');
					fetchPastOrders();
				})
				.catch((err) => {
					console.error(err);
				});
		}
	};

	useEffect(() => fetchPastOrders(), []);

	return (
		<>
			{' '}
			<div className="container">
				<section>
					<h1>Make a new Order!</h1>
					{displayMenu(getMenu)}
				</section>
			</div>
			<div className="container">
				<section className="sectionEnd">
					<div className="container">
						<button onClick={submitNewOrder} className="button1">
							{' '}
							Submit New Order{' '}
						</button>{' '}
					</div>
				</section>
			</div>
			<div className="container">
				<section>
					<h1>Past Orders</h1>
					{displayPastOrders(getPastOrders)}
				</section>
			</div>
			<div className="container">
				<nav className="sectionEnd">
					<div className="container">
						{' '}
						<p> </p>{' '}
					</div>
				</nav>
			</div>
			<div className="clr"></div>
		</>
	);
};
