import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { formatDate } from '../../utils/helpers';
import { likeService } from '../../services/likeService';
import { tweetService } from '../../services/tweetService';
import { showErrorToast, showSuccessToast } from '../../utils/toastNotification';
import Button from '../common/Button';

const TweetCard = ({ tweet, onTweetDeleted, onTweetUpdated }) => {
  const { user } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet?.content || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [isLiked, setIsLiked] = useState(tweet?.isLiked || false);
  const [likesCount, setLikesCount] = useState(tweet?.likesCount || 0);

  const isOwner = user?._id === tweet?.owner?._id;

  const handleLike = async () => {
    if (!user) {
      showErrorToast('Please login to like tweets');
      return;
    }
    
    // Optimistic UI update
    setIsLiked(!isLiked);
    setLikesCount((prev) => isLiked ? prev - 1 : prev + 1);

    try {
      await likeService.toggleTweetLike(tweet._id);
    } catch (error) {
      // Revert optimistic update
      setIsLiked(!isLiked);
      setLikesCount((prev) => !isLiked ? prev - 1 : prev + 1);
      showErrorToast('Failed to toggle like');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tweet?')) return;
    
    try {
      await tweetService.deleteTweet(tweet._id);
      showSuccessToast('Tweet deleted successfully');
      if (onTweetDeleted) onTweetDeleted(tweet._id);
    } catch (error) {
      showErrorToast('Failed to delete tweet');
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      showErrorToast('Tweet content cannot be empty');
      return;
    }
    
    setIsUpdating(true);
    try {
      const response = await tweetService.updateTweet(tweet._id, editContent);
      showSuccessToast('Tweet updated successfully');
      setIsEditing(false);
      if (onTweetUpdated) onTweetUpdated(response.data.data);
    } catch (error) {
      showErrorToast('Failed to update tweet');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!tweet) return null;

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 transition-all hover:border-gray-700">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <img
          src={tweet.owner?.avatar?.url || 'https://via.placeholder.com/48'}
          alt={tweet.owner?.fullName || 'User'}
          className="w-12 h-12 rounded-full object-cover"
        />

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">
                {tweet.owner?.fullName || 'Unknown User'}
              </h3>
              <span className="text-gray-400 text-sm">
                @{tweet.owner?.userName || 'user'}
              </span>
              <span className="text-gray-500 text-xs">• {formatDate(tweet.createdAt)}</span>
            </div>
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none min-h-[80px]"
                placeholder="What's on your mind?"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(tweet.content);
                  }}
                  disabled={isUpdating}
                  className="py-1 px-3 text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdate} 
                  disabled={isUpdating || !editContent.trim()}
                  className="py-1 px-3 text-sm"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-200 mt-2 whitespace-pre-wrap">{tweet.content}</p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-6 mt-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  isLiked ? 'text-accent' : 'text-gray-400 hover:text-white'
                }`}
              >
                {isLiked ? '❤️' : '🤍'} {likesCount > 0 && likesCount}
              </button>
              
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetCard;
