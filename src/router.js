import React from 'react';
import MainPage from './container/mainPage/index.js';
import Demo from './container/demo/index.js';

const router = [
	{
		path: '/',
		element: <MainPage />
	},
	{
		path: '/demo',
		element: <Demo />
	},
];

export default router;
