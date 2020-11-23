import React, { useEffect, useState } from 'react';

import { Menu, Order } from './interfaces';

interface Props {
	getToken: string | null;
	setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

export const Customers: React.FC = () => {
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
};
