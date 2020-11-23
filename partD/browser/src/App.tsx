import React, { useEffect, useState } from 'react';

// import './App.css';
import './style/style.css';
import { BrowserRouter, Route, Link } from 'react-router-dom';

import { Menu, Order, User } from './components/interfaces';
import { Landing } from './components/Landing';
import { Customers } from './components/Customers';
import { Employees } from './components/Employees';
import { Login } from './components/Login';
import { Register } from './components/Register';

const App: React.FC = () => {
	const [getToken, setToken] = useState<string | null>(null);
	const [getMenu, setMenu] = useState<Menu[]>([]);

	// useEffect(() => {
	// 	console.log('Hi There');
	// 	fetch('http://localhost:5000/menu')
	// 		.then((res) => res.json())
	// 		.then((res) => {
	// 			console.log(res);
	// 			setMenu(res);
	// 		});
	// }, []);

	return (
		<div className="App">
			<header className="App-header">
				<header id="main-header">
					<div className="container">
						<h1>Coffee Shop</h1>
					</div>
				</header>
				<div id="navbar">
					<BrowserRouter>
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
						<Link to="/register">
							{' '}
							<button className="button"> Register </button>{' '}
						</Link>
						<Route path="/" exact>
							<Landing getMenu={getMenu} />
						</Route>
						<Route path="/customers">
							<Customers />
						</Route>
						<Route path="/employees">
							<Employees />
						</Route>
						<Route path="/login">
							<Login />
						</Route>
						<Route path="/register">
							<Register />
						</Route>
					</BrowserRouter>
				</div>
			</header>
		</div>
	);
};

export default App;
