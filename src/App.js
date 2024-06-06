import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { Layout } from 'tdesign-react';
import router from './router';
import SideBar from './SideBar';

const { Header, Content, Aside } = Layout;

function App() {
  const Router = () => useRoutes(router);

  return (
    <Layout>
      <Header className="site-layout-header">
        <img src="https://tdesign.gtimg.com/site/baseLogo-light.png" height="28" alt="logo"/>
      </Header>
      <Layout className="site-layout">
        <Aside width={'fit-content'} className="site-layout-aside">
          <SideBar/>
        </Aside>
        <Content className="site-layout-content">
          <BrowserRouter>
            <Router/>
          </BrowserRouter>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
