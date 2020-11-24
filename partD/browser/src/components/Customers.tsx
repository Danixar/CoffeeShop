import React, { useEffect, useState } from 'react';

import { Menu, Order } from './interfaces';

interface Props {
	getToken: string | null;
	getMenu: Menu[];
}

export const Customers: React.FC<Props> = ({ getMenu, getToken }) => {
	const [getPastOrders, setPastOrders] = useState<Order[] | null>();
	let login = false;

	useEffect(() => {
		if (getToken) {
			fetch('http://localhost:5000/getorders', {
				method: 'get',
				headers: new Headers({
					Authorization: getToken,
					'Content-Type': 'application/x-www-form-urlencoded',
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					setPastOrders(res.json);
					login = true;
				});
		}
	}, [getToken]);

	if (login && getToken) {
		return (
			<>
				{' '}
				<div className="container">
					<section>
						<h3>Make a new Order!</h3>
						<p id="menu">The menu is not available at this time.</p>
						<p>*Taxes not included</p>
					</section>

					<nav className="sectionEnd">
						<div className="container">
							<button className="button1"> Submit New Order </button>{' '}
						</div>
					</nav>

					<section>
						<h3>Past Orders</h3>
						<p id="pastorders">You have no Past Orders</p>
					</section>

					<nav className="sectionEnd">
						<div className="container">
							<button className="button1"> Cancel Selected Orders </button>{' '}
						</div>
					</nav>
				</div>
				<div className="clr"></div>
			</>
		);
	} else {
		return (
			<div className="container">
				<h1>You do not have permission to view this page - please login.</h1>
			</div>
		);
	}
};
