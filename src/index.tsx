import './index.scss';
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from 'context';
import { PrivateRoutes } from 'routes';
import { Activities, Dashboard, Groups, Login, NotFound } from 'pages';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<PrivateRoutes />}>
            <Route path="dashboard" element={<Dashboard />}>
              <Route path="activities" element={<Activities />} />
              <Route path="groups" element={<Groups />} />
              <Route path="" element={<Navigate to="activities" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="" element={<Navigate to="dashboard" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
