import React, { useEffect, useState } from 'react';

import { useHistory } from 'react-router-dom';

interface Props {
	setToken: React.Dispatch<React.SetStateAction<string | null>>;
	setLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Signout: React.FC<Props> = ({ setLogin, setToken }) => {
	const history = useHistory();

	return (
		<div className="container">
			<h1>You are already signed in - do you wish to sign out?</h1>
			<button
				onClick={(e) => {
					setToken(null);
					history.push('/login');
				}}
			>
				Sign Out
			</button>
		</div>
	);
};
