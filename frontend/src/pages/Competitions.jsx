import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCompetitions, voteOnCompetition, clearMessage, reportCompetition } from '../features/competitions/competitionSlice';
import { FiAward, FiClock, FiHeart, FiPlus, FiStar, FiImage, FiCheck, FiThumbsUp, FiFlag, FiX } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const Competitions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { competitions, isLoading, isError, message, isSuccess } = useSelector(
    (state) => state.competitions
  );

  // Check premium status
  const isPremium = user?.isPremium && new Date(user?.premiumExpiresAt) > new Date();
  const competitionLimit = user?.premiumLimits?.competitions || 0;
  const competitionUsed = user?.premiumUsage?.competitions || 0;
  const hasCompetitionQuota = competitionUsed < competitionLimit;
  const isUserLoading = !user;

  const [votingStates, setVotingStates] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    dispatch(fetchCompetitions());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      const timer = setTimeout(() => {
        dispatch(clearMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isError, dispatch]);

  // Clear messages when success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, dispatch]);

  const openReportModal = (competition) => {
    setSelectedCompetition(competition);
    setShowReportModal(true);
    setReportReason('spam');
    setReportDescription('');
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedCompetition(null);
    setReportReason('spam');
    setReportDescription('');
    setReportError('');
  };

  const handleSubmitReport = async () => {
    if (!selectedCompetition) return;
    
    setIsSubmittingReport(true);
    setReportError('');
    try {
      await dispatch(reportCompetition({
        id: selectedCompetition._id,
        reason: reportReason,
        description: reportDescription
      })).unwrap();
      closeReportModal();
      // Refresh competitions to update any local state
      dispatch(fetchCompetitions());
    } catch (error) {
      console.error('Report failed:', error);
      setReportError(error);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleVote = async (competitionId, optionIndex) => {
    if (votingStates[competitionId]) return;
    setVotingStates(prev => ({ ...prev, [competitionId]: optionIndex }));
    try {
      await dispatch(voteOnCompetition({ id: competitionId, optionIndex })).unwrap();
      dispatch(fetchCompetitions());
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setVotingStates(prev => ({ ...prev, [competitionId]: null }));
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatVoteCount = (count) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count;
  };

  if (isLoading && competitions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container-custom py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FiAward className="text-yellow-500 w-6 h-6 sm:w-8 sm:h-8" />
            <span className="hidden sm:inline">Competitions</span>
            <span className="sm:hidden">Competitions</span>
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Vote & create (Premium)
          </p>
        </div>
        
        {isPremium && (
          <Link
            to="/competitions/create"
            className={`btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center ${
              !hasCompetitionQuota || isUserLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={(e) => {
              if (!hasCompetitionQuota || isUserLoading) {
                e.preventDefault();
              }
            }}
          >
            {isUserLoading ? (
              <LoadingSpinner />
            ) : (
              <FiPlus className="w-4 h-4" />
            )}
            <span className="text-sm">Create</span>
            {hasCompetitionQuota && !isUserLoading && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                {competitionUsed}/{competitionLimit}
              </span>
            )}
          </Link>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded ${
          isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Premium CTA for non-premium users */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="bg-yellow-100 p-3 rounded-full flex-shrink-0">
              <FiStar className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                Create Competitions
              </h3>
              <p className="text-gray-600 text-sm">
                Premium members can create voting competitions
              </p>
            </div>
            <Link
              to="/premium"
              className="btn btn-primary whitespace-nowrap flex items-center gap-2 text-sm"
            >
              <FiStar className="w-4 h-4" />
              Upgrade
            </Link>
          </div>
        </div>
      )}

      {/* No competitions state */}
      {competitions.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FiAward className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            No Competitions Yet
          </h3>
          <p className="text-gray-500 mb-4 text-sm">
            Be the first to create one!
          </p>
          {isPremium && hasCompetitionQuota && (
            <Link to="/competitions/create" className="btn btn-primary">
              Create Competition
            </Link>
          )}
        </div>
      )}

      {/* Competitions List */}
      <div className="space-y-6">
        {competitions.map((competition) => {
          const isResultsVisible = competition.resultsVisible;
          const hasVoted = competition.hasVoted;
          const timeRemaining = getTimeRemaining(competition.expiresAt);
          const userVotedOption = competition.voters?.find(
            v => v.user === user?._id || (v.user && v.user._id === user?._id)
          )?.optionIndex;
          
          return (
            <div key={competition._id} className="card overflow-hidden p-0">
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-600">
                        {competition.displayName?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {competition.displayName || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{competition.anonId}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                    isResultsVisible 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="whitespace-nowrap">{timeRemaining}</span>
                    {!isResultsVisible && <span className="hidden sm:inline">left</span>}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="px-4 py-3 sm:px-6 sm:py-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                  {competition.title}
                </h3>
                {competition.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {competition.description}
                  </p>
                )}
              </div>

              {/* Voting Options - Full width on mobile */}
              <div className="px-4 pb-4 sm:px-6 sm:pb-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {(competition.options || []).map((option, index) => {
                    const isVoting = votingStates[competition._id] === index;
                    const isUserVoted = hasVoted && userVotedOption === index;
                    const votePercentage = isResultsVisible && competition.totalVotes > 0 
                      ? Math.round((option.voteCount / competition.totalVotes) * 100)
                      : 0;
                    const canVote = !hasVoted && !isResultsVisible && !isVoting;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleVote(competition._id, index)}
                        disabled={!canVote}
                        className={`relative overflow-hidden rounded-lg sm:rounded-xl transition-all duration-300 ${
                          canVote 
                            ? 'cursor-pointer active:scale-[0.98]' 
                            : ''
                        } ${
                          isUserVoted 
                            ? 'ring-2 ring-green-500 shadow-lg' 
                            : hasVoted 
                              ? 'opacity-60 grayscale-[30%]' 
                              : 'ring-2 ring-gray-200'
                        }`}
                      >
                        {/* Image Container */}
                        <div className="w-full aspect-square sm:aspect-[4/3] relative flex items-center justify-center bg-gray-100">
                          {option.image?.url ? (
                            <img
                              src={option.image.url}
                              alt={option.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4">
                              <FiImage className={`w-10 h-10 sm:w-12 sm:h-12 ${isUserVoted ? 'text-green-500' : 'text-gray-400'}`} />
                              <span className="text-xs text-gray-500 mt-1 sm:hidden">No image</span>
                            </div>
                          )}
                          
                          {/* Overlay */}
                          <div className={`absolute inset-0 ${
                            isUserVoted 
                              ? 'bg-green-900/40' 
                              : 'bg-gradient-to-t from-black/70 via-black/20 to-transparent'
                          }`} />
                          
                          {/* Loading */}
                          {isVoting && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <LoadingSpinner />
                            </div>
                          )}
                          
                          {/* Voted Badge */}
                          {isUserVoted && (
                            <div className="absolute top-2 right-2 z-10">
                              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <FiCheck className="w-3 h-3" />
                                <span className="hidden sm:inline">VOTED</span>
                                <span className="sm:hidden">✓</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Option Name - Large on mobile */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                            <p className={`text-white font-bold text-base sm:text-lg truncate drop-shadow-md ${
                              isUserVoted ? 'text-green-300' : ''
                            }`}>
                              {option.name}
                            </p>
                            
                            {/* Results or Vote Prompt */}
                            {isResultsVisible ? (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                                  <span className="flex items-center gap-1">
                                    <FiHeart className={`w-3 h-3 sm:w-4 sm:h-4 ${isUserVoted ? 'text-green-400' : 'text-red-400'}`} />
                                    {formatVoteCount(option.voteCount)}
                                  </span>
                                  <span className={`font-bold text-sm sm:text-lg ${isUserVoted ? 'text-green-300' : ''}`}>
                                    {votePercentage}%
                                  </span>
                                </div>
                                <div className="h-1.5 sm:h-2 bg-white/30 rounded-full mt-1 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      isUserVoted 
                                        ? 'bg-green-500' 
                                        : 'bg-red-500'
                                    }`}
                                    style={{ width: `${votePercentage}%` }}
                                  />
                                </div>
                              </div>
                            ) : !hasVoted && (
                              <div className="mt-2">
                                <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
                                  <FiHeart className="w-3 h-3" />
                                  <span className="hidden sm:inline">Tap to vote</span>
                                  <span className="sm:hidden">Vote</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Stats */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-t bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiHeart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    <span className="font-semibold">{formatVoteCount(competition.totalVotes)}</span>
                    <span className="text-sm">votes</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {hasVoted ? (
                      <div className="flex items-center gap-1.5 text-green-600 font-medium text-sm">
                        <FiCheck className="w-4 h-4" />
                        <span>Your vote recorded</span>
                      </div>
                    ) : !isResultsVisible ? (
                      <div className="text-primary-600 font-medium text-sm animate-pulse">
                        Tap an option to vote!
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        Voting ended
                      </div>
                    )}
                    
                    {/* Report Button */}
                    <button
                      onClick={() => openReportModal(competition)}
                      className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors text-sm"
                      title="Report this competition"
                    >
                      <FiFlag className="w-4 h-4" />
                      <span className="hidden sm:inline">Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* End message */}
      {competitions.length > 0 && (
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>You're all caught up!</p>
        </div>
      )}

      {/* Report Competition Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiFlag className="text-red-500" />
                Report Competition
              </h3>
              <button
                onClick={closeReportModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                You're reporting: <strong>{selectedCompetition?.title}</strong>
              </p>

              {/* Error Message */}
              {reportError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {reportError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="spam">Spam</option>
                  <option value="harassment">Harassment</option>
                  <option value="hate-speech">Hate Speech</option>
                  <option value="violence">Violence</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Provide more information about why you're reporting this competition..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {reportDescription.length}/500
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-2 p-4 border-t bg-gray-50">
              <button
                onClick={closeReportModal}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                disabled={isSubmittingReport}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                disabled={isSubmittingReport}
              >
                {isSubmittingReport ? (
                  <>
                    <LoadingSpinner />
                    <span>Reporting...</span>
                  </>
                ) : (
                  <>
                    <FiFlag className="w-4 h-4" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Competitions;

