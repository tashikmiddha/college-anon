import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../features/auth/authSlice';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [localError, setLocalError] = useState('');
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track which fields have been touched for validation
  const [touched, setTouched] = useState({});
  // Track validation errors
  const [validationErrors, setValidationErrors] = useState({});

  const { email, password } = formData;
  const dispatch = useDispatch();
  const { isLoading, isError, message, isSuccess, user, isBlocked, blockReason } = useSelector((state) => state.auth);

  // Validate individual fields
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        return '';
      default:
        return '';
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      validateField('email', email) === '' &&
      validateField('password', password) === ''
    );
  };

  // Navigate to home when login is successful
  useEffect(() => {
    if (isSuccess && user) {
      // Use window.location for a full page refresh to ensure auth state is properly initialized
      window.location.href = '/';
    }
  }, [isSuccess, user]);

  useEffect(() => {
    if (isError && message) {
      setLocalError(message);
      setIsSubmitting(false);
    }

    // Check if redirected with verification required
    if (searchParams.get('verify') === 'true') {
      setLocalError('Please verify your email before accessing the website. Check your inbox for the verification link.');
    }
  }, [isError, message, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate field and update validation errors
    const fieldError = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    // Validate field on blur
    const fieldError = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);
    dispatch(clearError());

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    // Validate all fields
    const errors = {
      email: validateField('email', email),
      password: validateField('password', password),
    };
    setValidationErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some(err => err)) {
      setIsSubmitting(false);
      return;
    }
    
    const result = await dispatch(login({ email, password }));
    
    if (!login.fulfilled.match(result)) {
      setIsSubmitting(false);
    }
  };

  // Helper to get input border class
  const getInputClass = (fieldName) => {
    const baseClass = 'input';
    if (touched[fieldName] && validationErrors[fieldName]) {
      return `${baseClass} border-red-500 focus:ring-red-500 focus:border-red-500`;
    }
    if (touched[fieldName] && !validationErrors[fieldName]) {
      return `${baseClass} border-green-500 focus:ring-green-500 focus:border-green-500`;
    }
    return baseClass;
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

        {localError && (
          <div className={`border px-4 py-3 rounded ${
            isBlocked 
              ? 'bg-red-100 border-red-400 text-red-800' 
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">
                  {isBlocked ? 'Account Blocked' : 'Login Failed'}
                </p>
                <p className="text-sm mt-1">{localError}</p>
                {isBlocked && blockReason && (
                  <p className="text-sm mt-2 opacity-75">
                    <strong>Reason:</strong> {blockReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('email')}
            placeholder="your.email@college.edu"
          />
          {/* Email validation error */}
          {touched.email && validationErrors.email && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('password')}
            placeholder="••••••••"
          />
          {/* Password validation error */}
          {touched.password && validationErrors.password && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationErrors.password}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading || isSubmitting || !isFormValid()}
          className={`btn w-full py-3 ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : 'btn-primary'}`}
        >
          {isLoading || isSubmitting ? 'Logging in...' : 'Login'}
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

