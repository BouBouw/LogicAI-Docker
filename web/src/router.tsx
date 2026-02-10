import { createBrowserRouter } from 'react-router';
import React from 'react';
import Dashboard from './pages/Dashboard';
import WorkflowEditor from './pages/WorkflowEditor';
import { CredentialsPage } from './pages/CredentialsPage';

// Use a factory function to evaluate elements at runtime
export const getRouter = () => createBrowserRouter([
  {
    path: '/',
    element: React.createElement(Dashboard),
  },
  {
    path: '/workflow/:id',
    element: React.createElement(WorkflowEditor),
  },
  {
    path: '/workflow/new',
    element: React.createElement(WorkflowEditor),
  },
  {
    path: '/credentials',
    element: React.createElement(CredentialsPage),
  },
]);
