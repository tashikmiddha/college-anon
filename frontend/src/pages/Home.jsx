import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, clearError } from '../features/posts/postSlice';
import PostCard from '../components/PostCard';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'general', label: 'General' },
  { value: 'academic', label: 'Academic' },
  { value: 'campus-life', label: 'Campus Life' },
  { value: 'confession', label: 'Confession' },
  { value: 'advice', label: 'Advice' },
  { value: 'humor', label: 'Humor' },
  { value: 'other', label: 'Other' },
];

const sortOptions = [
  { value: '-createdAt', label: 'Newest' },
  { value: '-likeCount', label: 'Most Liked' },
  { value: 'createdAt', label: 'Oldest' },
];

const Home = () => {
  const dispatch = useDispatch();
  const { posts, isLoading, totalPages, page, isError, error } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [search, setSearch] = useState('');

  const getParams = () => ({
    page,
    sort,
    ...(category && { category }),
    ...(search && { search }),
  });

  useEffect(() => {
    // Fetch posts for the home page
    // If user is logged in and OpenAI moderation is enabled, also fetch their pending posts
    dispatch(fetchPosts(getParams()));
  }, [dispatch, page, category, sort, search, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchPosts(getParams()));
  };

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(fetchPosts(getParams()));
  };

  const handleFilterChange = (key, value) => {
    if (key === 'category') {
      setCategory(value);
    } else if (key === 'sort') {
      setSort(value);
    }
  };

  return (
    <div className="container-custom py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome to CollegeAnon
        </h1>
        <p className="text-gray-600">
          Share your thoughts anonymously. Your identity is protected.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {isError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Error loading posts</h3>
              <p className="mt-1 text-sm text-red-700">{error || 'An unexpected error occurred'}</p>
              <button
                onClick={handleRetry}
                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : !isError && posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts found.</p>
          <p className="text-gray-400">Be the first to share something anonymous!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => dispatch(fetchPosts({ page: pageNum, category, sort, search }))}
              className={`px-4 py-2 rounded-lg ${
                page === pageNum
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

