import React from 'react';
import MainPage from './container/mainPage';
import Demo from './container/demo';
import DragDemo from './container/dragDemo';

const router = [
	{
		path: '/',
		element: <MainPage />
	},
	{
		path: '/demo',
		element: <Demo />
	},
	{
		path: '/dragDemo',
		element: <DragDemo />
	},
];

export default router;
