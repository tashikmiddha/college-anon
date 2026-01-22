import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiMessageSquare, FiFlag, FiClock, FiImage, FiLock } from 'react-icons/fi';
import { likePost, reportPost } from '../features/posts/postSlice';
import { useState } from 'react';

const categoryColors = {
  general: 'bg-gray-100 text-gray-800',
  academic: 'bg-blue-100 text-blue-800',
  'campus-life': 'bg-green-100 text-green-800',
  confession: 'bg-purple-100 text-purple-800',
  advice: 'bg-yellow-100 text-yellow-800',
  humor: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
};

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [imageError, setImageError] = useState(false);

  // Check if user can interact with this post (same college or admin)
  const canInteract = user && (user.isAdmin || post.college === user.college);

  const handleLike = () => {
    if (!user) return;
    if (!canInteract) {
      alert(`You can only like posts from your college (${user.college})`);
      return;
    }
    dispatch(likePost(post._id));
  };

  const handleReport = () => {
    if (!user) return;
    if (!canInteract) {
      alert(`You can only report posts from your college (${user.college})`);
      return;
    }
    dispatch(reportPost({ id: post._id, reportData: { reason: reportReason } }));
    setShowReport(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content || typeof content !== 'string') return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  // Get optimized image URL for thumbnail (Cloudinary transformations)
  const getThumbnailUrl = (url) => {
    if (!url) return null;
    // Add Cloudinary transformation for 400x300 crop
    return url.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto:good/f_auto/');
  };

  const hasImage = post.image && post.image.url && !imageError;
  const isRestricted = user && !canInteract;

  return (
    <div className={`card hover:shadow-lg transition-shadow ${isRestricted ? 'opacity-75' : ''}`}>
      {hasImage && (
        <Link to={`/post/${post._id}`} className="block -mx-6 -mt-6 mb-4">
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={getThumbnailUrl(post.image.url)}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center">
              <FiImage className="w-3 h-3 mr-1" />
              Image
            </div>
          </div>
        </Link>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[post.category] || 'bg-gray-100 text-gray-800'}`}>
              {post.category}
            </span>
            <span className="text-sm text-gray-500">{post.displayName}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">{post.anonId}</span>
          </div>
          
          <Link to={`/post/${post._id}`} className="block">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
              {post.title}
            </h3>
          </Link>
          
          <p className="mt-2 text-gray-600 text-sm">
            {truncateContent(post.content)}
          </p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {post.isPinned && (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            📌 Pinned
          </span>
        )}
      </div>

      {/* College info bar */}
      {isRestricted && (
        <div className="mt-3 py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center text-amber-700 text-sm">
          <FiLock className="w-4 h-4 mr-2" />
          <span>Post from <strong>{post.college}</strong> - View only</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={!user}
            className={`flex items-center space-x-1 text-sm ${user && canInteract ? 'hover:text-red-500' : 'cursor-not-allowed opacity-50'}`}
            title={!canInteract ? `Only for ${user?.college} users` : ''}
          >
            <FiHeart className={post.isLiked ? 'fill-red-500 text-red-500' : ''} />
            <span>{post.likeCount || 0}</span>
          </button>

          <Link 
            to={`/post/${post._id}`} 
            className={`flex items-center space-x-1 text-sm ${canInteract ? 'text-gray-600 hover:text-primary-600' : 'text-gray-400 cursor-not-allowed'}`}
          >
            <FiMessageSquare />
            <span>{post.commentCount || 0}</span>
          </Link>

          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <FiClock />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              if (!canInteract) {
                alert(`You can only report posts from your college (${user?.college})`);
                return;
              }
              setShowReport(!showReport);
            }}
            className={`${canInteract ? 'text-gray-400 hover:text-red-500' : 'text-gray-300 cursor-not-allowed'}`}
            title={!canInteract ? `Only for ${user?.college} users` : 'Report'}
            disabled={!canInteract}
          >
            <FiFlag />
          </button>

          {showReport && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-10">
              <p className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                Report post
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
  );
};

export default PostCard;

