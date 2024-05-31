import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import router from './router.js';

function App() {
  const Router = () => useRoutes(router);

  return (
    <BrowserRouter>
      <Router/>
    </BrowserRouter>
  );
}

export default App;
