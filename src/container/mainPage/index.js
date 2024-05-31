import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'tdesign-react';
import { get } from 'lodash';
import reactLogo from '../../assets/react.svg';
import viteLogo from '../../assets/vite.svg';
import './index.css';

function App() {
	const [count, setCount] = useState(0);
	const navigate = useNavigate();
	const location = useLocation();

	const onClick = () => {
		navigate('/demo?page=demo', { state: { id: 'demo' } });
	};

	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo"/>
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo"/>
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.js</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
			<Button onClick={onClick}>{get(location, 'state.id') || '主页'}</Button>
		</>
	);
}

export default App;
