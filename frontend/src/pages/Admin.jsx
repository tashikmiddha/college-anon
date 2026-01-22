import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { adminAPI } from '../features/admin/adminAPI';
import PostCard from '../components/PostCard';
import { FiUsers, FiFileText, FiFlag, FiCheck, FiX, FiTrash2, FiShield, FiUnlock, FiStar, FiEdit2 } from 'react-icons/fi';
import { allColleges } from '../utils/colleges';

const Admin = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [premiumData, setPremiumData] = useState({
    imageUploads: 10,
    competitions: 5,
    durationDays: 30
  });
  const [postFilter, setPostFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [premiumStatusFilter, setPremiumStatusFilter] = useState('');

  useEffect(() => {
    if (user?.isAdmin) {
      fetchAdminData();
    }
  }, [user, activeTab, postFilter, collegeFilter, premiumStatusFilter]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'stats':
          const statsData = await adminAPI.getStats({ college: collegeFilter || undefined });
          setStats(statsData);
          break;
        case 'posts':
          const filter = {};
          if (postFilter !== 'all') {
            filter.status = postFilter;
          }
          if (collegeFilter) {
            filter.college = collegeFilter;
          }
          const postsData = await adminAPI.getAllPosts(filter);
          setPosts(postsData.posts);
          break;
        case 'reports':
          const reportsData = await adminAPI.getReports({ college: collegeFilter || undefined });
          setReports(reportsData);
          break;
        case 'users':
          const usersData = await adminAPI.getUsers({ college: collegeFilter || undefined });
          setUsers(usersData);
          break;
        case 'premium':
          const premiumParams = {};
          if (collegeFilter) {
            premiumParams.college = collegeFilter;
          }
          if (premiumStatusFilter) {
            premiumParams.status = premiumStatusFilter;
          }
          const premiumData = await adminAPI.getPremiumUsers(premiumParams);
          setPremiumUsers(premiumData);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
    setLoading(false);
  };

  const handleModeratePost = async (postId, status) => {
    try {
      await adminAPI.moderatePost(postId, { status });
      fetchAdminData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      await adminAPI.resolveReport(reportId, { status });
      fetchAdminData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleTogglePin = async (postId) => {
    try {
      await adminAPI.togglePin(postId);
      fetchAdminData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await adminAPI.deletePost(postId);
        fetchAdminData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      await adminAPI.toggleAdmin(userId);
      fetchAdminData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    try {
      await adminAPI.blockUser(selectedUser._id, blockReason);
      setShowBlockModal(false);
      setSelectedUser(null);
      setBlockReason('');
      fetchAdminData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await adminAPI.unblockUser(userId);
      fetchAdminData();
    } catch (error) {
      alert(error.message);
    }
  };

  const openBlockModal = (user) => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };

  const openPremiumModal = (user) => {
    setSelectedUser(user);
    setPremiumData({
      imageUploads: user.premiumLimits?.imageUploads || 10,
      competitions: user.premiumLimits?.competitions || 5,
      durationDays: 30
    });
    setShowPremiumModal(true);
  };

  const handleGrantPremium = async () => {
    if (!selectedUser) return;
    try {
      await adminAPI.grantPremium(selectedUser._id, premiumData);
      setShowPremiumModal(false);
      setSelectedUser(null);
      fetchAdminData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRevokePremium = async (userId) => {
    if (window.confirm('Are you sure you want to revoke premium access from this user?')) {
      try {
        await adminAPI.revokePremium(userId);
        fetchAdminData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleResetUsage = async (userId) => {
    if (window.confirm('Reset premium usage for this user?')) {
      try {
        await adminAPI.resetPremiumUsage(userId);
        fetchAdminData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  if (!user || !user.isAdmin) {
    return <Navigate to="/" />;
  }

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: FiFileText },
    { id: 'posts', label: 'Posts', icon: FiCheck },
    { id: 'reports', label: 'Reports', icon: FiFlag },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'premium', label: 'Premium', icon: FiStar },
  ];

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your anonymous college blog</p>
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Block User</h3>
            <p className="text-gray-600 mb-4">
              You are about to block <strong>{selectedUser?.anonId}</strong>. 
              This will prevent them from logging in and posting.
            </p>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Reason for blocking (optional)
            </label>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
              rows="3"
              placeholder="Enter reason for blocking..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedUser(null);
                  setBlockReason('');
                }}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Block User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Grant Premium Access</h3>
            <p className="text-gray-600 mb-4">
              Granting premium to: <strong>{selectedUser?.anonId}</strong>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Image Upload Limit
                </label>
                <input
                  type="number"
                  value={premiumData.imageUploads}
                  onChange={(e) => setPremiumData({ ...premiumData, imageUploads: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Competitions Limit
                </label>
                <input
                  type="number"
                  value={premiumData.competitions}
                  onChange={(e) => setPremiumData({ ...premiumData, competitions: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={premiumData.durationDays}
                  onChange={(e) => setPremiumData({ ...premiumData, durationDays: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowPremiumModal(false);
                  setSelectedUser(null);
                }}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleGrantPremium}
                className="btn bg-yellow-500 text-white hover:bg-yellow-600"
              >
                <FiStar className="mr-1" />
                Grant Premium
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* College Filter */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by College
            </label>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All Colleges</option>
              {allColleges.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>
          {activeTab === 'premium' && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Premium Status
              </label>
              <select
                value={premiumStatusFilter}
                onChange={(e) => setPremiumStatusFilter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          )}
          {(collegeFilter || premiumStatusFilter) && (
            <div className="flex items-center">
              <button
                onClick={() => {
                  setCollegeFilter('');
                  setPremiumStatusFilter('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                <FiX className="w-4 h-4 mr-1" />
                Clear Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card text-center">
                <FiFileText className="text-4xl text-primary-600 mx-auto mb-2" />
                <p className="text-3xl font-bold">{stats.totalPosts}</p>
                <p className="text-gray-600">Total Posts</p>
              </div>
              <div className="card text-center">
                <FiUsers className="text-4xl text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                <p className="text-gray-600">Total Users</p>
              </div>
              <div className="card text-center">
                <FiCheck className="text-4xl text-yellow-600 mx-auto mb-2" />
                <p className="text-3xl font-bold">{stats.pendingModeration}</p>
                <p className="text-gray-600">Pending Moderation</p>
              </div>
              <div className="card text-center">
                <FiFlag className="text-4xl text-red-600 mx-auto mb-2" />
                <p className="text-3xl font-bold">{stats.pendingReports}</p>
                <p className="text-gray-600">Pending Reports</p>
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">All Posts</h2>
                <select
                  value={postFilter}
                  onChange={(e) => setPostFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="all">All Posts</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>
              {posts.length === 0 ? (
                <p className="text-gray-600">No posts found.</p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post._id} className="card">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              post.moderationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                              post.moderationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              post.moderationStatus === 'flagged' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {post.moderationStatus}
                            </span>
                            <span className="text-sm text-gray-500">{post.category}</span>
                          </div>
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <p className="text-sm text-gray-500">
                            {post.displayName} • {post.anonId}
                          </p>
                          {post.moderationReason && (
                            <p className="text-sm text-red-600 mt-1">
                              Flagged: {post.moderationReason}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 flex-wrap">
                          {post.moderationStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleModeratePost(post._id, 'approved')}
                                className="btn bg-green-100 text-green-700 hover:bg-green-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleModeratePost(post._id, 'rejected')}
                                className="btn bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleTogglePin(post._id)}
                            className="btn btn-secondary"
                          >
                            {post.isPinned ? 'Unpin' : 'Pin'}
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="btn bg-red-100 text-red-700 hover:bg-red-200"
                            title="Delete Post"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-3">{post.content}</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Created: {new Date(post.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Pending Reports</h2>
              {reports.length === 0 ? (
                <p className="text-gray-600">No pending reports.</p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report._id} className="card">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-medium">Reported by: {report.reporter?.anonId || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">
                            Reason: <span className="capitalize">{report.reason}</span>
                          </p>
                          {report.description && (
                            <p className="text-sm text-gray-600 mt-2">
                              Description: {report.description}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleResolveReport(report._id, 'resolved')}
                            className="btn bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleResolveReport(report._id, 'dismissed')}
                            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                      <Link
                        to={`/post/${report.post?._id}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        View Reported Post
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">All Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3">Anon ID</th>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">College</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Premium</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className={`border-b ${u.isBlocked ? 'bg-red-50' : ''}`}>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{u.anonId}</p>
                            <p className="text-xs text-gray-500">{u.displayName}</p>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{u.email}</td>
                        <td className="p-3 text-sm">{u.college || 'N/A'}</td>
                        <td className="p-3">
                          {u.isBlocked ? (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm flex items-center gap-1 w-fit">
                              <FiX /> Blocked
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {u.isAdmin ? (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                              Admin
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                              User
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {u.isPremium ? (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                              <FiStar className="w-3 h-3" /> Premium
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {!u.isAdmin && (
                              <>
                                {u.isBlocked ? (
                                  <button
                                    onClick={() => handleUnblockUser(u._id)}
                                    className="text-green-600 hover:underline text-sm flex items-center gap-1"
                                  >
                                    <FiUnlock /> Unblock
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openBlockModal(u)}
                                    className="text-red-600 hover:underline text-sm flex items-center gap-1"
                                  >
                                    <FiShield /> Block
                                  </button>
                                )}
                              </>
                            )}
                            <button
                              onClick={() => handleToggleAdmin(u._id)}
                              className="text-primary-600 hover:underline text-sm"
                            >
                              {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Premium Tab */}
          {activeTab === 'premium' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Premium Users</h2>
                <p className="text-sm text-gray-600">
                  Click on a user to grant premium access
                </p>
              </div>
              {premiumUsers.length === 0 ? (
                <p className="text-gray-600">No premium users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3">Anon ID</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">College</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Images</th>
                        <th className="text-left p-3">Competitions</th>
                        <th className="text-left p-3">Expires</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {premiumUsers.map((u) => {
                        const isExpired = u.premiumExpiresAt && new Date(u.premiumExpiresAt) <= new Date();
                        return (
                          <tr key={u._id} className={`border-b ${isExpired ? 'bg-orange-50' : ''}`}>
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{u.anonId}</p>
                                <p className="text-xs text-gray-500">{u.displayName}</p>
                              </div>
                            </td>
                            <td className="p-3 text-sm">{u.email}</td>
                            <td className="p-3 text-sm">{u.college || 'N/A'}</td>
                            <td className="p-3">
                              {isExpired ? (
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                                  Expired
                                </span>
                              ) : (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                                  <FiStar className="w-3 h-3" /> Active
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-sm">
                              {u.premiumUsage?.imageUploads || 0} / {u.premiumLimits?.imageUploads || 10}
                            </td>
                            <td className="p-3 text-sm">
                              {u.premiumUsage?.competitions || 0} / {u.premiumLimits?.competitions || 5}
                            </td>
                            <td className="p-3 text-sm">
                              {u.premiumExpiresAt 
                                ? new Date(u.premiumExpiresAt).toLocaleDateString()
                                : '-'}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => openPremiumModal(u)}
                                  className="btn bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-sm flex items-center gap-1"
                                >
                                  <FiEdit2 /> Edit
                                </button>
                                <button
                                  onClick={() => handleResetUsage(u._id)}
                                  className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm"
                                >
                                  Reset
                                </button>
                                <button
                                  onClick={() => handleRevokePremium(u._id)}
                                  className="btn bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                                >
                                  Revoke
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;

