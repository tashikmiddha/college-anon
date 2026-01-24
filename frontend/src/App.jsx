import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Create from './pages/Create';
import EditPost from './pages/EditPost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Premium from './pages/Premium';
import Payment from './pages/Payment';
import VerifyEmail from './pages/VerifyEmail';
import VerifyEmailInfo from './pages/VerifyEmailInfo';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Competitions from './pages/Competitions';
import CreateCompetition from './pages/CreateCompetition';
import ErrorBoundary from './components/ErrorBoundary';
import { getMe } from './features/auth/authSlice';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, needsVerification } = useSelector((state) => state.auth);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (needsVerification) {
    return <Navigate to="/login?verify=true" replace />;
  }
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Error Boundary Wrapper for Routes
const RouteWrapper = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={({ error, onRetry }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

function App() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  // Fetch fresh user data on app load to get college info
  useEffect(() => {
    if (token && user) {
      dispatch(getMe());
    }
  }, [dispatch, token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
<Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/verify-email-info" element={<VerifyEmailInfo />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/post/:id" element={<PostDetail />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <RouteWrapper>
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              </RouteWrapper>
            }
          />
          <Route
            path="/competitions"
            element={
              <RouteWrapper>
                <ProtectedRoute>
                  <Competitions />
                </ProtectedRoute>
              </RouteWrapper>
            }
          />
          <Route
            path="/competitions/create"
            element={
              <RouteWrapper>
                <ProtectedRoute>
                  <CreateCompetition />
                </ProtectedRoute>
              </RouteWrapper>
            }
          />
          <Route
            path="/premium"
            element={
              <RouteWrapper>
                <ProtectedRoute>
                  <Premium />
                </ProtectedRoute>
              </RouteWrapper>
            }
          />
          <Route
            path="/payment/:planId?"
            element={
              <RouteWrapper>
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              </RouteWrapper>
            }
          />
          <Route
            path="/create"
            element={
              <RouteWrapper>
                <ProtectedRoute>
                  <Create />
                </ProtectedRoute>
              </RouteWrapper>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <RouteWrapper>
                <ProtectedRoute>
                  <EditPost />
                </ProtectedRoute>
              </RouteWrapper>
            }
          />
          <Route
            path="/profile"
            element={
              <RouteWrapper>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </RouteWrapper>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RouteWrapper>
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              </RouteWrapper>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

