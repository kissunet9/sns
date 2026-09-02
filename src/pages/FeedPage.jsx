import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { PostCard } from '../components/post/PostCard';
import { PostCreateModal } from '../components/post/PostCreateModal';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/firebaseService';
import { PlusSquare, Tag, Filter, User, Sparkles, TrendingUp } from 'lucide-react';

export const FeedPage = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tagParam = searchParams.get('tag') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTag, setActiveTag] = useState(tagParam);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPosts(activeTag || null);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveTag(tagParam);
  }, [tagParam]);

  useEffect(() => {
    fetchPosts();
  }, [activeTag]);

  const handleSearch = (term) => {
    const cleaned = term.trim().replace(/^#/, '');
    setActiveTag(cleaned);
    if (cleaned) {
      setSearchParams({ tag: cleaned });
    } else {
      setSearchParams({});
    }
  };

  const clearTagFilter = () => {
    setActiveTag('');
    setSearchParams({});
  };

  // Popular tags for quick filter
  const popularTags = ['제주도', '리액트', '여행', '스타트업', '디자인', '힐링'];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      <Header onSearch={handleSearch} searchQuery={activeTag} />

      <main className="main-container">
        {/* Main Feed Column */}
        <section className="feed-column">
          {/* Active Tag Filter Banner */}
          {activeTag && (
            <div className="glass-panel" style={{ padding: '14px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #818cf8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} className="text-indigo-400" />
                <span style={{ fontWeight: 600 }}>
                  태그 필터 검색 중: <span style={{ color: '#818cf8' }}>#{activeTag}</span>
                </span>
              </div>
              <button className="btn-secondary" onClick={clearTagFilter} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                전체 피드 보기
              </button>
            </div>
          )}

          {/* Quick Create Post Bar */}
          {!isAdmin && currentUser && (
            <div 
              className="glass-panel" 
              style={{ padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
              onClick={() => setIsModalOpen(true)}
              id="feed-create-post-trigger"
            >
              <img 
                src={currentUser.profileImageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt="my avatar" 
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }}
              />
              <div style={{ flex: 1, padding: '10px 16px', background: 'var(--bg-input)', borderRadius: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {currentUser.nickname}님, 어떤 생각이나 사진을 나누고 싶으신가요?
              </div>
              <button className="btn-primary" style={{ padding: '10px 16px' }}>
                <PlusSquare size={18} />
                <span>등록</span>
              </button>
            </div>
          )}

          {/* Feed List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              피드 게시물을 가져오는 중입니다...
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '20px' }}>
              <Tag size={48} className="text-indigo-400" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>게시물이 없습니다</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                {activeTag ? `'#${activeTag}' 태그가 포함된 게시물이 존재하지 않습니다.` : '아직 작성된 피드가 없습니다. 첫 번째 게시물을 남겨보세요!'}
              </p>
              {activeTag && (
                <button className="btn-secondary" onClick={clearTagFilter}>
                  전체 게시물 보기
                </button>
              )}
            </div>
          ) : (
            posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onTagClick={(tag) => handleSearch(tag)} 
              />
            ))
          )}
        </section>

        {/* Sidebar Column */}
        <aside className="sidebar-column">
          {/* User Profile Widget */}
          {currentUser && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', marginBottom: '24px', textAlign: 'center' }}>
              <img 
                src={currentUser.profileImageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                alt="profile" 
                style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #818cf8', margin: '0 auto 12px' }}
              />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{currentUser.nickname}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 16px' }}>
                {currentUser.bio || '남김말이 없습니다.'}
              </p>
              <button 
                className="btn-secondary" 
                onClick={() => navigate(`/profile/${currentUser.uid}`)}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
                id="my-profile-btn"
              >
                <User size={16} />
                <span>내 프로필 보기</span>
              </button>
            </div>
          )}

          {/* Popular Tag Cloud Widget */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8' }}>
              <TrendingUp size={18} />
              <span>인기 추천 태그</span>
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {popularTags.map(tag => (
                <span
                  key={tag}
                  className="tag-badge"
                  onClick={() => handleSearch(tag)}
                  style={{ background: activeTag === tag ? 'var(--primary-600)' : undefined, color: activeTag === tag ? '#fff' : undefined }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Post Create Dialog Modal */}
      <PostCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPostCreated={fetchPosts} 
      />
    </div>
  );
};
