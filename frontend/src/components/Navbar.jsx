import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, clearError } from '../features/auth/authSlice';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiShield, FiStar, FiAward, FiInfo, FiMessageSquare, FiChevronDown } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import FeedbackModal from './FeedbackModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { user, isError, message } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const aboutDropdownRef = useRef(null);

  // Check if premium is valid
  const isPremium = user?.isPremium && new Date(user?.premiumExpiresAt) > new Date();

  useEffect(() => {
    if (isError) {
      dispatch(clearError());
    }
  }, [isError, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(event.target)) {
        setShowAboutDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
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
              <Link to="/competitions" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center gap-1">
                <FiAward />
                Competitions
              </Link>
              
              {/* About Dropdown */}
              <div className="relative" ref={aboutDropdownRef}>
                <button
                  onClick={() => setShowAboutDropdown(!showAboutDropdown)}
                  className="text-gray-700 hover:text-primary-600 transition-colors flex items-center gap-1"
                >
                  <FiInfo />
                  About
                  <FiChevronDown className={`w-4 h-4 transition-transform ${showAboutDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showAboutDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      CollegeAnon
                    </div>
                    <button
                      onClick={() => {
                        setShowFeedbackModal(true);
                        setShowAboutDropdown(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <FiMessageSquare className="mr-2" />
                      Feedback
                    </button>
                    <Link
                      to="/about"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowAboutDropdown(false)}
                    >
                      <FiInfo className="mr-2" />
                      About Us
                    </Link>
                  </div>
                )}
              </div>
              
              {user ? (
                <>
                  <Link to="/create" className="btn btn-primary">
                    Create Post
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 -mb-4 pb-4">
                      <FiUser />
                      <span>{user.anonId}</span>
                      {isPremium && (
                        <span className="flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          <FiStar className="w-3 h-3 mr-1" />
                          Premium
                        </span>
                      )}
                    </button>
                    <div className="absolute right-0 mt-0 pt-4 w-56 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        {user.email}
                      </div>
                      {user.college && (
                        <div className="px-4 py-2 text-sm text-primary-600 border-b bg-primary-50">
                          📚 {user.college}
                        </div>
                      )}
                      {isPremium && (
                        <div className="px-4 py-2 text-sm text-yellow-600 border-b bg-yellow-50 flex items-center">
                          <FiStar className="w-4 h-4 mr-1" />
                          Premium Member
                        </div>
                      )}
                      <Link to="/profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                        <FiSettings className="mr-2" />
                        Profile
                      </Link>
                      {!isPremium && (
                        <Link to="/premium" className="flex items-center px-4 py-2 text-yellow-600 hover:bg-yellow-50">
                          <FiStar className="mr-2" />
                          Upgrade to Premium
                        </Link>
                      )}
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
              <Link
                to="/competitions"
                className="block py-2 text-gray-700 hover:text-primary-600 flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <FiAward />
                Competitions
              </Link>
              <button
                onClick={() => {
                  setShowFeedbackModal(true);
                  setIsOpen(false);
                }}
                className="block w-full text-left py-2 text-gray-700 hover:text-primary-600 flex items-center gap-2"
              >
                <FiMessageSquare />
                Feedback
              </button>
              <Link
                to="/about"
                className="block py-2 text-gray-700 hover:text-primary-600 flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <FiInfo />
                About Us
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
                  {!isPremium && (
                    <Link
                      to="/premium"
                      className="block py-2 text-yellow-600 font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiStar className="inline mr-1" />
                      Upgrade to Premium
                    </Link>
                  )}
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

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </>
  );
};

export default Navbar;

