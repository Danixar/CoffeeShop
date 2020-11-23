import React, { useEffect, useState } from 'react';

import { Menu, Order } from './interfaces';

interface Props {
	getToken: string | null;
	setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

export const Login: React.FC = () => {
	return (
		<>
			<div className="container">
				<section id="center">
					<h3>Login</h3>
					<form action="/login" method="POST">
						{/* <div>
							<label for="email">Email: </label>
							<input type="text" name="email" id="email" />
						</div>
						<div>
							<label for="password">Password: </label>
							<input type="password" name="password" id="password" />
						</div>
						<div>
							<label for="customer">Customer: </label>
							<input type="radio" name="user" id="customer" value="1" checked="checked" />
							<label for="employee">Employee: </label>
							<input type="radio" name="user" id="employee" value="0" />
						</div> */}
						<button type="submit" id="login">
							Login
						</button>
					</form>
					<a href="/register">Don't have an account? Register</a>
				</section>
			</div>
		</>
	);
};
