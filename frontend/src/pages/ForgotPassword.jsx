import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearError, clearPasswordResetSent, checkUserExists } from '../features/auth/authSlice';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
  });

  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Track which fields have been touched for validation
  const [touched, setTouched] = useState(false);
  // Track validation errors
  const [validationError, setValidationError] = useState('');

  const { email } = formData;
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message, passwordResetSent } = useSelector((state) => state.auth);

  // Validate email field
  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  };

  useEffect(() => {
    if (isError && message) {
      setLocalError(message);
      setSuccessMessage('');
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
    const { value } = e.target;
    
    setFormData({
      email: value,
    });
    setLocalError('');
    setSuccessMessage('');

    // Validate field and update validation error
    const fieldError = validateEmail(value);
    setValidationError(fieldError);
  };

  const handleBlur = () => {
    // Mark field as touched
    setTouched(true);
    // Validate field on blur
    const fieldError = validateEmail(email);
    setValidationError(fieldError);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    dispatch(clearError());

    // Mark field as touched
    setTouched(true);

    // Trim the email to remove whitespace
    const trimmedEmail = email.trim().toLowerCase();

    // Validate
    const emailError = validateEmail(trimmedEmail);
    setValidationError(emailError);
    
    if (emailError) {
      return;
    }

    if (!trimmedEmail) {
      setLocalError('Please provide your email address');
      return;
    }

    // First check if user exists
    try {
      const result = await dispatch(checkUserExists(trimmedEmail)).unwrap();
      
      // User exists, send password reset
      if (result.exists) {
        await dispatch(forgotPassword(trimmedEmail)).unwrap();
      }
    } catch (error) {
      // User doesn't exist
      setLocalError('Invalid email address. No account found with this email.');
    }
  };

  // Helper to get input border class
  const getInputClass = () => {
    const baseClass = 'input';
    if (touched && validationError) {
      return `${baseClass} border-red-500 focus:ring-red-500 focus:border-red-500`;
    }
    if (touched && !validationError && email) {
      return `${baseClass} border-green-500 focus:ring-green-500 focus:border-green-500`;
    }
    return baseClass;
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
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass()}
                    placeholder="your.email@college.edu"
                  />
                  {/* Email validation error */}
                  {touched && validationError && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationError}
                    </p>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || (touched && validationError) || !email.trim()}
                    className={`btn w-full py-3 ${(touched && validationError) || !email.trim() ? 'opacity-50 cursor-not-allowed' : 'btn-primary'}`}
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

