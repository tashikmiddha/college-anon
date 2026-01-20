import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Create from './pages/Create';
import EditPost from './pages/EditPost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) {
    return <Navigate to="/login" replace />;
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
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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

