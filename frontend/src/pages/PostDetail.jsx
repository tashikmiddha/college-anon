import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPost, likePost, deletePost, clearCurrentPost, clearMessage, reportPost } from '../features/posts/postSlice';
import { FiHeart, FiFlag, FiEdit, FiTrash2, FiArrowLeft, FiImage, FiX } from 'react-icons/fi';

const categoryColors = {
  general: 'bg-gray-100 text-gray-800',
  academic: 'bg-blue-100 text-blue-800',
  'campus-life': 'bg-green-100 text-green-800',
  confession: 'bg-purple-100 text-purple-800',
  advice: 'bg-yellow-100 text-yellow-800',
  humor: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
};

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPost: post, isLoading, isError, message, isSuccess } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }
    
    dispatch(fetchPost(id));

    return () => {
      dispatch(clearCurrentPost());
      dispatch(clearMessage());
    };
  }, [dispatch, id, user, navigate]);

  useEffect(() => {
    if (isSuccess && message.includes('deleted')) {
      navigate('/');
    }
  }, [isSuccess, message, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container-custom py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
        <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLike = () => {
    if (!user) return;
    dispatch(likePost(post._id));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deletePost(post._id));
    }
  };

  const handleReport = () => {
    if (!user) return;
    dispatch(reportPost({ id: post._id, reportData: { reason: reportReason } }));
    setShowReport(false);
  };

  const isAuthor = user && post.author && user._id === post.author._id;

  return (
    <div className="container-custom py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Back
      </button>

      <article className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[post.category]}`}>
                {post.category}
              </span>
              {post.isPinned && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  📌 Pinned
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6 pb-6 border-b">
          <span className="font-medium text-gray-700">{post.displayName}</span>
          <span>•</span>
          <span>{post.anonId}</span>
          <span>•</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Post Image */}
        {post.image && post.image.url && !imageError && (
          <div className="mt-6">
            <div 
              className="relative rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={post.image.url}
                alt={post.title}
                className="w-full h-auto max-h-[500px] object-contain bg-gray-100"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  <FiImage className="w-4 h-4 mr-2" />
                  Click to view full size
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightboxOpen && post.image && post.image.url && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setLightboxOpen(false)}
            >
              <FiX className="w-8 h-8" />
            </button>
            <img
              src={post.image.url}
              alt={post.title}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
            {post.tags.map((tag, index) => (
              <span key={index} className="text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                user ? 'hover:bg-gray-100' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <FiHeart className={post.isLiked ? 'fill-red-500 text-red-500' : ''} />
              <span>{post.likeCount || 0} likes</span>
            </button>

            <span className="text-gray-500">
              {post.commentCount || 0} comments
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthor && (
              <>
                <Link
                  to={`/edit/${post._id}`}
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600"
                >
                  <FiEdit />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <FiTrash2 />
                  <span>Delete</span>
                </button>
              </>
            )}

            <div className="relative">
              <button
                onClick={() => setShowReport(!showReport)}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-500"
              >
                <FiFlag />
                <span>Report</span>
              </button>

              {showReport && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-3 z-10">
                  <p className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                    Report this post
                  </p>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-4 py-2 text-sm border-b"
                  >
                    <option value="spam">Spam</option>
                    <option value="harassment">Harassment</option>
                    <option value="hate-speech">Hate Speech</option>
                    <option value="violence">Violence</option>
                    <option value="misinformation">Misinformation</option>
                    <option value="inappropriate">Inappropriate</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    onClick={handleReport}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Submit Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostDetail;

