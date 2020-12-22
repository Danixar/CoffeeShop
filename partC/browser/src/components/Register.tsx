import React, { useState } from 'react';

import { useHistory } from 'react-router-dom';

export const Register: React.FC = () => {
	const [getFirstName, setFirstName] = useState('');
	const [getLastName, setLastName] = useState('');
	const [getEmail, setEmail] = useState('');
	const [getPassword, setPassword] = useState('');
	const [isCustomer, setIsCustomer] = useState(true);

	const history = useHistory();

	/**
	 * Register as a user
	 */
	const register = () => {
		fetch('http://localhost:5000/register', {
			method: 'POST',
			headers: { 'Content-type': 'application/x-www-form-urlencoded' },
			body: `first_name=${getFirstName}&last_name=${getLastName}&email=${getEmail}&password=${getPassword}&user=${
				isCustomer ? '1' : '0'
			}`,
		})
			.then(() => {
				if (window.confirm('You succsefully registered!')) history.push('/login');
			})
			.catch((err) => {
				console.error(err);
				alert('Unable to register!');
			});
	};

	/**
	 * Return registration page
	 */
	return (
		<>
			<div className="container">
				<section id="center">
					<h1>Register</h1>
					<fieldset>
						<div>
							<label>First Name: </label>
							<input
								type="text"
								placeholder="first_name"
								value={getFirstName}
								onChange={(e) => setFirstName(e.target.value)}
								required
							/>
							<br />
							<label>Last Name: </label>
							<input
								type="text"
								placeholder="last_name"
								value={getLastName}
								onChange={(e) => setLastName(e.target.value)}
								required
							/>
						</div>
						<div>
							<label>Email: </label>
							<input
								type="text"
								placeholder="email"
								value={getEmail}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div>
							<label>Password: </label>
							<input
								type="password"
								placeholder="password"
								value={getPassword}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<div>
							<label>Customer: </label>
							<input
								type="radio"
								name="user"
								id="customer"
								value="1"
								checked={isCustomer}
								onChange={() => setIsCustomer(true)}
							/>
							<label>Employee: </label>
							<input
								type="radio"
								name="user"
								id="employee"
								value="0"
								checked={!isCustomer}
								onChange={() => setIsCustomer(false)}
							/>
						</div>
						<button className="button" onClick={register}>
							Register
						</button>
					</fieldset>
					<br />
					{/* <a href="/login">Have an account already? Login</a> */}
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
