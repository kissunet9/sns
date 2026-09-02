import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/firebaseService';
import { mockService } from '../../services/mockService';
import { Users, FileText, MessageSquare, ShieldAlert, ArrowRight, Activity } from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, posts: 0, comments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const users = await apiService.getAllUsers();
        const posts = await apiService.getPosts();
        const comments = mockService.getComments();
        setStats({
          users: users.length,
          posts: posts.length,
          comments: comments.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>관리자 대시보드</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          SocialVerse 전체 시스템 현황 및 요약 데이터입니다.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
            <Users size={28} />
          </div>
          <div>
            <div className="stat-val">{loading ? '...' : stats.users}명</div>
            <div className="stat-lbl">총 가입 사용자 수</div>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #ec4899' }}>
          <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6' }}>
            <FileText size={28} />
          </div>
          <div>
            <div className="stat-val">{loading ? '...' : stats.posts}개</div>
            <div className="stat-lbl">총 등록 컨텐츠(게시물) 수</div>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
            <MessageSquare size={28} />
          </div>
          <div>
            <div className="stat-val">{loading ? '...' : stats.comments}개</div>
            <div className="stat-lbl">총 등록 댓글 수</div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users className="text-indigo-400" size={20} />
            <span>사용자 관리</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
            가입한 사용자들의 리스트를 조회하고 닉네임/프로필 수정, 회원 삭제 및 **접속 차단(블록)** 설정을 수행합니다.
          </p>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/admin/users')}
            style={{ width: '100%', justifyContent: 'center' }}
            id="dash-user-mgmt-btn"
          >
            <span>사용자 관리 바로가기</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText className="text-pink-400" size={20} />
            <span>컨텐츠 & 댓글 관리</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
            작성된 게시물의 내용을 수정/삭제하거나 첨부된 사진·동영상을 개별 삭제하고 댓글 모더레이션을 진행합니다.
          </p>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/admin/content')}
            style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}
            id="dash-content-mgmt-btn"
          >
            <span>컨텐츠 관리 바로가기</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
