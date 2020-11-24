import React, { useEffect, useState } from 'react';

import { Menu, Order } from './interfaces';

interface Props {
	getToken: string | null;
	getMenu: Menu[];
}

export const Employees: React.FC<Props> = ({ getToken, getMenu }) => {
	// const [getPastOrders, setPastOrders] = useState<Order[]>([]);
	// const [getCurrentOrder, setCurrentOrder] = useState<ItemOrder[]>(
	// 	getMenu.map((item) => {
	// 		return { item: item, quantity: 0 };
	// 	})
	// );

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
						<button className="button1" id={item._id} onClick={(e) => removeMenuItem(e)}>
							{' '}
							Remove Item{' '}
						</button>
					</div>
				);
			});
		}
	};

	const removeMenuItem = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {};

	return (
		<>
			<div className="container">
				<section>
					<h1>Menu</h1>
					{displayMenu(getMenu)}
				</section>
			</div>

			<div className="container">
				<nav className="sectionEnd">
					<div className="container">
						<br />
					</div>
				</nav>
			</div>

			<div className="container">
				<section>
					<h1>Add New Item</h1>
					<fieldset>
						<label>Name </label>
						<input type="text" name="name" id="i1" value="Orange Mocha Frappucino" /> <br />
						<label>Size </label>
						<input type="text" name="size" id="i2" value="Tio Grande" /> <br />
						<label>Price </label>
						<input type="number" name="price" id="i3" value="19.99" /> <br />
						<label>Time Required </label>
						<input type="number" name="time" id="i4" value="5" /> <br />
						<label>Description </label>
						<textarea name="data" id="i5" cols={40} rows={2}>
							Caffeine
						</textarea>
					</fieldset>
				</section>
			</div>
			<div className="container">
				<nav className="sectionEnd">
					<div className="container">
						<button className="button1"> Add New Item to Menu </button>{' '}
					</div>
				</nav>
			</div>
			<div className="container">
				<section>
					<h1>All Open Orders</h1>
					<p id="openorders">There are no open Orders</p>
				</section>
			</div>
			<div className="container">
				<nav className="sectionEnd">
					<div className="container">
						<br />
					</div>
				</nav>
			</div>
			<div className="container">
				<section>
					<h1>All Ready Orders</h1>
					<p id="readyorders">There are no ready Orders</p>
				</section>
			</div>
			<div className="container">
				<nav className="sectionEnd">
					<div className="container">
						<button className="button1"> Inform Selected Customers their Orders are Ready </button>{' '}
					</div>
				</nav>
			</div>

			<div className="clr"></div>
		</>
	);
};
