import React, { useEffect, useState } from 'react';

import { Menu, Order } from './interfaces';

interface Props {
	getToken: string | null;
	setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

export const Register: React.FC = () => {
	return (
		<>
			<div className="container">
				<section id="center">
					<h3>Register</h3>
					<form action="/register" method="POST">
						{/* <div>
						<label for="first_name">First Name: </label>
						<input type="text" id="first_name" name="first_name" />
						<br />
						<label for="last_name">Last Name: </label>
						<input type="text" id="last_name" name="last_name" required />
					</div>
					<div>
						<label for="email">Email: </label>
						<input type="text" name="email" id="email" required />
					</div>
					<div>
						<label for="password">Password: </label>
						<input type="password" name="password" id="password" required />
					</div>
					<div>
						<label for="customer">Customer: </label>
						<input type="radio" name="user" id="customer" value="1" checked="checked" />
						<label for="employee">Employee: </label>
						<input type="radio" name="user" id="employee" value="0" />
					</div> */}
						<button type="submit" id="register">
							Register
						</button>
					</form>
					<a href="/">Cancel</a> <br />
					<a href="/login">Login</a>
				</section>
			</div>
		</>
	);
};
