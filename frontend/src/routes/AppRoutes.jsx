import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoutes';
import ErrorBoundary from '../components/ErrorBoundary';
import GlobalLayout from '../components/Layout/GlobalLayout';
import Login from '../pages/Login';
import RequesterDashboard from '../pages/RequesterDashboard';
import RequestManagement from '../pages/RequestManagement';
import ReviewerDashboard from '../pages/ReviewerDashboard';
import RequestDetail from '../pages/RequestDetail';

export const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public authentication route */}
        <Route path="/login" element={<Login />} />

        {/* Protected dashboard shell layouts */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <GlobalLayout />
            </ProtectedRoute>
          }
        >
          {/* Requester Routes */}
          <Route
            path="requester"
            element={
              <ProtectedRoute allowedRoles={['Requester']}>
                <RequesterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="requests/new"
            element={
              <ProtectedRoute allowedRoles={['Requester']}>
                <RequestManagement isEdit={false} />
              </ProtectedRoute>
            }
          />
          <Route
            path="requests/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['Requester']}>
                <RequestManagement isEdit={true} />
              </ProtectedRoute>
            }
          />

          {/* Reviewer Routes */}
          <Route
            path="reviewer"
            element={
              <ProtectedRoute allowedRoles={['Reviewer']}>
                <ReviewerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared Detail route */}
          <Route
            path="requests/:id"
            element={
              <ProtectedRoute allowedRoles={['Requester', 'Reviewer']}>
                <RequestDetail />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route
            index
            element={<Navigate to="/login" replace />}
          />
        </Route>

        {/* Wildcard redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;