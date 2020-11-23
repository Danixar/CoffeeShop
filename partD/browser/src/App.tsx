import React from 'react';

// import './App.css';
import './style/style.css';
import { BrowserRouter, Route, Link } from 'react-router-dom';

import { useState } from 'react';

import { Menu, Order, User } from './components/interfaces';
import { Landing } from './components/Landing';

const App: React.FC = () => {
	const [getToken, setToken] = useState<string | null>(null);
	const [getMenu, setMenu] = useState<Menu[]>([]);
	const [getReadyOrders, setReadyOrders] = useState<Order[]>([]);

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
							<Landing setMenu={setMenu} setReadyOrders={setReadyOrders} />
						</Route>
						{/* <Route path="/oldPosts">
							<OldPosts get={getList} />
						</Route>
						<Route path="/newPost">
							<NewPost set={setList} />
						</Route> */}
					</BrowserRouter>
				</div>
			</header>
		</div>
	);
};

export default App;
