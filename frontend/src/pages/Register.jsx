import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError, logout } from '../features/auth/authSlice';
import { allColleges, getCollegeType } from '../utils/colleges';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    displayName: '',
  });

  const [error, setError] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  
  // Track which fields have been touched for validation
  const [touched, setTouched] = useState({});
  // Track validation errors
  const [validationErrors, setValidationErrors] = useState({});

  const { email, password, confirmPassword, college, displayName } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError: authError, message, isSuccess } = useSelector((state) => state.auth);

  // Filter colleges based on search
  const filteredColleges = allColleges.filter(c => 
    c.toLowerCase().includes(collegeSearch.toLowerCase())
  );

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
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return '';
      case 'college':
        if (!value) return 'Please select your college';
        return '';
      default:
        return '';
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      validateField('email', email) === '' &&
      validateField('password', password) === '' &&
      validateField('confirmPassword', confirmPassword) === '' &&
      validateField('college', college) === ''
    );
  };

  useEffect(() => {
    if (authError) {
      setError(message);
      dispatch(clearError());
    }
    if (isSuccess) {
      // Logout to clear any stale auth state
      dispatch(logout());
      // Redirect to email verification info page after successful registration
      navigate('/verify-email-info');
    }
  }, [authError, message, isSuccess, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');

    // Validate field and update validation errors
    const fieldError = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));

    // Update college search when college field changes
    if (name === 'college') {
      setCollegeSearch(value);
    }
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

  const handleCollegeSelect = (collegeName) => {
    setFormData({
      ...formData,
      college: collegeName,
    });
    setCollegeSearch(collegeName);
    setShowCollegeDropdown(false);
    setError('');
    // Clear college validation error
    setValidationErrors(prev => ({
      ...prev,
      college: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Mark all fields as touched to show all errors
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      college: true,
    });

    // Validate all fields
    const errors = {
      email: validateField('email', email),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
      college: validateField('college', college),
    };
    setValidationErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some(err => err)) {
      return;
    }

    const userData = {
      email,
      password,
      college,
      displayName: displayName || 'Anonymous',
    };

    dispatch(register(userData));
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
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6">Join CollegeAnon</h2>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* College Selection Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="college"
              value={collegeSearch}
              onChange={(e) => {
                handleChange(e);
                setShowCollegeDropdown(true);
              }}
              onFocus={() => setShowCollegeDropdown(true)}
              onBlur={handleBlur}
              className={getInputClass('college')}
              placeholder="Search for your college..."
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mt-1">Select from IITs and NITs</p>
            
            {/* Dropdown */}
            {showCollegeDropdown && filteredColleges.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredColleges.map((collegeName) => (
                  <button
                    key={collegeName}
                    type="button"
                    onClick={() => handleCollegeSelect(collegeName)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  >
                    <span className="font-medium">{collegeName}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({getCollegeType(collegeName)})
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Click outside to close dropdown */}
            {showCollegeDropdown && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowCollegeDropdown(false)}
              />
            )}
            
            {/* College validation error */}
            {touched.college && validationErrors.college && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.college}
              </p>
            )}
          </div>

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
              placeholder="your.email@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">Verification link will be sent to this email</p>
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
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={displayName}
              onChange={handleChange}
              className="input"
              placeholder="Anonymous"
            />
            <p className="text-xs text-gray-500 mt-1">This will be shown publicly (default: Anonymous)</p>
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
              minLength={6}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClass('confirmPassword')}
              placeholder="••••••••"
            />
            {/* Confirm password validation error */}
            {touched.confirmPassword && validationErrors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`btn w-full py-3 ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : 'btn-primary'}`}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-gray-600 text-sm">
            By registering, you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;

