import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as TLayout, Loading } from 'tdesign-react';
import SideBar from './SideBar';
import PageHeader from './PageHeader';

function Layout() {
	return (
		<TLayout>
			<PageHeader />
			<TLayout className="site-layout">
				<TLayout.Aside width={'fit-content'} className="site-layout-aside">
					<SideBar />
				</TLayout.Aside>
				<TLayout.Content className="site-layout-content">
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
						<Outlet />
					</Suspense>
				</TLayout.Content>
			</TLayout>
		</TLayout>
	);
}

export default Layout;
