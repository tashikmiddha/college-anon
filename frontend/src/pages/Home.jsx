import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPosts, clearPosts, clearError } from '../features/posts/postSlice';
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
  const navigate = useNavigate();
  const { posts, isLoading, totalPages, page, isError, error, isSuccess } = useSelector((state) => state.posts);
  const { user, isAuthenticated, isLoading: authLoading } = useSelector((state) => state.auth);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchKey, setSearchKey] = useState(0); // Force re-render on search
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Track additional page loading
  const searchTimeoutRef = useRef(null);
  const loadMoreRef = useRef(null); // Intersection Observer target
  const filterRef = useRef({ category: '', sort: '-createdAt' }); // Track current filter values

  // Track if we've done an initial load
  const initialLoadRef = useRef(false);

  // Update ref when filter state changes
  useEffect(() => {
    filterRef.current = { category, sort };
  }, [category, sort]);

  const getParams = (pageNum = 1) => ({
    page: pageNum,
    sort: filterRef.current.sort,
    ...(filterRef.current.category && { category: filterRef.current.category }),
    ...(search && { search }),
  });

  // Reset initial load flag when filters change
  useEffect(() => {
    initialLoadRef.current = false;
  }, [category, sort, search]);

  useEffect(() => {
    // Check if user is authenticated, if not redirect to login
    if (!isAuthenticated && !user) {
      navigate('/login');
      return;
    }
    
    // Wait for auth loading to complete
    if (authLoading) return;
    
    // Only fetch on initial load or when explicitly triggered
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      dispatch(fetchPosts(getParams(1)));
    }
  }, [dispatch, user, isAuthenticated, navigate, authLoading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && 
            !isLoading && 
            !isLoadingMore && 
            page < totalPages && 
            posts.length > 0) {
          // Load more posts
          loadMorePosts();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [isLoading, isLoadingMore, page, totalPages, posts.length]);

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || page >= totalPages) return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      await dispatch(fetchPosts(getParams(nextPage))).unwrap();
    } catch (err) {
      console.error('Error loading more posts:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [dispatch, page, totalPages, isLoadingMore, getParams]);

  const handleSearch = (e) => {
    e?.preventDefault();
    // Clear any pending debounced search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Set searching state
    setIsSearching(true);
    // Reset to page 1 when searching
    dispatch(fetchPosts({ ...getParams(1), page: 1 }))
      .unwrap()
      .finally(() => {
        setIsSearching(false);
      });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    
    // Clear any pending search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set searching state
    setIsSearching(true);
    
    // Immediately clear posts for visual feedback and reset PostCard state
    dispatch(clearPosts());
    
    // Debounce search - wait 500ms after user stops typing
    // Always trigger search (including when empty to reset results)
    searchTimeoutRef.current = setTimeout(() => {
      setSearchKey(prev => prev + 1); // Force re-render of PostCard components
      dispatch(fetchPosts({ ...getParams(1), page: 1 }))
        .unwrap()
        .finally(() => {
          setIsSearching(false);
        });
    }, 500);
  };

  const handleRetry = () => {
    dispatch(clearError());
    initialLoadRef.current = false;
    dispatch(fetchPosts(getParams(1)));
  };

  const handleFilterChange = (key, value) => {
    if (key === 'category') {
      setCategory(value);
    } else if (key === 'sort') {
      setSort(value);
    }
    // Clear any pending debounced filter
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Debounce filter changes to prevent race conditions
    searchTimeoutRef.current = setTimeout(() => {
      // Reset to page 1 and refetch when filters change
      dispatch(clearPosts());
      dispatch(fetchPosts({ page: 1, sort: filterRef.current.sort, ...(filterRef.current.category && { category: filterRef.current.category }) }));
    }, 300);
  };

  // Show loading while checking auth
  if (!isAuthenticated && !user) {
    return (
      <div className="container-custom py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome to CollegeAnon
        </h1>
        <p className="text-gray-600">
          {user?.college ? `Posts from ${user.college}` : 'Share your thoughts anonymously. Your identity is protected.'}
        </p>
        {user?.isAdmin && (
          <div className="mt-2 inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            Admin Mode - Viewing all posts
          </div>
        )}
      </div>

      {/* College Badge */}
      <div className="flex justify-center mb-8">
        <div className="bg-primary-50 border border-primary-200 px-6 py-3 rounded-full flex items-center">
          <span className="text-primary-600 font-medium">
            {user?.isAdmin ? '🌐 All Colleges' : `📚 Your College: ${user?.college || 'Not set'}`}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search posts by title or content..."
              className="input flex-1 pr-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSearchKey(prev => prev + 1);
                  setIsSearching(true);
                  dispatch(fetchPosts({ page: 1, sort: filterRef.current.sort, ...(filterRef.current.category && { category: filterRef.current.category }) }))
                    .unwrap()
                    .finally(() => {
                      setIsSearching(false);
                    });
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {/* Search Results Info */}
        {search && (
          <div className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-blue-700">
              {isSearching ? 'Searching...' : `Showing results for "${search}"`}
            </span>
            <button
              onClick={() => {
                setSearch('');
                setSearchKey(prev => prev + 1);
                dispatch(fetchPosts({ page: 1, sort: filterRef.current.sort, ...(filterRef.current.category && { category: filterRef.current.category }) }));
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear search
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
          <select
              value={category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
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
              onChange={(e) => handleFilterChange('sort', e.target.value)}
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
      {isLoading || isSearching ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : !isError && posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {search ? `No posts found for "${search}"` : 'No posts found.'}
          </p>
          <p className="text-gray-400">Be the first to share something anonymous!</p>
        </div>
      ) : (
        <div key={searchKey} className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
          
          {/* Infinite Scroll Loading Indicator */}
          {page < totalPages && (
            <div 
              ref={loadMoreRef} 
              className="flex justify-center items-center py-6"
            >
              {isLoadingMore ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="text-gray-500">Loading more posts...</span>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Scroll for more...</span>
              )}
            </div>
          )}
          
          {/* End of Results */}
          {page >= totalPages && posts.length > 0 && (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">You've reached the end</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;

