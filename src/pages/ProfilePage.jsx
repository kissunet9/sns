import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { PostCard } from '../components/post/PostCard';
import { apiService } from '../services/firebaseService';
import { mockService } from '../services/mockService';
import { Calendar, FileText, MessageSquare, ArrowLeft, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userCommentCount, setUserCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const user = await apiService.getUserProfile(uid);
      setProfileUser(user);

      const allPosts = await apiService.getPosts();
      const filteredPosts = allPosts.filter(p => p.authorId === uid);
      setUserPosts(filteredPosts);

      // Compute total comments written by this user
      const allComments = mockService.getComments();
      const userComments = allComments.filter(c => c.authorId === uid);
      setUserCommentCount(userComments.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid) fetchProfileData();
  }, [uid]);

  const isMe = currentUser && currentUser.uid === uid;

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          프로필 정보를 로딩 중입니다...
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div>
        <Header />
        <div style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center', padding: '40px' }} className="glass-panel">
          <h2>사용자를 찾을 수 없습니다</h2>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 20px' }}>존재하지 않는 회원 정보입니다.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>메인으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      <Header />

      <main style={{ maxWidth: '840px', margin: '30px auto', padding: '0 20px' }}>
        <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
          <ArrowLeft size={18} />
          <span>목록으로 돌아가기</span>
        </button>

        {/* Profile Info Header Card */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <img 
              src={profileUser.profileImageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
              alt={profileUser.nickname} 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #818cf8' }} 
            />

            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{profileUser.nickname}</h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Calendar size={14} />
                    가입일: {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('ko-KR') : '2026. 08. 15'}
                  </span>
                </div>

                {isMe && (
                  <button className="btn-secondary" onClick={() => navigate('/settings')} id="edit-profile-btn">
                    <Settings size={16} />
                    <span>회원 정보 수정</span>
                  </button>
                )}
              </div>

              <p style={{ marginTop: '14px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {profileUser.bio || '남김말이 등록되지 않았습니다.'}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <FileText size={28} className="text-indigo-400" />
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{userPosts.length}개</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>작성한 컨텐츠</div>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <MessageSquare size={28} className="text-pink-400" />
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{userCommentCount}개</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>작성한 댓글</div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Posts Feed Header */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', color: 'var(--text-main)' }}>
          {profileUser.nickname}님이 작성한 게시물 ({userPosts.length})
        </h3>

        {/* User Posts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {userPosts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px', color: 'var(--text-muted)' }}>
              작성한 게시물이 아직 없습니다.
            </div>
          ) : (
            userPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </main>
    </div>
  );
};
