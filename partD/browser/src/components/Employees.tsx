import React, { useEffect, useState } from 'react';
import { isConstructorDeclaration } from 'typescript';

import { Menu, Order } from './interfaces';

interface Props {
	getToken: string | null;
	getMenu: Menu[];
	setMenu: React.Dispatch<React.SetStateAction<Menu[]>>;
}

export const Employees: React.FC<Props> = ({ getToken, getMenu, setMenu }) => {
	const [getName, setName] = useState<string>('');
	const [getSize, setSize] = useState<string>('');
	const [getPrice, setPrice] = useState<number>(0);
	const [getTimeRequired, setTimeRequired] = useState<number>(0);
	const [getDescription, setDescription] = useState<string>('');

	const [getOpenOrders, setOpenOrders] = useState<Order[]>([]);
	const [getReadyOrders, setReadyOrders] = useState<Order[]>([]);

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

	const removeMenuItem = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		const id = event.currentTarget.id;
		if (getToken) {
			fetch('http://localhost:5000/deletemenuitem', {
				method: 'POST',
				body: `menu_id=${id}`,
				headers: new Headers({
					Authorization: `Bearer ${getToken}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				}),
			})
				.then((res) => {
					if (res.status === 200) alert('Removed Item!');
					else alert('Could not remove item!');
					fetchMenu();
				})
				.catch((err) => {
					console.error(err);
				});
		}
	};

	const fetchMenu = () => {
		fetch('http://localhost:5000/menu')
			.then((res) => res.json())
			.then((res) => {
				setMenu(res);
			});
	};

	const addNewMenuItem = () => {
		if (getToken) {
			let name = getName;
			let size = getSize;
			let price = getPrice;
			let time_required = getTimeRequired;
			let description = getDescription;
			fetch('http://localhost:5000/addmenuitem', {
				method: 'POST',
				body: `name=${name}&size=${size}&price=${price}&time_required=${time_required}&description=${description}`,
				headers: new Headers({
					Authorization: `Bearer ${getToken}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				}),
			})
				.then((res) => {
					if (res.status === 201) alert('Added Item!');
					else alert('Could not add item!');
					fetchMenu();
				})
				.catch((err) => {
					console.error(err);
				});
		}
	};

	const fetchOpenOrders = () => {
		if (getToken) {
			fetch('http://localhost:5000/allopenorders', {
				method: 'GET',
				headers: new Headers({
					Authorization: `Bearer ${getToken}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					setOpenOrders(res);
				});
		}
	};

	const allOpenOrders = (getOpenOrders: Order[]) => {
		if (getOpenOrders.length === 0) return <div>No open orders</div>;
		else {
			return getOpenOrders.map((order) => {
				console.log(JSON.stringify(order));
				return (
					<div className="itemContainer" style={{ float: 'left' }}>
						<h4>
							{order.items.map((item) => {
								return `${item.quantity} ${item.name} - `;
							})}
						</h4>
						<h5>{`${order.first_name} ${order.last_name}`}</h5>
						<h5>Created on {order.created_at}</h5>
					</div>
				);
			});
		}
	};

	const fetchReadyOrders = () => {
		if (getToken) {
			fetch('http://localhost:5000/allcompletedorders', {
				method: 'GET',
				headers: new Headers({
					Authorization: `Bearer ${getToken}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					setReadyOrders(res);
				});
		}
	};

	const allReadyOrders = (getReadyOrders: Order[]) => {
		if (getReadyOrders.length === 0) return <div>No ready orders</div>;
		else {
			return getReadyOrders.map((order) => {
				return (
					<div className="itemContainer" style={{ float: 'left' }}>
						<h4>
							{order.items.map((item) => {
								return `${item.quantity} ${item.name} - `;
							})}
						</h4>
						<h5>{`${order.first_name} ${order.last_name}`}</h5>
						<h5>Created on {order.created_at}</h5>

						<button className="button1" id={order._id} onClick={(e) => notifyCustomer(e)}>
							{' '}
							Notify {`${order.first_name}`}{' '}
						</button>
					</div>
				);
			});
		}
	};

	const notifyCustomer = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		const id = event.currentTarget.id;
		if (getToken) {
			fetch('http://localhost:5000/informcustomer', {
				method: 'POST',
				body: `order_id=${id}`,
				headers: new Headers({
					Authorization: `Bearer ${getToken}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				}),
			})
				.then((res) => {
					if (res.status === 200) alert('Informed Customer!');
					else alert('Customer could not be informed!');
					fetchReadyOrders();
					fetchOpenOrders();
				})
				.catch((err) => {
					console.error(err);
				});
		}
	};

	useEffect(() => {
		fetchOpenOrders();
		fetchReadyOrders();
	}, []);

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
						<input
							type="text"
							placeholder="Orange Mocha Frappucino"
							value={getName}
							onChange={(e) => setName(e.target.value)}
						/>{' '}
						<br />
						<label>Size </label>
						<input
							type="text"
							placeholder="Tio Grande"
							value={getSize}
							onChange={(e) => setSize(e.target.value)}
						/>{' '}
						<br />
						<label>Price </label>
						<input
							type="number"
							pattern="[0-9]*"
							placeholder="19.99"
							value={getPrice}
							onChange={(e) => setPrice(parseFloat(e.target.value))}
						/>{' '}
						<br />
						<label>Minutes Required </label>
						<input
							type="number"
							pattern="[0-9]*"
							placeholder="5"
							value={getTimeRequired}
							onChange={(e) => setTimeRequired(parseInt(e.target.value))}
						/>{' '}
						<br />
						<label>Description </label>
						<textarea
							name="data"
							id="i5"
							cols={40}
							rows={2}
							value={getDescription}
							onChange={(e) => setDescription(e.target.value)}
						>
							Caffeine
						</textarea>
					</fieldset>
				</section>
			</div>
			<div className="container">
				<nav className="sectionEnd">
					<div className="container">
						<button className="button1" onClick={addNewMenuItem}>
							{' '}
							Add New Item to Menu{' '}
						</button>{' '}
					</div>
				</nav>
			</div>
			<div className="container">
				<section>
					<h1>All Open Orders</h1>
					{allOpenOrders(getOpenOrders)}
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
					{allReadyOrders(getReadyOrders)}
				</section>
			</div>
			<div className="container">
				<nav className="sectionEnd">
					<div className="container">
						<br />
					</div>
				</nav>
			</div>

			<div className="clr"></div>
		</>
	);
};
