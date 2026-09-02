import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { CommentSection } from '../components/post/CommentSection';
import { apiService } from '../services/firebaseService';
import { ArrowLeft, Image, Play, Star, Calendar, User } from 'lucide-react';

export const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const fetchPostDetail = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPostById(id);
      setPost(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          게시물을 읽어오는 중입니다...
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div>
        <Header />
        <div style={{ maxWidth: '600px', margin: '60px auto', padding: '40px', textAlign: 'center' }} className="glass-panel">
          <h2>게시물을 찾을 수 없습니다</h2>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>삭제되었거나 존재하지 않는 게시물입니다.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>피드로 돌아가기</button>
        </div>
      </div>
    );
  }

  const images = post.images || [];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      <Header />

      <main style={{ maxWidth: '800px', margin: '30px auto', padding: '0 20px' }}>
        {/* Back Button */}
        <button 
          className="btn-secondary" 
          onClick={() => navigate('/')} 
          style={{ marginBottom: '20px' }}
          id="back-to-feed-btn"
        >
          <ArrowLeft size={18} />
          <span>목록으로 돌아가기</span>
        </button>

        {/* Post Detail Glass Card */}
        <article className="glass-panel" style={{ padding: '28px', borderRadius: '24px' }}>
          {/* Author Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${post.authorId}`)}
            >
              <img 
                src={post.authorProfileUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt={post.authorNickname} 
                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }}
              />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{post.authorNickname}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} />
                  {new Date(post.createdAt).toLocaleString('ko-KR')}
                </span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags" style={{ marginBottom: '20px' }}>
              {post.tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="tag-badge"
                  onClick={() => navigate(`/?tag=${encodeURIComponent(tag)}`)}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Full Media Gallery View */}
          {images.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              {/* Main Selected Image */}
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000', maxHeight: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={images[selectedMediaIndex] || images[0]} 
                  alt="selected detail" 
                  style={{ width: '100%', height: 'auto', maxHeight: '520px', objectFit: 'contain' }}
                />
                {selectedMediaIndex === (post.representativeImageIndex || 0) && (
                  <span className="rep-badge">대표 이미지</span>
                )}
              </div>

              {/* Thumbnails Slider if multiple */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {images.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedMediaIndex(idx)}
                      style={{ 
                        position: 'relative', 
                        width: '80px', 
                        height: '70px', 
                        borderRadius: '10px', 
                        overflow: 'hidden', 
                        cursor: 'pointer',
                        border: idx === selectedMediaIndex ? '3px solid #818cf8' : '1px solid var(--border-color)',
                        opacity: idx === selectedMediaIndex ? 1 : 0.6
                      }}
                    >
                      <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {idx === (post.representativeImageIndex || 0) && (
                        <Star size={12} fill="#fbbf24" color="#fbbf24" style={{ position: 'absolute', top: '4px', left: '4px' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Video Player */}
          {post.videoUrl && (
            <div style={{ marginBottom: '24px', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
              <video src={post.videoUrl} controls style={{ width: '100%', maxHeight: '480px' }} />
            </div>
          )}

          {/* Comment Section Integration */}
          <CommentSection post={post} onCommentAdded={fetchPostDetail} />
        </article>
      </main>
    </div>
  );
};
