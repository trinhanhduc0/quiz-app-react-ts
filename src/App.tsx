// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '~/pages/Dashboard/Dashboard';
import Logout from '~/components/logout/Logout';
import Login from '~/components/login/Login';
import ListTest from '~/pages/ListTest/ListTest';
import DoTest from '~/pages/DoTest/DoTest';
import 'katex/dist/katex.min.css';

import { TopbarProvider } from '~/context/TopbarContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Topbar from './layouts/Layout';
import ManageClass from './pages/ClassManage/ManageClass';
import ManageTest from './pages/TestManage/ManageTest';
import ManageQuestion from './pages/QuestionManage/ManageQuestion';
import UserManager from './pages/UserManage/UserManager';
const App: React.FC = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <TopbarProvider>
          <Routes>
            <Route path="/" element={<Topbar />}>
              <Route index element={<Navigate to="/login" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="logout" element={<Logout />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="list-test/:classId/:author" element={<ListTest />} />
              <Route path="do-test/:author/:testId/:classId" element={<DoTest />} />
              <Route path="manage-class" element={<ManageClass />} />
              <Route path="manage-test" element={<ManageTest />} />
              <Route path="manage-question" element={<ManageQuestion />} />
              <Route path="manage-users" element={<UserManager />} />
            </Route>
          </Routes>
        </TopbarProvider>
      </Router>
    </>
  );
};

export default App;
