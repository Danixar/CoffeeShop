import React, { useEffect, useState } from 'react';

import { Menu, Order } from './interfaces';

interface Props {
	getMenu: Menu[];
}

/**
 * Display menu items
 */
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
				</div>
			);
		});
	}
};

/**
 * Display ready orders
 */
const displayReadyOrders = (getReadyOrders: Order[]) => {
	if (getReadyOrders.length === 0) return <div>No orders ready at the moment</div>;
	else {
		return getReadyOrders.map((order) => {
			return (
				<div className="itemContainer" style={{ float: 'left' }}>
					<h4>
						{order.first_name} {order.last_name}
					</h4>
					<h5>{order.created_at}</h5>
					<h5>Ready for pickup!</h5>
				</div>
			);
		});
	}
};

/**
 * Return landing page
 */
export const Landing: React.FC<Props> = ({ getMenu }) => {
	const [getReadyOrders, setReadyOrders] = useState<Order[]>([]);

	useEffect(() => {
		fetch('http://localhost:5000/readyorders')
			.then((res) => res.json())
			.then((res) => {
				setReadyOrders(res);
			});
	}, []);

	return (
		<>
			<div className="clr"></div>

			<div className="container">
				<section id="about">
					<h1> Welcome to Coffee Shop! </h1>
					<h3>About Us</h3>
					<p>Coffee Shop. Made for coffee drinkers by someone who only likes tea.</p>
				</section>
			</div>

			<section id="picture">
				<div className="container">
					<h1>With a long history of providing excellent coffee since 2020</h1>
				</div>
			</section>

			<div className="container">
				<h1>Orders Ready for Pickup</h1>
				{displayReadyOrders(getReadyOrders)}
			</div>

			<section id="picture2">
				<div className="container">
					<h1>Made from only the finest coffee beans grown in the beautiful climate of North Canada</h1>
				</div>
			</section>

			<div className="container">
				<section>
					<h1>Menu</h1>
					{displayMenu(getMenu)}
				</section>
			</div>

			<footer id="main-footer">
				<p>Copyright &copy; 2020 Coffee Shop</p>
			</footer>
		</>
	);
};
