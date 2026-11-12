import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute, Layout } from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Professor from './pages/Professor';
import Student from './pages/Student';
import Evolution from './pages/Evolution';
import './styles/global.css';
import { AuthReturn } from './components/AuthReturn';
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AppProvider>
        <AuthReturn />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute roles={['professor']} />}>
            <Route element={<Layout />}>
              <Route path="/professor" element={<Professor />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute roles={['aluno']} />}>
            <Route element={<Layout />}>
              <Route path="/aluno" element={<Student />} />
              <Route path="/evolucao" element={<Evolution />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </HashRouter>
  </React.StrictMode>,
);
