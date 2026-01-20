import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, clearError } from '../features/auth/authSlice';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiShield } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isError, message } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      dispatch(clearError());
    }
  }, [isError, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-bold text-primary-600">CollegeAnon</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            
            {user ? (
              <>
                <Link to="/create" className="btn btn-primary">
                  Create Post
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                    <FiUser />
                    <span>{user.anonId}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      {user.email}
                    </div>
                    <Link to="/profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <FiSettings className="mr-2" />
                      Profile
                    </Link>
                    {user.isAdmin && (
                      <Link to="/admin" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                        <FiShield className="mr-2" />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <Link
              to="/"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  to="/create"
                  className="block py-2 text-primary-600 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Create Post
                </Link>
                <Link
                  to="/profile"
                  className="block py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="block py-2 text-gray-700 hover:text-primary-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left py-2 text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-primary-600 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

