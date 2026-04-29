import React, { useState, useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import { commentService } from '../../services/commentService';
import { formatDate, formatNumber } from '../../utils/helpers';
import { showErrorToast, showSuccessToast } from '../../utils/toastNotification';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { useSelector } from 'react-redux';
import { Trash2, Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommentSection = ({ videoId }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { formData, handleChange, handleSubmit, resetForm } = useForm(
    { comment: '' },
    submitComment
  );

  useEffect(() => {
    fetchComments();
  }, [videoId, page]);

  async function fetchComments() {
    setLoading(true);
    try {
      const response = await commentService.getVideoComments(videoId, page);
      setComments(response.data.data.totalComments);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      showErrorToast('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }

  async function submitComment(data) {
    if (!data.comment.trim()) return;
    try {
      const response = await commentService.addComment(videoId, data.comment);
      setComments([response.data.data, ...comments]);
      resetForm();
      showSuccessToast('Comment added');
    } catch (error) {
      showErrorToast('Failed to add comment');
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
      showSuccessToast('Comment deleted');
    } catch (error) {
      showErrorToast('Failed to delete comment');
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingContent.trim()) {
      showErrorToast('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      const response = await commentService.updateComment(commentId, editingContent);
      setComments(
        comments.map((c) =>
          c._id === commentId ? { ...response.data.data, createdBy: c.createdBy } : c
        )
      );
      setEditingCommentId(null);
      setEditingContent('');
      showSuccessToast('Comment updated');
    } catch (error) {
      showErrorToast('Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  return (
    <div className="space-y-6">
      {/* Comments Count */}
      <h3 className="text-xl font-semibold text-white">{comments.length} Comments</h3>

      {/* Add Comment */}
      {user ? (
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
          <div className="flex gap-3">
            <img
              src={user.avatar?.url || 'https://via.placeholder.com/40'}
              alt={user.userName}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <Textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Add a comment..."
              rows={2}
              className="flex-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded transition"
            >
              Cancel
            </button>
            <Button type="submit" size="md">
              Comment
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-gray-400 text-sm">
          Sign in to add a comment
        </p>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton count={3} type="comment" />
        ) : comments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              {/* Avatar */}
              <img
                onClick={() => navigate(`/channel/${comment.createdBy?.userName}`)}
                src={comment.createdBy?.avatar?.url || 'https://via.placeholder.com/40'}
                alt={comment.createdBy?.userName}
                className="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer hover:text-blue-400 transition"
              />

              {/* Comment */}
              <div className="flex-1 bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <p
                      onClick={() => navigate(`/channel/${comment.createdBy?.userName}`)}
                      className="font-semibold text-white text-sm cursor-pointer hover:text-blue-400 transition">
                      {comment.createdBy?.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  {user?._id === comment.createdBy?._id && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditComment(comment)}
                        className="p-1 text-gray-400 hover:text-blue-400 transition"
                        title="Edit comment"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition"
                        title="Delete comment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-2 mt-2">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={2}
                      className="w-full"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 rounded transition"
                      >
                        <X size={14} className="inline mr-1" />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(comment._id)}
                        disabled={submitting}
                        className="px-3 py-1 text-sm bg-accent text-white hover:bg-red-600 disabled:opacity-50 rounded transition"
                      >
                        {submitting ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm">{comment.content}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-300">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
