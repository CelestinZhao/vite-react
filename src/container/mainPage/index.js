import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Space } from 'tdesign-react';
// import { get } from 'lodash';
import { download } from '../../utils/download';
import reactLogo from '../../assets/react.svg';
import viteLogo from '../../assets/vite.svg';
import styles from './index.module.less';

function App() {
	const [count, setCount] = useState(0);
	const navigate = useNavigate();
	// const location = useLocation();

	const onClick = () => {
		navigate('/demo?page=demo', { state: { id: '主页' } });
	};

	const onClick2 = () => {
		navigate('/dragDemo', { state: { id: '主页' } });
	};

	return (
		<div className={styles['main-page']}>
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className={styles.logo} alt="Vite logo"/>
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className={`${styles.logo} react`} alt="React logo"/>
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className={styles.card}>
				<button className={styles.count} onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.js</code> and save to test HMR
				</p>
			</div>
			<p className={styles['read-the-docs']}>
				Click on the Vite and React logos to learn more
			</p>
			<Space size="medium" direction="horizontal">
				<Button onClick={onClick}>demo</Button>
				<Button onClick={() => download([])}>下载</Button>
				<Button onClick={onClick2}>dragDemo</Button>
			</Space>
		</div>
	);
}

export default App;
