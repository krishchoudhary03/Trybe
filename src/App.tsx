import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Layout from './components/Layout';

// Public pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';

// Main pages
import HomeFeed from './pages/HomeFeed';
import Discover from './pages/Discover';
import MyCollege from './pages/MyCollege';
import CollegeExplore from './pages/CollegeExplore';

// Clubs / Work
import Clubs from './pages/Clubs';
import ClubDashboard from './pages/ClubDashboard';
import Work from './pages/Work';

// Communication
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';

// User
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';

// Legal / Support
import LegalPage from './pages/LegalPage';
import Contact from './pages/Contact';

import { AppProvider, useApp } from './context/AppContext';


// ============================================================
// PROTECTED LAYOUT
// ============================================================

function ProtectedLayout() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}


// ============================================================
// PUBLIC AUTH ROUTE
// ============================================================

function PublicAuthRoute({
  children,
}: {
  children: React.ReactElement;
}) {
  const { isAuthenticated } = useApp();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
}


// ============================================================
// APP
// ============================================================

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>

          {/* ==================================================
              PUBLIC ROUTES
          ================================================== */}

          <Route
            path="/"
            element={<Welcome />}
          />

          <Route
            path="/login"
            element={
              <PublicAuthRoute>
                <Login />
              </PublicAuthRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicAuthRoute>
                <Signup />
              </PublicAuthRoute>
            }
          />

          <Route
            path="/onboarding"
            element={<Onboarding />}
          />


          {/* ==================================================
              LEGAL / SUPPORT
          ================================================== */}

          <Route
            path="/privacy"
            element={<LegalPage type="privacy" />}
          />

          <Route
            path="/terms"
            element={<LegalPage type="terms" />}
          />

          <Route
            path="/guidelines"
            element={<LegalPage type="guidelines" />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />


          {/* ==================================================
              PROTECTED APPLICATION
          ================================================== */}

          <Route element={<ProtectedLayout />}>

            {/* Home */}
            <Route
              path="/home"
              element={<HomeFeed />}
            />

            {/* Discover */}
            <Route
              path="/discover"
              element={<Discover />}
            />

            {/* My College */}
            <Route
              path="/college"
              element={<MyCollege />}
            />

            {/* College Explore */}
            <Route
              path="/college/:collegeId"
              element={<CollegeExplore />}
            />

            {/* Clubs */}
            <Route
              path="/clubs"
              element={<Clubs />}
            />

            <Route
              path="/clubs/:id"
              element={<ClubDashboard />}
            />

            {/* Work */}
            <Route
              path="/work"
              element={<Work />}
            />


            {/* ==================================================
                MESSAGES / CHAT
            ================================================== */}

            <Route
              path="/messages"
              element={<Messages />}
            />


            {/* ==================================================
                NOTIFICATIONS
            ================================================== */}

            <Route
              path="/notifications"
              element={<Notifications />}
            />


            {/* ==================================================
                USER
            ================================================== */}

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/help"
              element={<Help />}
            />

          </Route>


          {/* ==================================================
              FALLBACK
          ================================================== */}

          <Route
            path="*"
            element={<Navigate to="/home" replace />}
          />

        </Routes>
      </Router>
    </AppProvider>
  );
}