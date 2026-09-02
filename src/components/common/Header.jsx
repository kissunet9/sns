import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Share2, Search, PlusSquare, Settings, LogOut, Shield, User, Users
} from 'lucide-react';

export const Header = ({ onSearch, searchQuery = '' }) => {
  const { currentUser, isAdmin, logout, switchDemoAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [term, setTerm] = useState(searchQuery);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(term);
    } else {
      navigate(`/?tag=${encodeURIComponent(term)}`);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-section" onClick={() => navigate('/')}>
          <Share2 className="w-6 h-6 text-indigo-500" size={26} />
          <span>SocialVerse</span>
        </div>

        {/* Search Bar */}
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <Search className="search-icon-inside" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="태그 또는 키워드 검색 (#제주도, 리액트 등)..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            id="header-search-input"
          />
        </form>

        {/* Action Buttons */}
        <div className="header-actions">
          {/* Quick Demo Switcher Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <Users size={14} style={{ color: '#818cf8' }} />
            <select
              style={{ background: 'transparent', color: '#a5b4fc', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
              value={isAdmin ? 'admin' : (currentUser?.uid || '')}
              onChange={(e) => switchDemoAccount(e.target.value)}
              id="demo-account-select"
            >
              <option value="user_dev_01" style={{ background: '#0f172a' }}>👤 개발자김코딩</option>
              <option value="user_design_02" style={{ background: '#0f172a' }}>👤 여행가이디자인</option>
              <option value="user_startup_03" style={{ background: '#0f172a' }}>👤 스타트업대표</option>
              <option value="admin" style={{ background: '#0f172a' }}>🛡️ 관리자 (Admin)</option>
            </select>
          </div>

          <button
            className="icon-btn"
            title="검색 실행"
            onClick={handleSearchSubmit}
            id="header-search-btn"
          >
            <Search size={20} />
          </button>

          {!isAdmin && currentUser && (
            <>
              <button
                className="btn-primary"
                onClick={() => navigate('/create-post')}
                id="header-create-post-btn"
                style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              >
                <PlusSquare size={18} />
                <span>게시물 등록</span>
              </button>

              <button
                className="icon-btn"
                title="프로필 / 설정"
                onClick={() => navigate('/settings')}
                id="header-settings-btn"
              >
                <Settings size={20} />
              </button>
            </>
          )}

          {isAdmin && (
            <button
              className="btn-secondary"
              onClick={() => navigate('/admin/dashboard')}
              id="header-admin-btn"
              style={{ fontSize: '0.85rem', borderColor: '#818cf8', color: '#818cf8' }}
            >
              <Shield size={16} />
              <span>관리자 전용</span>
            </button>
          )}

          <button
            className="icon-btn"
            title="로그아웃"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            id="header-logout-btn"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
