import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/firebaseService';
import { MessageSquare, Send, AlertCircle, CheckCircle2, User } from 'lucide-react';

export const CommentSection = ({ post, onCommentAdded }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadComments = async () => {
    try {
      const data = await apiService.getCommentsByPostId(post.id);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (post && post.id) {
      loadComments();
    }
  }, [post]);

  // Business Rule Checks
  const isOwnPost = currentUser && post && currentUser.uid === post.authorId;
  const hasAlreadyCommented = currentUser && comments.some(c => c.authorId === currentUser.uid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (isOwnPost) {
      setError('자신이 작성한 게시물에는 댓글을 달 수 없습니다.');
      return;
    }

    if (hasAlreadyCommented) {
      setError('한 사람이 하나의 게시물에는 1개밖에 댓글을 달 수 없습니다.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await apiService.addComment(post.id, currentUser, text.trim());
      setText('');
      await loadComments();
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      setError(err.message || '댓글 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={20} className="text-indigo-400" />
        <span>댓글 목록 ({comments.length})</span>
      </h4>

      {/* Comment Rules Notice Box */}
      {currentUser && (
        <div style={{ marginBottom: '16px' }}>
          {isOwnPost ? (
            <div style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', color: '#fbbf24', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }} id="own-post-notice">
              <AlertCircle size={18} />
              <span>자신이 작성한 게시물에는 댓글을 달 수 없습니다.</span>
            </div>
          ) : hasAlreadyCommented ? (
            <div style={{ padding: '12px 16px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '10px', color: '#a5b4fc', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }} id="already-commented-notice">
              <CheckCircle2 size={18} />
              <span>이미 이 게시물에 댓글을 작성하셨습니다. (1인 1게시물 1댓글 제한)</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Comment Input Form */}
      {currentUser && !isOwnPost && !hasAlreadyCommented && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }} id="comment-form">
          {error && (
            <div style={{ marginBottom: '10px', color: '#fb7185', fontSize: '0.85rem' }}>{error}</div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <img 
              src={currentUser.profileImageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
              alt="me" 
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <input
              type="text"
              className="form-input"
              placeholder="댓글을 작성해 보세요 (한 게시물당 1개만 가능)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              id="comment-input-field"
            />
            <button type="submit" className="btn-primary" disabled={submitting || !text.trim()} id="submit-comment-btn" style={{ padding: '8px 16px' }}>
              <Send size={16} />
              <span>등록</span>
            </button>
          </div>
        </form>
      )}

      {/* Comment List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>댓글 로딩 중...</p>
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '12px 0' }}>아직 등록된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', gap: '12px' }}
              id={`comment-item-${comment.id}`}
            >
              <img 
                src={comment.authorProfileUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt={comment.authorNickname} 
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{comment.authorNickname}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {new Date(comment.createdAt).toLocaleDateString('ko-KR', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
