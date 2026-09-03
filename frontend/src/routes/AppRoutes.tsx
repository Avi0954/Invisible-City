import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ReportPage } from '../pages/ReportPage';
import { MyReportsPage } from '../pages/MyReportsPage';
import { MapPage } from '../pages/MapPage';
import { AdminPage } from '../pages/AdminPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="map" element={<MapPage />} />

        {/* Authenticated Citizen / General User Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="report" element={<ReportPage />} />
          <Route path="my-reports" element={<MyReportsPage />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Route>
    </Routes>
  );
};
