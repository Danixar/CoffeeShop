import React, { useEffect, useState } from 'react';

import '../style/style.css';

import { useHistory } from 'react-router-dom';

interface Props {
	setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

export const Login: React.FC<Props> = ({ setToken }) => {
	const [getEmail, setEmail] = useState('');
	const [getPassword, setPassword] = useState('');
	const [isCustomer, setIsCustomer] = useState(true);

	const [getFirstName, setFirstName] = useState('');
	const [getLastName, setLastName] = useState('');
	const [getEmailRegistration, setEmailRegistration] = useState('');
	const [getPasswordRegistration, setPasswordRegistration] = useState('');
	const [CustomerRegistration, setCustomerRegistration] = useState(true);

	const history = useHistory();

	/**
	 * Login as user and set token
	 */
	const login = (getEmail: string, getPassword: string, isCustomer: boolean) => {
		fetch('http://localhost:5000/login', {
			method: 'POST',
			headers: { 'Content-type': 'application/x-www-form-urlencoded' },
			body: `email=${getEmail}&password=${getPassword}&user=${isCustomer ? '1' : '0'}`,
		})
			.then((res) => res.json())
			.then((res) => {
				setToken(res.token);
				history.push('/');
			})
			.catch((err) => {
				console.error(err);
				alert('Unable to Login!');
				setToken(null);
			});
	};

	/**
	 * Register as a user
	 */
	const register = () => {
		fetch('http://localhost:5000/register', {
			method: 'POST',
			headers: { 'Content-type': 'application/x-www-form-urlencoded' },
			body: `first_name=${getFirstName}&last_name=${getLastName}&email=${getEmailRegistration}&password=${getPasswordRegistration}&user=${
				CustomerRegistration ? '1' : '0'
			}`,
		})
			.then(() => {
				if (window.confirm('You succsefully registered!'))
					login(getEmailRegistration, getPasswordRegistration, CustomerRegistration);
			})
			.catch((err) => {
				console.error(err);
				alert('Unable to register!');
			});
	};

	/**
	 * Return login page
	 */
	return (
		<>
			<div className="container">
				<section id="center">
					<h1>Login</h1>
					<fieldset>
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
						<button className="button" onClick={(e) => login(getEmail, getPassword, isCustomer)}>
							Login
						</button>{' '}
					</fieldset>
					<br />
				</section>

				<nav className="sectionEnd">
					<div className="container">
						<br />
					</div>
				</nav>
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
								value={getEmailRegistration}
								onChange={(e) => setEmailRegistration(e.target.value)}
								required
							/>
						</div>
						<div>
							<label>Password: </label>
							<input
								type="password"
								placeholder="password"
								value={getPasswordRegistration}
								onChange={(e) => setPasswordRegistration(e.target.value)}
								required
							/>
						</div>
						<div>
							<label>Customer: </label>
							<input
								type="radio"
								name="userRegistration"
								id="customerRegistration"
								value="1"
								checked={CustomerRegistration}
								onChange={() => setCustomerRegistration(true)}
							/>
							<label>Employee: </label>
							<input
								type="radio"
								name="userRegistration"
								id="employeeRegistration"
								value="0"
								checked={!CustomerRegistration}
								onChange={() => setCustomerRegistration(false)}
							/>
						</div>
						<button className="button" onClick={register}>
							Register
						</button>
					</fieldset>
					<br />
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
