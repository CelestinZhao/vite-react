import React from 'react';
import MainPage from './container/mainPage';
import Demo from './container/demo';
import DragDemo from './container/dragDemo';
import DndKit from './container/dndKit/index';

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
	{
		path: '/dndKit',
		element: <DndKit />
	},
];

export default router;
