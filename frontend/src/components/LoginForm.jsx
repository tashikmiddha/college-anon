import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../features/auth/authSlice';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [localError, setLocalError] = useState('');
  const [searchParams] = useSearchParams();
  const navigationAttempted = useRef(false);
  const location = useLocation();

  const { email, password } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, message, isSuccess } = useSelector((state) => state.auth);

  const handleNavigation = useCallback(() => {
    // Only navigate if: success, not already navigated, and not already on home page
    if (isSuccess && !navigationAttempted.current && location.pathname !== '/') {
      navigationAttempted.current = true;
      // Use replace to avoid history stack buildup
      navigate('/', { replace: true });
    }
  }, [isSuccess, navigate, location.pathname]);

  useEffect(() => {
    handleNavigation();

    if (isError && message) {
      setLocalError(message);
    }

    // Check if redirected with verification required
    if (searchParams.get('verify') === 'true') {
      setLocalError('Please verify your email before accessing the website. Check your inbox for the verification link.');
    }
  }, [isError, isSuccess, message, searchParams, handleNavigation]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (localError) {
      setLocalError('');
      dispatch(clearError());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());
    // Reset navigation ref on new submit
    navigationAttempted.current = false;
    dispatch(login({ email, password }));
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

        {localError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {localError}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            className="input"
            placeholder="your.email@college.edu"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            className="input"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full py-3"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-primary-600 hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;

