import React, { useState, useEffect } from 'react';
import { tweetService } from '../../services/tweetService';
import { showErrorToast, showSuccessToast } from '../../utils/toastNotification';
import TweetCard from './TweetCard';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';

const TweetList = ({ userId, isOwner }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newTweetContent, setNewTweetContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchTweets();
    }
  }, [userId]);

  const fetchTweets = async () => {
    setLoading(true);
    try {
      const response = await tweetService.getUserTweets(userId);
      setTweets(response.data.data || []);
    } catch (error) {
      showErrorToast('Failed to fetch tweets');
    } finally {
      setLoading(false);
    }
  };

  const handlePostTweet = async (e) => {
    e.preventDefault();
    if (!newTweetContent.trim()) return;

    setIsPosting(true);
    try {
      const response = await tweetService.createTweet(newTweetContent);
      showSuccessToast('Tweet posted successfully');
      setNewTweetContent('');
      
      // We should ideally append the new tweet at the beginning
      // But the API response for createTweet might not have the populated owner
      // So we can re-fetch or manually construct it
      fetchTweets(); 
    } catch (error) {
      showErrorToast('Failed to post tweet');
    } finally {
      setIsPosting(false);
    }
  };

  const handleTweetDeleted = (tweetId) => {
    setTweets(tweets.filter((t) => t._id !== tweetId));
  };

  const handleTweetUpdated = (updatedTweet) => {
    setTweets(tweets.map((t) => (t._id === updatedTweet._id ? { ...t, content: updatedTweet.content } : t)));
  };

  if (loading) return <div className="py-8"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Create Tweet Form */}
      {isOwner && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <form onSubmit={handlePostTweet} className="flex flex-col gap-3">
            <textarea
              value={newTweetContent}
              onChange={(e) => setNewTweetContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-transparent text-white border-b border-gray-700 focus:border-accent outline-none resize-none min-h-[60px] p-2 transition-colors"
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isPosting || !newTweetContent.trim()}
                className="rounded-full px-6 py-2"
              >
                {isPosting ? 'Posting...' : 'Tweet'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tweets List */}
      <div className="space-y-4">
        {tweets.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            {isOwner ? "You haven't posted any tweets yet." : "This user hasn't posted any tweets."}
          </p>
        ) : (
          tweets.map((tweet) => (
            <TweetCard 
              key={tweet._id} 
              tweet={tweet} 
              onTweetDeleted={handleTweetDeleted}
              onTweetUpdated={handleTweetUpdated}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TweetList;
