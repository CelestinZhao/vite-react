import React, { lazy } from 'react';

const MainPage = lazy(() => import('./container/mainPage'));
const Demo = lazy(() => import('./container/demo'));
const DragDemo = lazy(() => import('./container/dragDemo'));
const DndKit = lazy(() => import('./container/dndKit'));
const AiChat = lazy(() => import('./container/aiChat'));

const router = [
	{
		path: '/',
		element: <MainPage />,
	},
	{
		path: '/demo',
		element: <Demo />,
	},
	{
		path: '/dragDemo',
		element: <DragDemo />,
	},
	{
		path: '/dndKit',
		element: <DndKit />,
	},
	{
		path: '/aiChat',
		element: <AiChat />,
	},
];

export default router;
