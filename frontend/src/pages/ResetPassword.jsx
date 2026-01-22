import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearError } from '../features/auth/authSlice';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [localError, setLocalError] = useState('');

  const { password, confirmPassword } = formData;
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      setLocalError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  useEffect(() => {
    if (isError && message) {
      setLocalError(message);
    }
    if (isSuccess) {
      // Redirect to login after 3 seconds
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isError, isSuccess, message, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError('');
    dispatch(clearError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (!token) {
      setLocalError('Invalid reset link');
      return;
    }

    dispatch(resetPassword({ token, password }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="max-w-md mx-auto w-full">
        <div className="card space-y-6">
          <h2 className="text-2xl font-bold text-center">Reset Password</h2>

          {isSuccess ? (
            <div className="space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p className="font-medium">Password Reset Successful!</p>
                <p className="text-sm mt-1">{message}</p>
              </div>
              <p className="text-gray-600">
                Redirecting to login page...
              </p>
            </div>
          ) : localError && !token ? (
            <div className="space-y-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-medium">Invalid Reset Link</p>
                <p className="text-sm mt-1">{localError}</p>
              </div>
              <div className="text-center">
                <Link to="/forgot-password" className="text-primary-600 hover:underline">
                  Request a new password reset
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-center">
                Enter your new password below.
              </p>

              {localError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {localError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    className="input"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    className="input"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary w-full py-3"
                  >
                    Reset Password
                  </button>
                )}
              </form>

              <p className="text-center text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-600 hover:underline">
                  Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

