import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { Layout } from 'tdesign-react';
import router from './router';

const { Header, Content, Aside } = Layout;

function App() {
  const Router = () => useRoutes(router);

  return (
    <Layout className="site-layout">
      <Header/>
      <Layout>
        <Aside/>
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
