import React, { useEffect, useState } from 'react';

import { Menu, Order } from './interfaces';

interface Props {
	getToken: string | null;
	setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

export const Employees: React.FC = () => {
	return (
		<>
			<div className="container">
				<section>
					<h3>Menu</h3>
					<p id="menu">The menu is not available at this time.</p>
					<p>*Taxes not included</p>
				</section>

				<nav className="sectionEnd">
					<div className="container">
						{/* <ul>
						<li>
							<a href="#menu" onclick="deleteSelected()">Delete Selected Items</a>
						</li>
					</ul> */}
					</div>
				</nav>

				<br />

				<section>
					<h3>Add New Item</h3>
					<fieldset>
						{/* <label for="name">Name </label>
						<input type="text" name="name" id="i1" value="Orange Mocha Frappucino" /> <br />
						<label for="size">Size </label>
						<input type="text" name="size" id="i2" value="Tio Grande" /> <br />
						<label for="price">Price </label>
						<input type="number" name="price" id="i3" value="19.99" /> <br />
						<label for="time">Time Required </label>
						<input type="number" name="time" id="i4" value="5" /> <br />
						<label for="description">Description </label> <br />
						<textarea name="data" id="i5" cols="70" rows="5">
							Caffeine
						</textarea> */}
					</fieldset>
				</section>

				<nav className="sectionEnd">
					<div className="container">
						{/* <ul>
						<li>
							<a href="#menu" onclick="addItem()">Add New Item to Menu</a>
						</li>
					</ul> */}
					</div>
				</nav>

				<section>
					<h3>All Open Orders</h3>
					<p id="openorders">There are no open Orders</p>
				</section>

				<section>
					<h3>All Ready Orders</h3>
					<p id="readyorders">There are no ready Orders</p>
				</section>

				<nav className="sectionEnd">
					<div className="container">
						<ul>
							{/* <li>
								<a href="#menu" onclick="informCustomer()">
									Inform Selected Customers their Orders are Ready
								</a>
							</li> */}
						</ul>
					</div>
				</nav>
			</div>

			<div className="clr"></div>
		</>
	);
};
