// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '~/pages/Dashboard/Dashboard';
import Logout from '~/components/logout/Logout';
import Login from '~/components/login/Login';
import ListTest from '~/pages/ListTest/ListTest';
import DoTest from '~/pages/DoTest/DoTest';

import { TopbarProvider } from '~/context/TopbarContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Topbar from './layouts/Layout';
import ManageClass from './pages/ManageClass/ManageClass';
import ManageTest from './pages/ManageTest/ManageTest';
import ManageQuestion from './pages/ManageQuestion/ManageQuestion';
const App: React.FC = () => {
  return (
    <Router>
      <TopbarProvider>
        <Routes>
          <Route path="/" element={<Topbar />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="logout" element={<Logout />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="list-test/:classId/:author" element={<ListTest />} />
            <Route path="do-test/:isTest/:author/:testId/:classId" element={<DoTest />} />
            <Route path="manage-class" element={<ManageClass />} />
            <Route path="manage-test" element={<ManageTest />} />
            <Route path="manage-question" element={<ManageQuestion />} />
          </Route>
        </Routes>
      </TopbarProvider>
    </Router>
  );
};

export default App;
