import React, { useEffect, useState } from 'react';

// import './App.css';
import './style/style.css';
import { BrowserRouter, Route, Link } from 'react-router-dom';

import { Menu } from './components/interfaces';
import { Landing } from './components/Landing';
import { Customers } from './components/Customers';
import { Employees } from './components/Employees';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Lockout } from './components/Lockout';
import { Signout } from './components/Signout';

interface UserInfo {
	user_id: string;
	first_name: string;
	last_name: string;
	customer: boolean;
}

const App: React.FC = () => {
	const [getToken, setToken] = useState<string | null>(null);
	const [getLogin, setLogin] = useState<UserInfo | null>(null);
	const [getMenu, setMenu] = useState<Menu[]>([]);

	/**
	 * checks for user's info whenever token is updated
	 */
	useEffect(() => {
		if (getToken) {
			fetch('http://localhost:5000/login', {
				method: 'GET',
				headers: new Headers({
					Authorization: `Bearer ${getToken}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				}),
			})
				.then((res) => res.json())
				.then((res) => {
					setLogin(res);
				});
		} else setLogin(null);
	}, [getToken]);

	/**
	 * Get's menu items
	 */
	useEffect(() => {
		fetch('http://localhost:5000/menu')
			.then((res) => res.json())
			.then((res) => {
				setMenu(res);
			});
	}, []);

	/**
	 * The App!
	 */
	return (
		<div className="App">
			<header className="App-header">
				<header id="main-header">
					<div className="container">
						<h1>Coffee Shop</h1>
					</div>
				</header>
				<div id="info">
					<BrowserRouter>
						<div id="navbar">
							<Link to="/">
								{' '}
								<button className="button"> Main </button>{' '}
							</Link>
							<Link to="/customers">
								{' '}
								<button className="button"> Customer Portal </button>{' '}
							</Link>
							<Link to="/employees">
								{' '}
								<button className="button"> Employee Portal </button>{' '}
							</Link>
							<Link to="/login">
								{' '}
								<button className="button"> Login </button>{' '}
							</Link>
						</div>
						<Route path="/" exact>
							<Landing getMenu={getMenu} />
						</Route>
						<Route path="/customers">
							{getLogin ? <Customers getMenu={getMenu} getToken={getToken} /> : <Lockout />}
						</Route>
						<Route path="/employees">
							{getLogin && !getLogin.customer ? (
								<Employees getMenu={getMenu} getToken={getToken} setMenu={setMenu} />
							) : (
								<Lockout />
							)}
						</Route>
						<Route path="/login">
							{!getLogin ? <Login setToken={setToken} /> : <Signout setToken={setToken} />}
						</Route>
					</BrowserRouter>
				</div>
			</header>
		</div>
	);
};

export default App;
