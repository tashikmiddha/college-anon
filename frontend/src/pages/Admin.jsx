import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { adminAPI } from '../features/admin/adminAPI';
import { fetchAllFeedbacks, resolveFeedback, deleteFeedback, fetchAllComments, deleteComment } from '../features/admin/adminSlice';
import PostCard from '../components/PostCard';
import { FiUsers, FiFileText, FiFlag, FiCheck, FiX, FiTrash2, FiShield, FiUnlock, FiStar, FiEdit2, FiMessageSquare, FiCheckCircle, FiAlertCircle, FiLoader, FiAward } from 'react-icons/fi';
import { allColleges } from '../utils/colleges';

// Custom hook for intersection observer
const useInfiniteScroll = (callback, isLoading, hasMore) => {
  const observerRef = useRef(null);
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, callback]
  );

  return lastElementRef;
};

const Admin = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { allFeedbacks: reduxFeedbacks, allComments: reduxComments } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  
  // Pagination state for each tab
  const [posts, setPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasMore, setPostsHasMore] = useState(true);
  
  const [reports, setReports] = useState([]);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsHasMore, setReportsHasMore] = useState(true);
  
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersHasMore, setUsersHasMore] = useState(true);
  
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [premiumPage, setPremiumPage] = useState(1);
  const [premiumHasMore, setPremiumHasMore] = useState(true);
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksPage, setFeedbacksPage] = useState(1);
  const [feedbacksHasMore, setFeedbacksHasMore] = useState(true);
  
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(true);
  
  const [competitions, setCompetitions] = useState([]);
  const [competitionsPage, setCompetitionsPage] = useState(1);
  const [competitionsHasMore, setCompetitionsHasMore] = useState(true);
  
  const [competitionReports, setCompetitionReports] = useState([]);
  const [competitionReportsPage, setCompetitionReportsPage] = useState(1);
  const [competitionReportsHasMore, setCompetitionReportsHasMore] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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
  const [reportStatusFilter, setReportStatusFilter] = useState('pending');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [premiumStatusFilter, setPremiumStatusFilter] = useState('');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState('');
  const [competitionReportStatusFilter, setCompetitionReportStatusFilter] = useState('');
  const [showInactiveCompetitions, setShowInactiveCompetitions] = useState(false);
  const [showResolveFeedbackModal, setShowResolveFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackAdminNotes, setFeedbackAdminNotes] = useState('');
  const [selectedCompetitionReport, setSelectedCompetitionReport] = useState(null);
  const [showResolveCompetitionReportModal, setShowResolveCompetitionReportModal] = useState(false);
  const [competitionReportAdminNotes, setCompetitionReportAdminNotes] = useState('');
  const [selectedPostReport, setSelectedPostReport] = useState(null);
  const [showResolvePostReportModal, setShowResolvePostReportModal] = useState(false);
  const [postReportAdminNotes, setPostReportAdminNotes] = useState('');

  // Reset pagination when filters change
  useEffect(() => {
    if (user?.isAdmin) {
      resetAndFetchData();
    }
  }, [user, activeTab, postFilter, collegeFilter, premiumStatusFilter, feedbackStatusFilter, feedbackTypeFilter]);

  const resetAndFetchData = async () => {
    setLoading(true);
    // Reset pagination state for current tab
    resetPagination(activeTab);
    await fetchAdminData(1, true);
    setLoading(false);
  };

  const resetPagination = (tab) => {
    switch (tab) {
      case 'posts':
        setPosts([]);
        setPostsPage(1);
        setPostsHasMore(true);
        break;
      case 'reports':
        setReports([]);
        setReportsPage(1);
        setReportsHasMore(true);
        break;
      case 'competition-reports':
        setCompetitionReports([]);
        setCompetitionReportsPage(1);
        setCompetitionReportsHasMore(true);
        break;
      case 'competitions':
        setCompetitions([]);
        setCompetitionsPage(1);
        setCompetitionsHasMore(true);
        break;
      case 'users':
        setUsers([]);
        setUsersPage(1);
        setUsersHasMore(true);
        break;
      case 'premium':
        setPremiumUsers([]);
        setPremiumPage(1);
        setPremiumHasMore(true);
        break;
      case 'feedbacks':
        setFeedbacks([]);
        setFeedbacksPage(1);
        setFeedbacksHasMore(true);
        break;
      case 'comments':
        setComments([]);
        setCommentsPage(1);
        setCommentsHasMore(true);
        break;
      default:
        break;
    }
  };

  const fetchAdminData = async (page = 1, isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
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
          const postsData = await adminAPI.getPosts({ ...filter, page, limit: 20 });
          if (page === 1) {
            setPosts(postsData.posts);
          } else {
            setPosts(prev => [...prev, ...postsData.posts]);
          }
          setPostsPage(page);
          setPostsHasMore(postsData.hasMore);
          break;
        case 'reports':
          const reportsData = await adminAPI.getReports({ 
            college: collegeFilter || undefined, 
            page, 
            limit: 20,
            status: reportStatusFilter
          });
          if (page === 1) {
            setReports(reportsData.reports);
          } else {
            setReports(prev => [...prev, ...reportsData.reports]);
          }
          setReportsPage(page);
          setReportsHasMore(reportsData.hasMore);
          break;
        case 'users':
          const usersData = await adminAPI.getUsers({ college: collegeFilter || undefined, page, limit: 20 });
          if (page === 1) {
            setUsers(usersData.users);
          } else {
            setUsers(prev => [...prev, ...usersData.users]);
          }
          setUsersPage(page);
          setUsersHasMore(usersData.hasMore);
          break;
        case 'premium':
          const premiumParams = { page, limit: 20 };
          if (collegeFilter) {
            premiumParams.college = collegeFilter;
          }
          if (premiumStatusFilter) {
            premiumParams.status = premiumStatusFilter;
          }
          const premiumDataRes = await adminAPI.getPremiumUsers(premiumParams);
          if (page === 1) {
            setPremiumUsers(premiumDataRes.users);
          } else {
            setPremiumUsers(prev => [...prev, ...premiumDataRes.users]);
          }
          setPremiumPage(page);
          setPremiumHasMore(premiumDataRes.hasMore);
          break;
        case 'feedbacks':
          const feedbackParams = { page, limit: 20, college: collegeFilter || undefined };
          if (feedbackStatusFilter) {
            feedbackParams.status = feedbackStatusFilter;
          }
          if (feedbackTypeFilter) {
            feedbackParams.type = feedbackTypeFilter;
          }
          const feedbacksData = await adminAPI.getAllFeedbacks(feedbackParams);
          if (page === 1) {
            setFeedbacks(feedbacksData.feedbacks);
          } else {
            setFeedbacks(prev => [...prev, ...feedbacksData.feedbacks]);
          }
          setFeedbacksPage(page);
          setFeedbacksHasMore(feedbacksData.hasMore);
          break;
        case 'comments':
          const commentsData = await adminAPI.getAllComments({ college: collegeFilter || undefined, page, limit: 20 });
          if (page === 1) {
            setComments(commentsData.comments);
          } else {
            setComments(prev => [...prev, ...commentsData.comments]);
          }
          setCommentsPage(page);
          setCommentsHasMore(commentsData.hasMore);
          break;
        case 'competition-reports':
          const compReportParams = { page, limit: 20 };
          // Default to showing pending reports only
          if (competitionReportStatusFilter) {
            compReportParams.status = competitionReportStatusFilter;
          } else {
            compReportParams.status = 'pending';
          }
          const compReportsData = await adminAPI.getCompetitionReports(compReportParams);
          if (page === 1) {
            setCompetitionReports(compReportsData.reports);
          } else {
            setCompetitionReports(prev => [...prev, ...compReportsData.reports]);
          }
          setCompetitionReportsPage(page);
          setCompetitionReportsHasMore(compReportsData.hasMore);
          break;
        case 'competitions':
          const compParams = { page, limit: 20 };
          if (collegeFilter) {
            compParams.college = collegeFilter;
          }
          console.log('Fetching competitions with params:', compParams);
          const compsData = await adminAPI.getAllCompetitions(compParams);
          console.log('Competitions data received:', compsData);
          if (page === 1) {
            setCompetitions(compsData.competitions);
          } else {
            setCompetitions(prev => [...prev, ...compsData.competitions]);
          }
          setCompetitionsPage(page);
          setCompetitionsHasMore(compsData.hasMore);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      console.error('Active tab:', activeTab);
      console.error('Error details:', error.message);
    }
    
    if (isInitialLoad) {
      setLoading(false);
    } else {
      setLoadingMore(false);
    }
  };

  // Load more functions for each tab
  const loadMorePosts = () => {
    if (!loadingMore && postsHasMore) {
      fetchAdminData(postsPage + 1);
    }
  };

  const loadMoreReports = () => {
    if (!loadingMore && reportsHasMore) {
      fetchAdminData(reportsPage + 1);
    }
  };

  const loadMoreUsers = () => {
    if (!loadingMore && usersHasMore) {
      fetchAdminData(usersPage + 1);
    }
  };

  const loadMorePremium = () => {
    if (!loadingMore && premiumHasMore) {
      fetchAdminData(premiumPage + 1);
    }
  };

  const loadMoreFeedbacks = () => {
    if (!loadingMore && feedbacksHasMore) {
      fetchAdminData(feedbacksPage + 1);
    }
  };

  const loadMoreComments = () => {
    if (!loadingMore && commentsHasMore) {
      fetchAdminData(commentsPage + 1);
    }
  };

  const loadMoreCompetitionReports = () => {
    if (!loadingMore && competitionReportsHasMore) {
      fetchAdminData(competitionReportsPage + 1);
    }
  };

  const loadMoreCompetitions = () => {
    if (!loadingMore && competitionsHasMore) {
      fetchAdminData(competitionsPage + 1);
    }
  };

  // Intersection observer refs for each tab
  const postsRef = useInfiniteScroll(loadMorePosts, loadingMore, postsHasMore);
  const reportsRef = useInfiniteScroll(loadMoreReports, loadingMore, reportsHasMore);
  const usersRef = useInfiniteScroll(loadMoreUsers, loadingMore, usersHasMore);
  const premiumRef = useInfiniteScroll(loadMorePremium, loadingMore, premiumHasMore);
  const feedbacksRef = useInfiniteScroll(loadMoreFeedbacks, loadingMore, feedbacksHasMore);
  const commentsRef = useInfiniteScroll(loadMoreComments, loadingMore, commentsHasMore);
  const competitionReportsRef = useInfiniteScroll(loadMoreCompetitionReports, loadingMore, competitionReportsHasMore);
  const competitionsRef = useInfiniteScroll(loadMoreCompetitions, loadingMore, competitionsHasMore);

  // Loading indicator component
  const LoadingMoreIndicator = () => (
    <div className="flex justify-center items-center py-4">
      <FiLoader className="animate-spin text-primary-600 w-6 h-6" />
      <span className="ml-2 text-gray-600">Loading more...</span>
    </div>
  );

  // End of results indicator
  const EndOfResults = ({ total }) => (
    <div className="text-center py-4 text-gray-500">
      {total > 0 ? (
        <span>You've reached the end ({total} total items)</span>
      ) : (
        <span>No items found</span>
      )}
    </div>
  );

  const handleModeratePost = async (postId, status) => {
    try {
      await adminAPI.moderatePost(postId, { status });
      fetchAdminData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleResolveReport = async (reportId, status, adminNotes = '') => {
    try {
      await adminAPI.resolveReport(reportId, { status, adminNotes });
      // Remove the resolved/dismissed report from the local state
      setReports(prev => prev.filter(r => r._id !== reportId));
      // Show success message
      const message = status === 'resolved' ? 'Report resolved successfully!' : 'Report dismissed!';
      alert(message);
    } catch (error) {
      alert(error.message);
    }
  };

  const openResolvePostReportModal = (report) => {
    setSelectedPostReport(report);
    setShowResolvePostReportModal(true);
    setPostReportAdminNotes('');
  };

  const submitResolvePostReport = async (status) => {
    if (!selectedPostReport) return;
    try {
      await adminAPI.resolveReport(selectedPostReport._id, { 
        status, 
        adminNotes: postReportAdminNotes 
      });
      // Remove the resolved report from the local state
      setReports(prev => prev.filter(r => r._id !== selectedPostReport._id));
      setShowResolvePostReportModal(false);
      setSelectedPostReport(null);
      setPostReportAdminNotes('');
      const message = status === 'resolved' ? 'Report resolved successfully!' : 'Report dismissed!';
      alert(message);
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
        // Refresh current tab's data
        resetAndFetchData();
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

  const handleResolveFeedback = async (feedback) => {
    setSelectedFeedback(feedback);
    setShowResolveFeedbackModal(true);
  };

  const submitResolveFeedback = async () => {
    if (!selectedFeedback) return;
    try {
      await dispatch(resolveFeedback({ 
        id: selectedFeedback._id, 
        adminNotes: feedbackAdminNotes 
      })).unwrap();
      setShowResolveFeedbackModal(false);
      setSelectedFeedback(null);
      setFeedbackAdminNotes('');
      fetchAdminData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await dispatch(deleteFeedback(feedbackId)).unwrap();
        fetchAdminData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await dispatch(deleteComment(commentId)).unwrap();
        // Remove the deleted comment from local state
        setComments(prev => prev.filter(c => c._id !== commentId));
        alert('Comment deleted successfully!');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleResolveCompetitionReport = async (reportId, status) => {
    try {
      await adminAPI.resolveCompetitionReport(reportId, { status });
      // Remove the resolved/dismissed report from the local state
      setCompetitionReports(prev => prev.filter(r => r._id !== reportId));
      // Show success message
      const message = status === 'resolved' ? 'Report resolved successfully!' : 'Report dismissed!';
      alert(message);
    } catch (error) {
      alert(error.message);
    }
  };

  const openResolveCompetitionReportModal = (report) => {
    setSelectedCompetitionReport(report);
    setShowResolveCompetitionReportModal(true);
    setCompetitionReportAdminNotes('');
  };

  const submitResolveCompetitionReport = async (status) => {
    if (!selectedCompetitionReport) return;
    try {
      await adminAPI.resolveCompetitionReport(selectedCompetitionReport._id, { 
        status, 
        adminNotes: competitionReportAdminNotes 
      });
      // Remove the resolved report from the local state
      setCompetitionReports(prev => prev.filter(r => r._id !== selectedCompetitionReport._id));
      setShowResolveCompetitionReportModal(false);
      setSelectedCompetitionReport(null);
      setCompetitionReportAdminNotes('');
      const message = status === 'resolved' ? 'Report resolved successfully!' : 'Report dismissed!';
      alert(message);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleHardDeleteCompetition = async (competitionId, competitionTitle) => {
    if (window.confirm(`⚠️ PERMANENTLY DELETE "${competitionTitle}"?\n\nThis will:\n- Remove the competition completely\n- Delete all associated reports\n- This action CANNOT be undone!`)) {
      try {
        await adminAPI.hardDeleteCompetition(competitionId);
        // Remove the deleted competition from local state
        setCompetitions(prev => prev.filter(c => c._id !== competitionId));
        alert('Competition permanently deleted!');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleToggleCompetitionActive = async (competitionId, currentStatus) => {
    try {
      await adminAPI.updateCompetition(competitionId, { isActive: !currentStatus });
      // Update the competition in local state
      setCompetitions(prev => prev.map(c => 
        c._id === competitionId ? { ...c, isActive: !currentStatus } : c
      ));
      alert(`Competition ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      alert(error.message);
    }
  };

  if (!user || !user.isAdmin) {
    return <Navigate to="/" />;
  }

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: FiFileText },
    { id: 'posts', label: 'Posts', icon: FiCheck },
    { id: 'reports', label: 'Reports', icon: FiFlag },
    { id: 'competition-reports', label: 'Comp. Reports', icon: FiFlag },
    { id: 'competitions', label: 'Competitions', icon: FiAward },
    { id: 'feedbacks', label: 'Feedbacks', icon: FiMessageSquare },
    { id: 'comments', label: 'Comments', icon: FiMessageSquare },
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

      {/* Resolve Feedback Modal */}
      {showResolveFeedbackModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Resolve Feedback</h3>
            <p className="text-gray-600 mb-4">
              Resolving feedback from <strong>{selectedFeedback.user?.anonId || 'Unknown'}</strong>
            </p>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Type:</strong> <span className="capitalize">{selectedFeedback.type}</span>
              </p>
              <p className="text-sm text-gray-600">
                <strong>Message:</strong>
              </p>
              <p className="text-sm text-gray-700 mt-1 p-2 bg-white rounded border">
                {selectedFeedback.message}
              </p>
            </div>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Admin Notes (optional - visible to user)
            </label>
            <textarea
              value={feedbackAdminNotes}
              onChange={(e) => setFeedbackAdminNotes(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
              rows="3"
              placeholder="Add notes about how this was handled..."
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowResolveFeedbackModal(false);
                  setSelectedFeedback(null);
                  setFeedbackAdminNotes('');
                }}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={submitResolveFeedback}
                className="btn bg-green-600 text-white hover:bg-green-700"
              >
                <FiCheckCircle className="mr-1" />
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Competition Report Modal */}
      {showResolveCompetitionReportModal && selectedCompetitionReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Resolve Competition Report</h3>
            <p className="text-gray-600 mb-4">
              Resolving report from <strong>{selectedCompetitionReport.reporter?.anonId || 'Unknown'}</strong>
            </p>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Reason:</strong> <span className="capitalize">{selectedCompetitionReport.reason}</span>
              </p>
              {selectedCompetitionReport.description && (
                <>
                  <p className="text-sm text-gray-600">
                    <strong>Description:</strong>
                  </p>
                  <p className="text-sm text-gray-700 mt-1 p-2 bg-white rounded border">
                    {selectedCompetitionReport.description}
                  </p>
                </>
              )}
              {selectedCompetitionReport.competition && (
                <div className="mt-3 p-2 bg-white rounded border">
                  <p className="text-sm font-medium">Competition: {selectedCompetitionReport.competition.title}</p>
                </div>
              )}
            </div>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Admin Notes (optional)
            </label>
            <textarea
              value={competitionReportAdminNotes}
              onChange={(e) => setCompetitionReportAdminNotes(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
              rows="3"
              placeholder="Add notes about how this was handled..."
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowResolveCompetitionReportModal(false);
                  setSelectedCompetitionReport(null);
                  setCompetitionReportAdminNotes('');
                }}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => submitResolveCompetitionReport('dismissed')}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Dismiss
              </button>
              <button
                onClick={() => submitResolveCompetitionReport('resolved')}
                className="btn bg-green-600 text-white hover:bg-green-700"
              >
                <FiCheckCircle className="mr-1" />
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Post Report Modal */}
      {showResolvePostReportModal && selectedPostReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Resolve Post Report</h3>
            <p className="text-gray-600 mb-4">
              Resolving report from <strong>{selectedPostReport.reporter?.anonId || 'Unknown'}</strong>
            </p>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Reason:</strong> <span className="capitalize">{selectedPostReport.reason}</span>
              </p>
              {selectedPostReport.description && (
                <>
                  <p className="text-sm text-gray-600">
                    <strong>Description:</strong>
                  </p>
                  <p className="text-sm text-gray-700 mt-1 p-2 bg-white rounded border">
                    {selectedPostReport.description}
                  </p>
                </>
              )}
              {selectedPostReport.post && (
                <div className="mt-3 p-2 bg-white rounded border">
                  <p className="text-sm font-medium">Post: {selectedPostReport.post.title || 'No title'}</p>
                </div>
              )}
            </div>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Admin Notes (optional - will be shown to the reporter)
            </label>
            <textarea
              value={postReportAdminNotes}
              onChange={(e) => setPostReportAdminNotes(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
              rows="3"
              placeholder="Add notes about how this was handled..."
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowResolvePostReportModal(false);
                  setSelectedPostReport(null);
                  setPostReportAdminNotes('');
                }}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => submitResolvePostReport('dismissed')}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Dismiss
              </button>
              <button
                onClick={() => submitResolvePostReport('resolved')}
                className="btn bg-green-600 text-white hover:bg-green-700"
              >
                <FiCheckCircle className="mr-1" />
                Resolve
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
          {(collegeFilter || premiumStatusFilter || competitionReportStatusFilter || reportStatusFilter) && (
            <div className="flex items-center">
              <button
                onClick={() => {
                  setCollegeFilter('');
                  setPremiumStatusFilter('');
                  setCompetitionReportStatusFilter('');
                  setReportStatusFilter('pending');
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
                  {posts.map((post, index) => (
                    <div 
                      key={post._id} 
                      className="card"
                      ref={index === posts.length - 1 ? postsRef : null}
                    >
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
                  {loadingMore && <LoadingMoreIndicator />}
                  {!loadingMore && !postsHasMore && posts.length > 0 && <EndOfResults total={posts.length} />}
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={reportStatusFilter}
                    onChange={(e) => setReportStatusFilter(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                    <option value="">All</option>
                  </select>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-4">Post Reports</h2>
              {reports.length === 0 ? (
                <p className="text-gray-600">No post reports found.</p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report, index) => (
                    <div 
                      key={report._id} 
                      className="card"
                      ref={index === reports.length - 1 ? reportsRef : null}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              report.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {report.status === 'pending' ? 'Pending Review' : report.status}
                            </span>
                          </div>
                          <p className="font-medium">Reported by: {report.reporter?.anonId || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">
                            Reason: <span className="capitalize">{report.reason}</span>
                          </p>
                          {report.description && (
                            <p className="text-sm text-gray-600 mt-2">
                              Description: {report.description}
                            </p>
                          )}
                          {report.adminNotes && (
                            <p className="text-sm text-green-700 mt-2 p-2 bg-green-50 rounded">
                              <strong>Admin Notes:</strong> {report.adminNotes}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Reported: {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {report.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openResolvePostReportModal(report)}
                              className="btn bg-green-100 text-green-700 hover:bg-green-200"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => submitResolvePostReport('dismissed')}
                              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/post/${report.post?._id}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        View Reported Post
                      </Link>
                    </div>
                  ))}
                  {loadingMore && <LoadingMoreIndicator />}
                  {!loadingMore && !reportsHasMore && reports.length > 0 && <EndOfResults total={reports.length} />}
                </div>
              )}
            </div>
          )}

          {/* Competition Reports Tab */}
          {activeTab === 'competition-reports' && (
            <div>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={competitionReportStatusFilter}
                    onChange={(e) => setCompetitionReportStatusFilter(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-4">Competition Reports</h2>
              {competitionReports.length === 0 ? (
                <p className="text-gray-600">No competition reports found.</p>
              ) : (
                <div className="space-y-4">
                  {competitionReports.map((report, index) => (
                    <div 
                      key={report._id} 
                      className="card"
                      ref={index === competitionReports.length - 1 ? competitionReportsRef : null}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              report.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {report.status === 'pending' ? 'Pending Review' : report.status}
                            </span>
                          </div>
                          <p className="font-medium">Reported by: {report.reporter?.anonId || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">
                            Reason: <span className="capitalize">{report.reason}</span>
                          </p>
                          {report.description && (
                            <p className="text-sm text-gray-600 mt-2">
                              Description: {report.description}
                            </p>
                          )}
                          {report.competition && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <p className="text-sm font-medium">Competition:</p>
                              <p className="text-sm text-gray-700">{report.competition.title}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                By: {report.competition.displayName} • {report.competition.anonId}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Reported: {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {report.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openResolveCompetitionReportModal(report)}
                              className="btn bg-green-100 text-green-700 hover:bg-green-200"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => submitResolveCompetitionReport('dismissed')}
                              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loadingMore && <LoadingMoreIndicator />}
                  {!loadingMore && !competitionReportsHasMore && competitionReports.length > 0 && <EndOfResults total={competitionReports.length} />}
                </div>
              )}
            </div>
          )}

          {/* Competitions Tab */}
          {activeTab === 'competitions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">All Competitions</h2>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInactiveCompetitions}
                      onChange={(e) => {
                        setShowInactiveCompetitions(e.target.checked);
                        // Reset and refetch when filter changes
                        setCompetitions([]);
                        setCompetitionsPage(1);
                        setCompetitionsHasMore(true);
                        fetchAdminData(1, true);
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">Show Inactive</span>
                  </label>
                </div>
              </div>
              {competitions.length === 0 ? (
                <p className="text-gray-600">No competitions found.</p>
              ) : (
                <div className="space-y-4">
                  {competitions
                    .filter(comp => showInactiveCompetitions || comp.isActive)
                    .map((competition, index) => (
                    <div 
                      key={competition._id} 
                      className={`card ${!competition.isActive ? 'opacity-60' : ''}`}
                      ref={index === competitions.length - 1 ? competitionsRef : null}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              !competition.isActive ? 'bg-gray-100 text-gray-800' :
                              competition.isActive && new Date(competition.expiresAt) > new Date() ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {!competition.isActive ? 'Inactive' : 
                                new Date(competition.expiresAt) > new Date() ? 'Active' : 'Expired'}
                            </span>
                            <span className="text-sm text-gray-500">{competition.college}</span>
                          </div>
                          <h3 className="font-semibold text-lg">{competition.title}</h3>
                          <p className="text-sm text-gray-500">
                            By: {competition.displayName} • {competition.anonId}
                          </p>
                          {competition.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {competition.description}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            Total Votes: {competition.totalVotes || 0}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {new Date(competition.createdAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            Expires: {new Date(competition.expiresAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2 flex-wrap">
                          <button
                            onClick={() => handleToggleCompetitionActive(competition._id, competition.isActive)}
                            className={`btn ${competition.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          >
                            {competition.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleHardDeleteCompetition(competition._id, competition.title)}
                            className="btn bg-red-100 text-red-700 hover:bg-red-200"
                            title="Permanently Delete Competition"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                      {/* Options Preview */}
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                        <div className="flex flex-wrap gap-2">
                          {(competition.options || []).map((option, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                            >
                              {option.name} ({option.voteCount || 0} votes)
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {loadingMore && <LoadingMoreIndicator />}
                  {!loadingMore && !competitionsHasMore && competitions.length > 0 && <EndOfResults total={competitions.length} />}
                </div>
              )}
            </div>
          )}

          {/* Feedbacks Tab */}
          {activeTab === 'feedbacks' && (
            <div>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={feedbackStatusFilter}
                    onChange={(e) => setFeedbackStatusFilter(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={feedbackTypeFilter}
                    onChange={(e) => setFeedbackTypeFilter(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">All</option>
                    <option value="bug">Bug</option>
                    <option value="feature">Feature Request</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-4">All Feedbacks</h2>
              {feedbacks.length === 0 ? (
                <p className="text-gray-600">No feedbacks found.</p>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((feedback, index) => (
                    <div 
                      key={feedback._id} 
                      className="card"
                      ref={index === feedbacks.length - 1 ? feedbacksRef : null}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              feedback.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {feedback.status === 'pending' ? 'Pending Review' : feedback.status}
                            </span>
                            <span className="text-sm text-gray-500 capitalize">
                              {feedback.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            From: {feedback.user?.anonId || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            College: {feedback.user?.college || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                            {feedback.message}
                          </p>
                          {feedback.adminNotes && (
                            <p className="text-sm text-green-700 mt-2 p-2 bg-green-50 rounded">
                              <strong>Admin Note:</strong> {feedback.adminNotes}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Submitted: {new Date(feedback.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2 flex-wrap">
                          {feedback.status === 'pending' && (
                            <button
                              onClick={() => handleResolveFeedback(feedback)}
                              className="btn bg-green-100 text-green-700 hover:bg-green-200 text-sm flex items-center gap-1"
                            >
                              <FiCheckCircle /> Resolve
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteFeedback(feedback._id)}
                            className="btn bg-red-100 text-red-700 hover:bg-red-200 text-sm flex items-center gap-1"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loadingMore && <LoadingMoreIndicator />}
                  {!loadingMore && !feedbacksHasMore && feedbacks.length > 0 && <EndOfResults total={feedbacks.length} />}
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">All Comments</h2>
              {comments.length === 0 ? (
                <p className="text-gray-600">No comments found.</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <div 
                      key={comment._id} 
                      className="card"
                      ref={index === comments.length - 1 ? commentsRef : null}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-sm">
                              {comment.author?.anonId || 'Unknown'}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">
                              {comment.author?.college || 'N/A'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded">
                            {comment.content}
                          </p>
                          <div className="mt-2 flex items-center gap-4">
                            <span className="text-xs text-gray-400">
                              Created: {new Date(comment.createdAt).toLocaleString()}
                            </span>
                            {comment.likeCount > 0 && (
                              <span className="text-xs text-gray-500">
                                {comment.likeCount} likes
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="btn bg-red-100 text-red-700 hover:bg-red-200 text-sm flex items-center gap-1"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                      <Link
                        to={`/post/${comment.post?._id}`}
                        className="text-primary-600 hover:underline text-sm flex items-center gap-1"
                      >
                        View Post: {comment.post?.title || 'Unknown Post'}
                      </Link>
                    </div>
                  ))}
                  {loadingMore && <LoadingMoreIndicator />}
                  {!loadingMore && !commentsHasMore && comments.length > 0 && <EndOfResults total={comments.length} />}
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
                    {users.map((u, index) => (
                      <tr 
                        key={u._id} 
                        className={`border-b ${u.isBlocked ? 'bg-red-50' : ''}`}
                        ref={index === users.length - 1 ? usersRef : null}
                      >
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
                            {!u.isPremium && (
                              <button
                                onClick={() => openPremiumModal(u)}
                                className="text-yellow-600 hover:underline text-sm flex items-center gap-1"
                              >
                                <FiStar /> Grant Premium
                              </button>
                            )}
                            {/* Hide "Remove Admin" for the currently logged-in admin */}
                            {u._id !== user?._id && (
                              <button
                                onClick={() => handleToggleAdmin(u._id)}
                                className="text-primary-600 hover:underline text-sm"
                              >
                                {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {loadingMore && <LoadingMoreIndicator />}
                {!loadingMore && !usersHasMore && users.length > 0 && <EndOfResults total={users.length} />}
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
                      {premiumUsers.map((u, index) => {
                        const isExpired = u.premiumExpiresAt && new Date(u.premiumExpiresAt) <= new Date();
                        return (
                          <tr 
                            key={u._id} 
                            className={`border-b ${isExpired ? 'bg-orange-50' : ''}`}
                            ref={index === premiumUsers.length - 1 ? premiumRef : null}
                          >
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
                  {loadingMore && <LoadingMoreIndicator />}
                  {!loadingMore && !premiumHasMore && premiumUsers.length > 0 && <EndOfResults total={premiumUsers.length} />}
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

