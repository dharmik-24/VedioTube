import React, { useState, useEffect } from 'react';
import { tweetService } from '../services/tweetService';
import { showErrorToast, showSuccessToast } from '../utils/toastNotification';
import TweetCard from '../components/tweet/TweetCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

const TweetsPage = () => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [newTweetContent, setNewTweetContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchTweets();
  }, [page]);

  const fetchTweets = async () => {
    if (page === 1) setLoading(true);
    try {
      const response = await tweetService.getAllTweets(page, 20);
      if (page === 1) {
        setTweets(response.data.data.tweets || []);
      } else {
        setTweets((prev) => [...prev, ...(response.data.data.tweets || [])]);
      }
      setTotalPages(response.data.data.totalPages || 1);
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
      await tweetService.createTweet(newTweetContent);
      showSuccessToast('Tweet posted successfully');
      setNewTweetContent('');
      
      // Refresh to get the new tweet
      if (page === 1) {
        fetchTweets();
      } else {
        setPage(1);
      }
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Tweets Feed</h1>

      {/* Create Tweet Form */}
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

      {/* Tweets List */}
      {loading && page === 1 ? (
        <div className="py-8"><LoadingSpinner /></div>
      ) : (
        <div className="space-y-4">
          {tweets.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No tweets yet. Be the first to tweet!
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

          {page < totalPages && (
            <div className="flex justify-center pt-6">
              <button
                onClick={() => setPage(page + 1)}
                disabled={loading}
                className="px-8 py-3 bg-accent text-white rounded-full font-medium hover:bg-red-600 disabled:opacity-50 transition"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TweetsPage;
