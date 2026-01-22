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

  const { email, password, confirmPassword, college, displayName } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError: authError, message, isSuccess } = useSelector((state) => state.auth);

  // Filter colleges based on search
  const filteredColleges = allColleges.filter(c => 
    c.toLowerCase().includes(collegeSearch.toLowerCase())
  );

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');

    // Update college search when college field changes
    if (e.target.name === 'college') {
      setCollegeSearch(e.target.value);
    }
  };

  const handleCollegeSelect = (collegeName) => {
    setFormData({
      ...formData,
      college: collegeName,
    });
    setCollegeSearch(collegeName);
    setShowCollegeDropdown(false);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!college) {
      setError('Please select your college');
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
              College *
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
              className="input"
              placeholder="Search for your college..."
              autoComplete="off"
              required
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              className="input"
              placeholder="your.email@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Verification link will be sent to this email</p>
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
              Password *
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
              Confirm Password *
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

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3"
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

