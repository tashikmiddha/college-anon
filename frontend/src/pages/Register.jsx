import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../features/auth/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    collegeEmail: '',
    displayName: '',
  });

  const [error, setError] = useState('');

  const { email, password, confirmPassword, collegeEmail, displayName } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError: authError, message, isSuccess } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authError) {
      setError(message);
      dispatch(clearError());
    }
    if (isSuccess) {
      navigate('/');
    }
  }, [authError, message, isSuccess, dispatch, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    const userData = {
      email,
      password,
      collegeEmail,
      displayName: displayName || 'Anonymous',
    };

    dispatch(register(userData));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6">Join CollegeAnon</h2>

          {(error || message) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College Email *
            </label>
            <input
              type="email"
              name="collegeEmail"
              value={collegeEmail}
              onChange={handleChange}
              className="input"
              placeholder="your.name@college.edu"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Must be a valid college email address</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              className="input"
              placeholder="your.email@gmail.com"
            />
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

