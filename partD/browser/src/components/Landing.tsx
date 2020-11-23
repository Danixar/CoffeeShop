import React, { useEffect, useState } from 'react';

import { Menu, Order } from './interfaces';

interface Props {
	getMenu: Menu[];
}

export const Landing: React.FC<Props> = ({ getMenu }) => {
	const [getReadyOrders, setReadyOrders] = useState<Order[]>([]);

	// useEffect(() => {
	// 	console.log('Hi There readt');
	// 	fetch('http://localhost:5000/ordersready')
	// 		.then((res) => res.json())
	// 		.then((res) => {
	// 			console.log('hi ready');
	// 			setReadyOrders(res);
	// 		});
	// }, [getReadyOrders]);

	return (
		<>
			<div className="clr"></div>

			<div className="container">
				<section id="about">
					<h1> Welcome to Coffee Shop! </h1>
					<h3>About Us</h3>
					<p>
						Here at Coffee Shop, we're not like other coffee shops - we pride ourselves on selling you
						overpriced coffee with Italian and French names that appear sophisticated but really don't mean
						anything special if you actually know the languages their words come from.
					</p>
					<br />
					<h3>Orders Ready for Pickup</h3>
					<p id="readyorders">No Orders Ready at this time</p>
				</section>
			</div>

			<section id="picture">
				<div className="container">
					<h1>With a long history of providing excellent coffee since 2020</h1>
				</div>
			</section>

			<div className="container">
				<section id="main">
					<h1>Menu</h1>
					<p id="menu">The menu is not available at this time.</p>
					<p>*Taxes not included</p>
				</section>
			</div>

			<section id="picture2">
				<div className="container">
					<h1>Made from only the finest coffee beans grown in the beautiful climate of North Canada</h1>
				</div>
			</section>

			<footer id="main-footer">
				<p>Copyright &copy; 2020 Coffee Shop</p>
			</footer>
		</>
	);
};
