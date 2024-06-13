import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { Layout } from 'tdesign-react';
import router from './router';
import SideBar from './SideBar';
import PageHeader from './PageHeader';

function App() {
  const Router = () => useRoutes(router);

  return (
    <BrowserRouter>
      <Layout>
        <PageHeader />
        <Layout className="site-layout">
          <Layout.Aside width={'fit-content'} className="site-layout-aside">
            <SideBar/>
          </Layout.Aside>
          <Layout.Content className="site-layout-content">
              <Router/>
          </Layout.Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
