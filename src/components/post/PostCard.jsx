import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Image, Play, Star } from 'lucide-react';

export const PostCard = ({ post, onTagClick }) => {
  const navigate = useNavigate();

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${post.authorId}`);
  };

  const handleTagClick = (e, tag) => {
    e.stopPropagation();
    if (onTagClick) onTagClick(tag);
    else navigate(`/?tag=${encodeURIComponent(tag)}`);
  };

  const repIndex = post.representativeImageIndex || 0;
  const repImageUrl = post.images && post.images.length > 0 ? post.images[repIndex] || post.images[0] : null;

  return (
    <article 
      className="glass-panel post-card"
      onClick={() => navigate(`/post/${post.id}`)}
      style={{ cursor: 'pointer' }}
      id={`post-card-${post.id}`}
    >
      {/* Post Header */}
      <div className="post-card-header">
        <div className="author-info" onClick={handleAuthorClick} id={`author-${post.id}`}>
          <img 
            src={post.authorProfileUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
            alt={post.authorNickname} 
            className="author-avatar"
          />
          <div>
            <div className="author-nickname">{post.authorNickname}</div>
            <div className="post-date">
              {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Post Body */}
      <div className="post-card-body">
        <p className="post-content">{post.content}</p>

        {/* Tag List */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="tag-badge"
                onClick={(e) => handleTagClick(e, tag)}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Media Thumbnail */}
        {repImageUrl && (
          <div className="post-media-container">
            <span className="rep-badge">대표 이미지</span>
            <img src={repImageUrl} alt="게시물 미디어 대표 컷" className="post-media-img" />
            <span className="photo-count-badge">
              <Image size={14} style={{ display: 'inline', marginRight: '4px' }} />
              대표 선택 ({repIndex + 1}/{post.images.length}장)
            </span>
          </div>
        )}

        {/* Video Thumbnail */}
        {post.videoUrl && (
          <div className="post-media-container video-thumbnail">
            <video src={post.videoUrl} className="post-media-img" style={{ opacity: 0.6 }} />
            <div className="play-overlay">
              <button className="play-icon-btn" title="동영상 재생">
                <Play size={28} style={{ marginLeft: '4px' }} />
              </button>
            </div>
            <span className="photo-count-badge" style={{ background: 'rgba(236, 72, 153, 0.8)' }}>
              🎥 동영상 첨부
            </span>
          </div>
        )}
      </div>

      {/* Post Footer */}
      <div className="post-card-footer">
        <div className="footer-stat" id={`comment-count-${post.id}`}>
          <MessageSquare size={18} className="text-indigo-400" />
          <span>댓글 {post.commentCount || 0}개</span>
        </div>
        <span style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 600 }}>
          상세보기 →
        </span>
      </div>
    </article>
  );
};
