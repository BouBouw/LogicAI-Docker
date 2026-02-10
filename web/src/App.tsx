import React from 'react';
import { RouterProvider } from 'react-router';
import { getRouter } from './router';
import { ExecutionProvider } from './contexts/ExecutionContext';

function App() {
  const router = getRouter();
  return (
    <ExecutionProvider>
      <RouterProvider router={router} />
    </ExecutionProvider>
  );
}

export default App;
