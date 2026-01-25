import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { refreshAnonId, updateProfile } from '../features/auth/authSlice';
import { fetchMyPosts, deletePost, fetchMyComments, deleteComment } from '../features/posts/postSlice';
import { fetchMyReports, fetchMyFeedbacks } from '../features/admin/adminSlice';
import { FiStar, FiImage, FiAward, FiClock, FiExternalLink, FiAlertCircle, FiCheckCircle, FiX, FiEdit, FiTrash2, FiFlag, FiEye, FiInfo, FiHeart, FiMessageSquare, FiCheck, FiAlertTriangle, FiZap } from 'react-icons/fi';

const Profile = () => {
  const { user, isLoading, isSuccess, message } = useSelector((state) => state.auth);
  const { myPosts, isLoading: postsLoading, myComments } = useSelector((state) => state.posts);
  const { myReports, myFeedbacks, isLoading: reportsLoading, isError: reportsError } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [activeTab, setActiveTab] = useState('profile');

  const { displayName, newPassword, confirmPassword } = formData;

  const isPremium = user?.isPremium && new Date(user?.premiumExpiresAt) > new Date();
  const premiumExpiresAt = user?.premiumExpiresAt ? new Date(user.premiumExpiresAt) : null;
  const imageLimit = user?.premiumLimits?.imageUploads || 0;
  const imageUsed = user?.premiumUsage?.imageUploads || 0;
  const competitionLimit = user?.premiumLimits?.competitions || 0;
  const competitionUsed = user?.premiumUsage?.competitions || 0;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(fetchMyPosts());
      dispatch(fetchMyReports());
      dispatch(fetchMyFeedbacks());
      dispatch(fetchMyComments());
    }
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (isSuccess && message) {
      setFormData({
        displayName: displayName,
        newPassword: '',
        confirmPassword: '',
      });
      const timer = setTimeout(() => {
        dispatch({ type: 'auth/clearError' });
        dispatch({ type: 'auth/resetSuccess' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, message, dispatch, displayName]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const updateData = { displayName };
    if (newPassword) {
      updateData.password = newPassword;
    }
    dispatch(updateProfile(updateData));
  };

  const handleRefreshAnonId = () => {
    if (window.confirm('Are you sure you want to generate a new anonymous ID? Your current ID will be replaced.')) {
      dispatch(refreshAnonId());
    }
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deletePost(postId));
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteComment(commentId));
    }
  };

  const getModerationStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FiCheckCircle className="w-3 h-3 mr-1" />Approved</span>;
      case 'pending': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FiAlertCircle className="w-3 h-3 mr-1" />Pending Approval</span>;
      case 'flagged': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><FiX className="w-3 h-3 mr-1" />Flagged</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getReportStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FiClock className="w-3 h-3 mr-1" />Pending Review</span>;
      case 'resolved': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FiCheckCircle className="w-3 h-3 mr-1" />Resolved</span>;
      case 'dismissed': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><FiX className="w-3 h-3 mr-1" />Dismissed</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getReportReasonLabel = (reason) => {
    const reasons = { 'spam': 'Spam', 'harassment': 'Harassment', 'hate-speech': 'Hate Speech', 'violence': 'Violence', 'misinformation': 'Misinformation', 'inappropriate': 'Inappropriate', 'other': 'Other' };
    return reasons[reason] || reason;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content || typeof content !== 'string') return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  if (!user) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab user={user} isPremium={isPremium} premiumExpiresAt={premiumExpiresAt} imageLimit={imageLimit} imageUsed={imageUsed} competitionLimit={competitionLimit} competitionUsed={competitionUsed} isLoading={isLoading} message={message} displayName={displayName} newPassword={newPassword} confirmPassword={confirmPassword} handleChange={handleChange} handleSubmit={handleSubmit} handleRefreshAnonId={handleRefreshAnonId} />;
      case 'posts': return <PostsTab myPosts={myPosts} postsLoading={postsLoading} truncateContent={truncateContent} formatDate={formatDate} getModerationStatusBadge={getModerationStatusBadge} handleDeletePost={handleDeletePost} />;
      case 'comments': return <CommentsTab myComments={myComments} postsLoading={postsLoading} truncateContent={truncateContent} formatDate={formatDate} handleDeleteComment={handleDeleteComment} />;
      case 'reports': return <ReportsTab myReports={myReports} reportsLoading={reportsLoading} reportsError={reportsError} formatDate={formatDate} getReportStatusBadge={getReportStatusBadge} getReportReasonLabel={getReportReasonLabel} truncateContent={truncateContent} />;
      case 'feedbacks': return <FeedbacksTab myFeedbacks={myFeedbacks} reportsLoading={reportsLoading} reportsError={reportsError} formatDate={formatDate} />;
      default: return null;
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveTab('profile')} className={`px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'profile' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Profile</button>
            <button onClick={() => setActiveTab('posts')} className={`px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'posts' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>My Posts</button>
            <button onClick={() => setActiveTab('comments')} className={`px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'comments' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} flex items-center`}><FiMessageSquare className="w-4 h-4 mr-1" /><span className="hidden sm:inline">My</span> Comments</button>
            <button onClick={() => setActiveTab('reports')} className={`px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'reports' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} flex items-center`}><FiFlag className="w-4 h-4 mr-1" /><span className="hidden sm:inline">My</span> Reports</button>
            <button onClick={() => setActiveTab('feedbacks')} className={`px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'feedbacks' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} flex items-center`}><FiMessageSquare className="w-4 h-4 mr-1" /><span className="hidden sm:inline">My</span> Feedback</button>
          </div>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
};

const ProfileTab = ({ user, isPremium, premiumExpiresAt, imageLimit, imageUsed, competitionLimit, competitionUsed, isLoading, message, displayName, newPassword, confirmPassword, handleChange, handleSubmit, handleRefreshAnonId }) => (
  <>
    {isPremium ? (
      <div className="card space-y-4 mb-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0"><FiStar className="w-6 h-6 text-yellow-600" /></div>
            <div><h2 className="text-xl font-semibold text-yellow-800">Premium Member</h2><p className="text-sm text-yellow-600">Valid until {premiumExpiresAt.toLocaleDateString()}</p></div>
          </div>
          <Link to="/premium" className="btn btn-secondary text-sm self-start sm:self-auto"><FiExternalLink className="mr-1" />Manage</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-yellow-200">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center text-sm text-gray-600"><FiImage className="mr-1" />Image Uploads</span>
              <span className="text-sm font-medium">{imageUsed} / {imageLimit}</span>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((imageUsed / imageLimit) * 100, 100)}%` }} /></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center text-sm text-gray-600"><FiAward className="mr-1" />Competitions</span>
              <span className="text-sm font-medium">{competitionUsed} / {competitionLimit}</span>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((competitionUsed / competitionLimit) * 100, 100)}%` }} /></div>
          </div>
        </div>
      </div>
    ) : (
      <div className="card space-y-4 mb-6 bg-gray-50 border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0"><FiStar className="w-6 h-6 text-gray-500" /></div>
            <div><h2 className="text-xl font-semibold text-gray-700">Standard Member</h2><p className="text-sm text-gray-500">Upgrade to unlock premium features</p></div>
          </div>
          <Link to="/premium" className="btn btn-primary text-sm self-start sm:self-auto"><FiStar className="mr-1" />Upgrade</Link>
        </div>
      </div>
    )}
    <div className="card space-y-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Account Information</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={user.email} disabled className="input bg-gray-100" />
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div><p className="font-medium text-blue-900">Anonymous ID</p><p className="text-sm text-blue-700 break-all">{user.anonId}</p></div>
          <button onClick={handleRefreshAnonId} disabled={isLoading} className="btn btn-secondary text-sm self-start">Generate New ID</button>
        </div>
        <p className="text-xs text-blue-600 mt-2">Your anonymous ID is what other users see. You can regenerate it anytime.</p>
      </div>
    </div>
    <form onSubmit={handleSubmit} className="card space-y-6">
      <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{message}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
        <input type="text" name="displayName" value={displayName} onChange={handleChange} className="input" placeholder="Your display name" />
        <p className="text-sm text-gray-500 mt-1">This is shown publicly instead of your anonymous ID (optional)</p>
      </div>
      <div className="border-t pt-6">
        <h3 className="font-medium text-gray-900 mb-4">Change Password (optional)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" name="newPassword" value={newPassword} onChange={handleChange} className="input" placeholder="••••••••" minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" name="confirmPassword" value={confirmPassword} onChange={handleChange} className="input" placeholder="••••••••" />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isLoading} className="btn btn-primary">{isLoading ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </form>
  </>
);

const PostsTab = ({ myPosts, postsLoading, truncateContent, formatDate, getModerationStatusBadge, handleDeletePost }) => (
  <div className="card">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h2 className="text-xl font-semibold">My Posts</h2>
      <Link to="/create" className="btn btn-primary self-start sm:self-auto">Create New Post</Link>
    </div>
    {postsLoading ? (
      <div className="text-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div><p className="text-gray-500 mt-4">Loading your posts...</p></div>
    ) : myPosts.length === 0 ? (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"><FiEdit className="w-8 h-8 text-gray-400" /></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-500 mb-6">You haven't created any posts yet.</p>
        <Link to="/create" className="btn btn-primary">Create Your First Post</Link>
      </div>
    ) : (
      <div className="space-y-4">
        {myPosts.map((post) => (
          <div key={post._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            {post.image && post.image.url && (
              <Link to={`/post/${post._id}`} className="block -mx-4 -mt-4 mb-4">
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <img src={post.image.url.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto:good/f_auto/')} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center"><FiImage className="w-3 h-3 mr-1" />Image</div>
                </div>
              </Link>
            )}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">{getModerationStatusBadge(post.moderationStatus)}<span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span></div>
                <Link to={`/post/${post._id}`} className="block"><h3 className="font-semibold text-gray-900 hover:text-primary-600">{post.title}</h3></Link>
                <p className="text-gray-600 text-sm mt-2">{truncateContent(post.content)}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center"><FiHeart className="w-4 h-4 mr-1" />{post.likeCount || 0}</span>
                  <span className="flex items-center"><FiMessageSquare className="w-4 h-4 mr-1" />{post.commentCount || 0}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:ml-4">
                {post.moderationStatus === 'approved' && <Link to={`/edit/${post._id}`} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit post"><FiEdit className="w-5 h-5" /></Link>}
                <button onClick={() => handleDeletePost(post._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete post"><FiTrash2 className="w-5 h-5" /></button>
              </div>
            </div>
            {post.moderationStatus === 'flagged' && post.moderationReason && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-700"><strong>Reason:</strong> {post.moderationReason}</p></div>}
            {post.moderationStatus === 'pending' && <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"><p className="text-sm text-yellow-700 flex items-center"><FiAlertCircle className="w-4 h-4 mr-2" />Your post is gone for admin approval.</p></div>}
          </div>
        ))}
      </div>
    )}
  </div>
);

const ReportsTab = ({ myReports, reportsLoading, reportsError, formatDate, getReportStatusBadge, getReportReasonLabel, truncateContent }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold flex items-center">
        <FiFlag className="w-5 h-5 mr-2" />
        <span className="hidden sm:inline">My</span> Reports
      </h2>
    </div>
    {reportsLoading ? (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading your reports...</p>
      </div>
    ) : reportsError ? (
      <div className="text-center py-8">
        <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading reports</h3>
        <p className="text-gray-500">Please try again later.</p>
      </div>
    ) : myReports.length === 0 ? (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <FiFlag className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reports submitted</h3>
        <p className="text-gray-500 mb-6">You haven't reported any posts yet.</p>
        <Link to="/" className="btn btn-primary">Browse Posts</Link>
      </div>
    ) : (
      <div className="space-y-4">
        {myReports.map((report) => (
          <div key={report._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            {/* Header: Status badge, date, and View Post link */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                {getReportStatusBadge(report.status)}
                <span className="text-sm text-gray-500">{formatDate(report.createdAt)}</span>
              </div>
              {report.post && (
                <Link 
                  to={`/post/${report.post._id}`} 
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700 self-start"
                >
                  <FiEye className="w-4 h-4 mr-1" />
                  View Post
                </Link>
              )}
            </div>

            {/* Report reason */}
            <div className="mb-3">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Reported for: </span>
                <span className="text-red-600 font-medium">{getReportReasonLabel(report.reason)}</span>
              </p>
            </div>

            {/* Report description */}
            {report.description && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg break-words">
                  {report.description}
                </p>
              </div>
            )}

            {/* Reported post preview */}
            {report.post && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Reported Post
                </p>
                <Link to={`/post/${report.post._id}`} className="block group">
                  <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {report.post.title || 'Untitled Post'}
                  </p>
                </Link>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {truncateContent(report.post.content, 150)}
                </p>
              </div>
            )}

            {/* Resolution/Dismissal info */}
            {(report.status === 'resolved' || report.status === 'dismissed') && (
              <div className={`mt-3 p-3 rounded-lg ${
                report.status === 'resolved' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-start">
                  <FiInfo className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${
                    report.status === 'resolved' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      report.status === 'resolved' ? 'text-green-800' : 'text-gray-800'
                    }`}>
                      {report.status === 'resolved' ? 'Report Resolved' : 'Report Dismissed'}
                    </p>
                    {report.adminNotes && (
                      <p className={`text-sm mt-1 ${
                        report.status === 'resolved' ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        <span className="font-medium">Admin Response:</span> {report.adminNotes}
                      </p>
                    )}
                    {report.reviewedAt && (
                      <p className={`text-xs mt-1 ${
                        report.status === 'resolved' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        Reviewed on {formatDate(report.reviewedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pending status */}
            {report.status === 'pending' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700 flex items-center">
                  <FiClock className="w-4 h-4 mr-2 flex-shrink-0" />
                  Your report is being reviewed by our moderation team.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const FeedbacksTab = ({ myFeedbacks, reportsLoading, reportsError, formatDate }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-semibold flex items-center"><FiMessageSquare className="w-5 h-5 mr-2" />My Feedback</h2></div>
    {reportsLoading ? (
      <div className="text-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div><p className="text-gray-500 mt-4">Loading your feedbacks...</p></div>
    ) : reportsError ? (
      <div className="text-center py-8"><div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"><FiAlertCircle className="w-8 h-8 text-red-500" /></div><h3 className="text-lg font-medium text-gray-900 mb-2">Error loading feedbacks</h3><p className="text-gray-500">Please try again later.</p></div>
    ) : myFeedbacks.length === 0 ? (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"><FiMessageSquare className="w-8 h-8 text-gray-400" /></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback submitted</h3>
        <p className="text-gray-500 mb-6">You haven't submitted any feedback yet.</p>
        <Link to="/" className="btn btn-primary">Go to Home</Link>
      </div>
    ) : (
      <div className="space-y-4">
        {myFeedbacks.map((feedback) => (
          <div key={feedback._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${feedback.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {feedback.status === 'pending' ? <span className="flex items-center"><FiClock className="w-3 h-3 mr-1" />Pending Review</span> : <span className="flex items-center"><FiCheck className="w-3 h-3 mr-1" />Resolved</span>}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${feedback.type === 'bug' ? 'bg-red-100 text-red-800' : feedback.type === 'feature' ? 'bg-yellow-100 text-yellow-800' : feedback.type === 'suggestion' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {feedback.type === 'bug' && <FiAlertTriangle className="w-3 h-3 inline mr-1" />}
                  {feedback.type === 'feature' && <FiZap className="w-3 h-3 inline mr-1" />}
                  {feedback.type === 'suggestion' && <FiMessageSquare className="w-3 h-3 inline mr-1" />}
                  <span className="capitalize">{feedback.type}</span>
                </span>
                <span className="text-sm text-gray-500">{formatDate(feedback.createdAt)}</span>
              </div>
            </div>
            <p className="text-gray-700">{feedback.message}</p>
            {feedback.status === 'resolved' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <FiCheck className="w-5 h-5 mr-2 mt-0.5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Feedback Resolved</p>
                    {feedback.adminNotes && <p className="text-sm text-green-700 mt-1"><strong>Admin Response:</strong> {feedback.adminNotes}</p>}
                    {feedback.reviewedAt && <p className="text-xs text-green-600 mt-1">Resolved on {formatDate(feedback.reviewedAt)}</p>}
                  </div>
                </div>
              </div>
            )}
            {feedback.status === 'pending' && <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"><p className="text-sm text-yellow-700 flex items-center"><FiClock className="w-4 h-4 mr-2" />Your feedback is being reviewed by our team.</p></div>}
          </div>
        ))}
      </div>
    )}
  </div>
);

const CommentsTab = ({ myComments, postsLoading, truncateContent, formatDate, handleDeleteComment }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-semibold flex items-center"><FiMessageSquare className="w-5 h-5 mr-2" />My Comments</h2></div>
    {postsLoading ? (
      <div className="text-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div><p className="text-gray-500 mt-4">Loading your comments...</p></div>
    ) : myComments.length === 0 ? (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"><FiMessageSquare className="w-8 h-8 text-gray-400" /></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
        <p className="text-gray-500 mb-6">You haven't made any comments on posts.</p>
        <Link to="/" className="btn btn-primary">Browse Posts</Link>
      </div>
    ) : (
      <div className="space-y-4">
        {myComments.map((comment) => (
          <div key={comment._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="flex items-center text-sm text-gray-500"><FiHeart className="w-4 h-4 mr-1" />{comment.likeCount || 0}</span>
              </div>
            </div>
            {comment.post && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">Commented on:</p>
                <Link to={`/post/${comment.post._id}`} className="block">
                  <p className="font-medium text-gray-900 hover:text-primary-600">{comment.post.title || 'Untitled Post'}</p>
                </Link>
              </div>
            )}
            <p className="text-gray-700">{comment.content}</p>
            <div className="mt-3 flex items-center justify-end">
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete comment"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Profile;

