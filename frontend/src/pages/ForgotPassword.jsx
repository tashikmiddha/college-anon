import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearError, clearPasswordResetSent } from '../features/auth/authSlice';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
  });

  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { email } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, isSuccess, message, passwordResetSent } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError && message) {
      setLocalError(message);
    }
    if (passwordResetSent) {
      setSuccessMessage(message || 'Password reset email sent!');
    }
  }, [isError, message, passwordResetSent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearPasswordResetSent());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError('');
    setSuccessMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    dispatch(clearError());

    if (!email) {
      setLocalError('Please provide your email address');
      return;
    }

    dispatch(forgotPassword(email));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="max-w-md mx-auto w-full">
        <div className="card space-y-6">
          <h2 className="text-2xl font-bold text-center">Forgot Password</h2>

          {successMessage ? (
            <div className="space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p className="font-medium">Check Your Email</p>
                <p className="text-sm mt-1">{successMessage}</p>
              </div>
              <p className="text-gray-600 text-sm">
                If you don't receive an email within a few minutes, check your spam folder or make sure you entered the correct email address.
              </p>
              <button
                onClick={() => {
                  setSuccessMessage('');
                  dispatch(clearPasswordResetSent());
                }}
                className="text-primary-600 hover:underline text-sm"
              >
                Try again with a different email
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-center">
                Enter the email address associated with your account, and we'll send you a link to reset your password.
              </p>

              {localError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {localError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
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

                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary w-full py-3"
                  >
                    Send Reset Link
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

export default ForgotPassword;

