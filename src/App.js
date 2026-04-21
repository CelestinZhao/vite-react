import React, { Suspense } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { Layout, Loading } from 'tdesign-react';
import router from './router';
import SideBar from './SideBar';
import PageHeader from './PageHeader';

function App() {
	const Router = () => useRoutes(router);

	return (
		<BrowserRouter
			future={{
				v7_relativeSplatPath: true,
				v7_startTransition: true,
			}}
		>
			<Layout>
				<PageHeader />
				<Layout className="site-layout">
					<Layout.Aside width={'fit-content'} className="site-layout-aside">
						<SideBar />
					</Layout.Aside>
					<Layout.Content className="site-layout-content">
						<Suspense
							fallback={
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										padding: '50px',
									}}
								>
									<Loading text="页面加载中..." size="large" />
								</div>
							}
						>
							<Router />
						</Suspense>
					</Layout.Content>
				</Layout>
			</Layout>
		</BrowserRouter>
	);
}

export default App;
