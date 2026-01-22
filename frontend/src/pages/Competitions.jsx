import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCompetitions, voteOnCompetition, clearMessage } from '../features/competitions/competitionSlice';
import { FiAward, FiClock, FiHeart, FiPlus, FiStar, FiImage, FiCheck, FiThumbsUp } from 'react-icons/fi';
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

  const [votingStates, setVotingStates] = useState({});

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

  const handleVote = async (competitionId, optionIndex) => {
    if (votingStates[competitionId]) return;
    
    setVotingStates(prev => ({ ...prev, [competitionId]: optionIndex }));
    
    try {
      await dispatch(voteOnCompetition({ id: competitionId, optionIndex })).unwrap();
      dispatch(fetchCompetitions()); // Refresh competitions
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
      return `${days}d ${hours % 24}h left`;
    }
    return `${hours}h ${minutes}m left`;
  };

  const formatVoteCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
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
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FiAward className="text-yellow-500" />
            Competitions
          </h1>
          <p className="text-gray-600 mt-1">
            Vote on comparisons and create your own (Premium)
          </p>
        </div>
        
        {isPremium && (
          <Link
            to="/competitions/create"
            className={`btn btn-primary flex items-center gap-2 ${
              !hasCompetitionQuota ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={(e) => {
              if (!hasCompetitionQuota) {
                e.preventDefault();
              }
            }}
          >
            <FiPlus />
            Create Competition
            {hasCompetitionQuota && (
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
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FiStar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Create Your Own Competitions
              </h3>
              <p className="text-gray-600 mb-3">
                Premium members can create competitions with two options, upload images,
                and engage their college community.
              </p>
            </div>
            <Link
              to="/premium"
              className="btn btn-primary whitespace-nowrap flex items-center gap-2"
            >
              <FiStar className="w-4 h-4" />
              Upgrade to Premium
            </Link>
          </div>
        </div>
      )}

      {/* No competitions state */}
      {competitions.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FiAward className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Competitions Yet
          </h3>
          <p className="text-gray-500 mb-4">
            Be the first to create a competition!
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
            <div key={competition._id} className="card overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600">
                        {competition.displayName?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {competition.displayName || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500">{competition.anonId}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    isResultsVisible 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    <FiClock className="w-4 h-4" />
                    {timeRemaining}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="px-6 py-4">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {competition.title}
                </h3>
                {competition.description && (
                  <p className="text-gray-600">
                    {competition.description}
                  </p>
                )}
              </div>

              {/* Voting Options */}
              <div className="px-6 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  {competition.options.map((option, index) => {
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
                        className={`relative overflow-hidden rounded-xl transition-all duration-500 ${
                          canVote 
                            ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl group' 
                            : ''
                        } ${
                          isUserVoted 
                            ? 'border-4 border-green-500 shadow-2xl' 
                            : hasVoted 
                              ? 'border-4 border-gray-300 opacity-50 grayscale-[30%]' 
                              : 'border-4 border-gray-200'
                        }`}
                      >
                        {/* Image Container - Full 100% with proper aspect ratio */}
                        <div className="w-full aspect-[4/3] relative flex items-center justify-center bg-gray-50">
                          {option.image?.url ? (
                            <img
                              src={option.image.url}
                              alt={option.name}
                              className={`max-w-full max-h-full object-contain transition-all duration-500 ${
                                isUserVoted ? '' : ''
                              }`}
                            />
                          ) : (
                            <FiImage className={`w-12 h-12 transition-all duration-500 ${
                              isUserVoted ? 'text-green-500' : 'text-gray-400'
                            }`} />
                          )}
                          
                          {/* Gradient Overlay */}
                          <div className={`absolute inset-0 transition-all duration-500 ${
                            isUserVoted 
                              ? 'bg-gradient-to-t from-green-900/80 via-green-900/20 to-transparent' 
                              : 'bg-gradient-to-t from-black/80 via-black/30 to-transparent'
                          }`} />
                          
                          {/* Loading Overlay */}
                          {isVoting && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <LoadingSpinner />
                              </div>
                            </div>
                          )}
                          
                          {/* PROMINENT VOTED BADGE - Top Right */}
                          {isUserVoted && (
                            <div className="absolute top-3 right-3 z-10">
                              <div className="bg-green-500 text-white px-3 py-1.5 rounded-full font-bold text-sm flex items-center gap-1.5 shadow-lg animate-pulse">
                                <FiCheck className="w-4 h-4" />
                                VOTED
                              </div>
                            </div>
                          )}
                          
                          {/* "YOUR VOTE" Label - Bottom */}
                          {isUserVoted && (
                            <div className="absolute bottom-16 left-4 right-4 z-10">
                              <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg animate-bounce">
                                <FiAward className="w-4 h-4 text-yellow-300" />
                                <span>Your Vote</span>
                                <FiThumbsUp className="w-4 h-4" />
                              </div>
                            </div>
                          )}
                          
                          {/* Option Name */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className={`text-white font-bold text-lg truncate drop-shadow-lg transition-all duration-500 ${
                              isUserVoted ? 'text-green-300' : ''
                            }`}>
                              {option.name}
                            </p>
                            
                            {/* Vote Results (after expiry) */}
                            {isResultsVisible && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-white text-sm mb-1">
                                  <span className="flex items-center gap-1">
                                    <FiHeart className={`w-4 h-4 ${isUserVoted ? 'text-green-400' : 'text-red-500'}`} />
                                    {formatVoteCount(option.voteCount)}
                                  </span>
                                  <span className={`font-bold text-lg ${isUserVoted ? 'text-green-300' : ''}`}>
                                    {votePercentage}%
                                  </span>
                                </div>
                                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      isUserVoted 
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                                        : 'bg-gradient-to-r from-red-400 to-pink-500'
                                    }`}
                                    style={{ width: `${votePercentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {/* Vote Prompt (during voting) */}
                            {!isResultsVisible && !hasVoted && (
                              <div className="mt-2">
                                <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                                  <FiHeart className="w-4 h-4" />
                                  Tap to vote
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
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="flex items-center gap-1">
                      <FiHeart className="w-5 h-5 text-red-500" />
                      <span className="font-semibold">{formatVoteCount(competition.totalVotes)}</span>
                      <span className="text-sm">votes</span>
                    </div>
                  </div>
                  
                  {hasVoted ? (
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <FiCheck className="w-5 h-5" />
                      <span>Your vote recorded</span>
                    </div>
                  ) : !isResultsVisible ? (
                    <div className="text-primary-600 font-medium animate-pulse">
                      Cast your vote!
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      Voting closed
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more or end message */}
      {competitions.length > 0 && (
        <div className="text-center mt-8 text-gray-500">
          <p>You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default Competitions;

