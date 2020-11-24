import React, { useEffect, useState } from 'react';

import '../style/style.css';

import { useHistory } from 'react-router-dom';

interface Props {
	// getToken: string | null;
	setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

export const Login: React.FC<Props> = ({ setToken }) => {
	const [getEmail, setEmail] = useState('');
	const [getPassword, setPassword] = useState('');
	const [isCustomer, setIsCustomer] = useState(true);

	const history = useHistory();

	const login = () => {
		fetch('http://localhost:5000/login', {
			method: 'POST',
			headers: { 'Content-type': 'application/x-www-form-urlencoded' },
			body: `email=${getEmail}&password=${getPassword}&user=${isCustomer ? '1' : '0'}`,
		})
			.then((res) => res.json())
			.then((res) => {
				setToken(res);
				history.push('/');
			})
			.catch((err) => {
				console.error(err);
				alert('Unable to Login!');
				setToken(null);
			});
	};

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
						<button className="button" onClick={login}>
							Login
						</button>{' '}
					</fieldset>
					<br />
					<a href="/register">Don't have an account? Register</a>
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
