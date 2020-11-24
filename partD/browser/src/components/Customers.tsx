import React, { useEffect, useState } from 'react';

import { Menu, Order } from './interfaces';

interface itemOrder {
	item: Menu;
	quantity: number;
}

interface Props {
	getToken: string | null;
	getMenu: Menu[];
}

export const Customers: React.FC<Props> = ({ getMenu, getToken }) => {
	const [getPastOrders, setPastOrders] = useState<Order[]>([]);
	const [getCurrentOrder, setCurrentOrder] = useState<itemOrder[] | null>([]);

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
						<input type="number" id={item._id} min="0" max="5" value="0" />
					</div>
				);
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
								return `${item.quantity} ${item.name}`;
							})}
						</h4>
						<h5>{order.finished_at < new Date() && !order.cancelled ? 'Finished' : 'In Progress'}</h5>
						<h5>Created on {order.created_at}</h5>
						{order.cancelled ? <h5>Cancelled</h5> : <button className="button1"> Cancel Order </button>}
					</div>
				);
			});
		}
	};

	useEffect(() => {
		if (getToken) {
			fetch('http://localhost:5000/getorders', {
				method: 'GET',
				headers: new Headers({
					Authorization: getToken,
					'Content-Type': 'application/x-www-form-urlencoded',
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					setPastOrders(res.json);
				});
		}
	}, [getCurrentOrder]);

	return (
		<>
			{' '}
			<div className="container">
				<section>
					<h3>Make a new Order!</h3>
					{displayMenu(getMenu)}
				</section>
			</div>
			<div className="container">
				<section className="sectionEnd">
					<div className="container">
						<button className="button1"> Submit New Order </button>{' '}
					</div>
				</section>
			</div>
			<div className="container">
				<section>
					<h3>Past Orders</h3>
					{displayPastOrders(getPastOrders)}
				</section>
			</div>
			<div className="container">
				<nav className="sectionEnd">
					<div className="container">
						<button className="button1"> Cancel Selected Orders </button>{' '}
					</div>
				</nav>
			</div>
			<div className="clr"></div>
		</>
	);
};
