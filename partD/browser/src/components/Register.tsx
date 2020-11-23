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
					<h1>Register</h1>
					<form action="/register" method="POST">
						<div>
							<label>First Name: </label>
							<input type="text" id="first_name" name="first_name" />
							<br />
							<label>Last Name: </label>
							<input type="text" id="last_name" name="last_name" required />
						</div>
						<div>
							<label>Email: </label>
							<input type="text" name="email" id="email" required />
						</div>
						<div>
							<label>Password: </label>
							<input type="password" name="password" id="password" required />
						</div>
						<div>
							<label>Customer: </label>
							<input type="radio" name="user" id="customer" value="1" checked={true} />
							<label>Employee: </label>
							<input type="radio" name="user" id="employee" value="0" />
						</div>
						<button type="submit" id="register">
							Register
						</button>
					</form>
					<a href="/login">Have an account already? Login</a>
				</section>

				<nav className="sectionEnd">
					<div className="container">
						<br />
					</div>
				</nav>
			</div>
		</>
	);
};
