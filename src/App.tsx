/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { RootLayout } from './layouts/RootLayout';
import { ProtectedRoute } from './layouts/ProtectedRoute';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Companion } from './pages/Companion';
import { Profile } from './pages/Profile';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Layout wrapper for public and private routes */}
          <Route element={<RootLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Core App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/companion" element={<Companion />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Catch All - Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      
      {/* Global Hot Toast notification panel */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#064e3b',
            border: '1px solid #d1fae5',
            borderRadius: '1.25rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            boxShadow: '0 10px 15px -3px rgba(6, 78, 59, 0.05)',
            backdropFilter: 'blur(8px)'
          },
          success: {
            iconTheme: {
              primary: '#22C55E',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
