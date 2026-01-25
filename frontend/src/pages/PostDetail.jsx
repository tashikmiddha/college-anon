import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPost, likePost, deletePost, clearCurrentPost, clearMessage, reportPost, fetchComments, createComment, likeComment, deleteComment } from '../features/posts/postSlice';
import { FiHeart, FiFlag, FiEdit, FiTrash2, FiArrowLeft, FiImage, FiX, FiLock, FiEyeOff, FiMessageCircle, FiSend, FiMoreVertical, FiClock, FiAlertCircle, FiCheckCircle, FiStar } from 'react-icons/fi';
import Toast from '../components/Toast';

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
  const { user } = useSelector((state) => state.auth);
  const { currentPost: post, isLoading, isError, message, isSuccess, error, comments } = useSelector((state) => state.posts);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [underReview, setUnderReview] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentMenu, setShowCommentMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const [reportError, setReportError] = useState(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Reset access denied and under review states
    setAccessDenied(false);
    setUnderReview(false);
    setRejected(false);
    
    dispatch(fetchPost(id)).then((result) => {
      // Check if access was denied (403 response - college restriction)
      if (result.error && result.error.message && result.error.message.includes('permission')) {
        setAccessDenied(true);
      }
      // Check if post is under review (403 response - moderation)
      else if (result.error && result.error.message && result.error.message.includes('under review')) {
        setUnderReview(true);
      }
      // Check if post is rejected (403 response - moderation)
      else if (result.error && result.error.message && result.error.message.includes('rejected')) {
        setRejected(true);
      }
    });

    return () => {
      dispatch(clearCurrentPost());
      dispatch(clearMessage());
    };
  }, [dispatch, id, user, navigate]);

  useEffect(() => {
    // Fetch comments when post is loaded
    if (post && !accessDenied) {
      dispatch(fetchComments({ postId: post._id }));
    }
  }, [dispatch, post, accessDenied]);

  useEffect(() => {
    if (isSuccess && message.includes('deleted')) {
      navigate('/');
    }
  }, [isSuccess, message, navigate]);

  useEffect(() => {
    if (isSuccess && message.includes('reported')) {
      // Clear the message after showing it
      const timer = setTimeout(() => {
        dispatch({ type: 'posts/clearMessage' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, message, dispatch]);

  // Check if user can interact with this post
  const canInteract = user && (user.isAdmin || (post && post.college === user.college));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleLike = () => {
    if (!user) return;
    if (!canInteract) {
      alert(`You can only like posts from your college (${user.college})`);
      return;
    }
    dispatch(likePost(post._id));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deletePost(post._id));
    }
  };

  const handleReport = async () => {
    if (!user) return;
    if (!canInteract) {
      setToast({ message: `You can only report posts from your college (${user.college})`, type: 'warning' });
      return;
    }

    // Client-side validation
    if (!reportReason) {
      setReportError('Please select a reason for reporting');
      return;
    }

    const validReasons = ['spam', 'harassment', 'hate-speech', 'violence', 'misinformation', 'inappropriate', 'other'];
    if (!validReasons.includes(reportReason)) {
      setReportError('Invalid report reason selected');
      return;
    }

    if (reportDescription.length > 500) {
      setReportError('Description cannot exceed 500 characters');
      return;
    }

    try {
      await dispatch(reportPost({ id: post._id, reportData: { reason: reportReason, description: reportDescription } })).unwrap();
      setShowReport(false);
      setReportDescription('');
      setReportReason('spam');
      setReportError(null);
      setToast({ message: 'Post reported successfully! You can track the status in your Profile > My Reports.', type: 'success' });
    } catch (err) {
      console.error('Report error:', err);
      setReportError(err.message || 'Failed to report post. Please try again.');
      setToast({ message: err.message || 'Failed to report post. Please try again.', type: 'error' });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!canInteract) {
      alert(`You can only comment on posts from your college (${user.college})`);
      return;
    }

    try {
      await dispatch(createComment({ postId: post._id, content: commentText })).unwrap();
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const handleCommentLike = (commentId) => {
    if (!user) return;
    dispatch(likeComment(commentId));
  };

  const handleCommentDelete = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteComment(commentId));
    }
    setShowCommentMenu(null);
  };

  // Check if user is the author (moved after null check)
  const isAuthor = user && post?.author && user._id === post.author._id;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="container-custom py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>

        <div className="card text-center py-12">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-100 p-4 rounded-full">
              <FiLock className="w-12 h-12 text-amber-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post from Another College</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            This post is from <strong>{post?.college || 'a different college'}</strong>. 
            You can only view posts from your own college ({user?.college}).
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Back to Home
            </button>
            {user?.isAdmin && (
              <button
                onClick={() => {
                  // Allow admin to bypass the restriction
                  setAccessDenied(false);
                  dispatch(fetchPost(id));
                }}
                className="btn btn-secondary"
              >
                View Anyway (Admin)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show under review state for non-owners trying to view a pending post
  if (underReview) {
    return (
      <div className="container-custom py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>

        <div className="card text-center py-12">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-100 p-4 rounded-full">
              <FiClock className="w-12 h-12 text-amber-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Under Review</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            This post is currently under <strong>admin review</strong> and is not visible to other users. 
            It will be published once an admin approves it.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Back to Home
            </button>
          </div>
        </div>
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
        {/* Success Message */}
        {isSuccess && message && message.includes('reported') && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <FiCheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Report Submitted!</p>
              <p className="text-green-700 text-sm mt-1">
                {message} You can track the status in your Profile {'>'} My Reports.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <FiAlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[post.category]}`}>
                {post.category}
              </span>
              {post.isPinned && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  📌 Pinned
                </span>
              )}
              {post.moderationStatus === 'rejected' && isAuthor && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <FiAlertCircle className="w-3 h-3 mr-1" />
                  Rejected
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{post.title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500 mb-6 pb-6 border-b">
          <span className={`font-medium ${post.author?.isPremium ? 'text-yellow-600' : 'text-gray-700'}`}>
            {post.displayName}
            {post.author?.isPremium && (
              <FiStar className="inline w-3 h-3 ml-1 fill-yellow-500" />
            )}
          </span>
          <span>•</span>
          <span className="break-all">{post.anonId}</span>
          <span>•</span>
          <span className="flex items-center">
            <FiEyeOff className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-none">{post.college}</span>
          </span>
          <span>•</span>
          <span className="whitespace-nowrap">{formatDate(post.createdAt)}</span>
        </div>

        {/* College access notice for non-college posts */}
        {!canInteract && user && !user.isAdmin && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
            <FiLock className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">Viewing post from another college</p>
              <p className="text-amber-700 text-sm mt-1">
                You can view this post but cannot like, comment, or report it. 
                Only posts from <strong>{user.college}</strong> can be interacted with.
              </p>
            </div>
          </div>
        )}

        {/* Owner's post under review notice */}
        {(post.isUnderReview && isAuthor) && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
            <FiAlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-medium">This post is under admin review</p>
              <p className="text-amber-700 text-sm mt-1">
                Your post is currently pending approval and is not visible to other users. 
                It will be published once an admin reviews and approves it.
              </p>
              <p className="text-amber-600 text-xs mt-2">
                <strong>Status:</strong> {post.moderationStatus === 'pending' ? 'Pending Review' : 'Flagged for Review'}
              </p>
            </div>
          </div>
        )}

        {/* Owner's rejected post notice with moderation reason */}
        {(post.isRejected && isAuthor) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <FiAlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Your post was rejected by admin</p>
              <p className="text-red-700 text-sm mt-1">
                The modification you requested has been rejected. The post will remain with its previous approved content.
              </p>
              {post.moderationReason && (
                <div className="mt-3 p-3 bg-red-100 rounded-lg">
                  <p className="text-red-800 text-sm font-medium">Reason from admin:</p>
                  <p className="text-red-700 text-sm mt-1">{post.moderationReason}</p>
                </div>
              )}
              <div className="mt-4 flex gap-3">
                <Link
                  to={`/edit/${post._id}`}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <FiEdit className="w-4 h-4" />
                  <span>Edit & Resubmit</span>
                </Link>
                <button
                  onClick={() => navigate('/')}
                  className="btn btn-secondary"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-8 pt-6 border-t gap-4">
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

            <div className="flex items-center space-x-2 text-gray-600">
              <FiMessageCircle />
              <span>{post.commentCount || 0} comments</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {isAuthor && !post.isRejected && (
              <>
                <Link
                  to={`/edit/${post._id}`}
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 text-sm"
                >
                  <FiEdit />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                >
                  <FiTrash2 />
                  <span>Delete</span>
                </button>
              </>
            )}

            <div className="relative">
              <button
                onClick={() => {
                  setShowReport(!showReport);
                  setReportError(null);
                }}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-500 text-sm"
              >
                <FiFlag />
                <span>Report</span>
              </button>

              {showReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowReport(false)}>
                  <div 
                    className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white">
                      <p className="text-sm font-medium text-gray-700">
                        Report this post
                      </p>
                      <button
                        onClick={() => setShowReport(false)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="px-4 py-4 space-y-4">
                      {reportError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-600">{reportError}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={reportReason}
                          onChange={(e) => {
                            setReportReason(e.target.value);
                            setReportError(null);
                          }}
                          className="w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                        >
                          <option value="spam">Spam</option>
                          <option value="harassment">Harassment</option>
                          <option value="hate-speech">Hate Speech</option>
                          <option value="violence">Violence</option>
                          <option value="misinformation">Misinformation</option>
                          <option value="inappropriate">Inappropriate</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional details (optional)
                        </label>
                        <textarea
                          value={reportDescription}
                          onChange={(e) => {
                            setReportDescription(e.target.value);
                            setReportError(null);
                          }}
                          placeholder="Provide more context about why you're reporting this post..."
                          className="w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                          rows="4"
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">
                          {reportDescription.length}/500
                        </p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setShowReport(false)}
                          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleReport}
                          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiFlag className="w-4 h-4" />
                          Submit Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
          <FiMessageCircle className="mr-2 w-5 h-5" />
          Comments ({post.commentCount || 0})
        </h2>

        {/* Comment Form */}
        {user && canInteract && (
          <form onSubmit={handleCommentSubmit} className="card mb-4 sm:mb-6">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-600">
                  {user.displayName?.charAt(0) || 'A'}
                </span>
              </div>
              {/* Input */}
              <div className="flex-1 min-w-0">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 resize-none"
                  rows="3"
                  maxLength={2000}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{commentText.length}/2000</span>
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isLoading}
                    className="btn btn-primary text-sm py-1.5 px-3"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-3 sm:space-y-4">
          {comments.length === 0 ? (
            <div className="card text-center py-6">
              <FiMessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isCommentAuthor = user && comment.author && user._id === comment.author._id;
              const canDeleteComment = isCommentAuthor || user?.isAdmin;

              return (
                <div key={comment._id} className="card p-4">
                  {/* Header: Avatar, Name, Date */}
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gray-600">
                        {comment.displayName?.charAt(0) || 'A'}
                      </span>
                    </div>
                    
                    {/* Name and Date */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${comment.author?.isPremium ? 'text-yellow-600' : 'text-gray-800'}`}>
                          {comment.displayName || 'Anonymous'}
                        </span>
                        {comment.author?.isPremium && <FiStar className="w-3 h-3 fill-yellow-500 text-yellow-500" />}
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{formatCommentDate(comment.createdAt)}</span>
                      </div>
                      
                      {/* Comment Content */}
                      <p className="text-gray-700 text-sm mt-1 break-words">{comment.content}</p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => handleCommentLike(comment._id)}
                          disabled={!user}
                          className={`flex items-center gap-1 text-xs ${
                            comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                          } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <FiHeart className={comment.isLiked ? 'fill-current w-3 h-3' : 'w-3 h-3'} />
                          {comment.likeCount || 0}
                        </button>
                      </div>
                    </div>
                    
                    {/* Delete Button */}
                    {canDeleteComment && (
                      <button
                        onClick={() => handleCommentDelete(comment._id)}
                        className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                        title="Delete comment"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
};

export default PostDetail;

