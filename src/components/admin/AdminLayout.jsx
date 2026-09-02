import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, FileText, LogOut, ShieldAlert, ArrowLeft } from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '32px', textAlign: 'center', borderRadius: '16px' }}>
          <ShieldAlert size={48} className="text-pink-500" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>관리자 권한이 필요합니다</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
            이 페이지는 관리자 전용 페이지입니다. 관리자 계정으로 로그인해 주세요.
          </p>
          <button className="btn-primary" onClick={() => navigate('/admin/login')} style={{ width: '100%' }}>
            관리자 로그인으로 이동
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/admin/dashboard', label: '대시보드', icon: LayoutDashboard },
    { path: '/admin/users', label: '사용자 관리', icon: Users },
    { path: '/admin/content', label: '컨텐츠 관리', icon: FileText }
  ];

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div>
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
            <ShieldAlert size={28} className="text-indigo-400" />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>SocialVerse Admin</h2>
              <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>통합 관리자 모듈</span>
            </div>
          </div>

          {/* Nav Menu */}
          <nav>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                  style={{ width: '100%', textDecoration: 'none' }}
                  id={`admin-nav-${item.path.replace('/admin/', '')}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div>
          <button
            className="btn-secondary"
            onClick={() => navigate('/')}
            style={{ width: '100%', marginBottom: '10px', justifyContent: 'center', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>사용자 피드로 이동</span>
          </button>
          
          <button
            className="btn-secondary"
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', color: '#fb7185', borderColor: 'rgba(244,63,94,0.3)' }}
            id="admin-logout-btn"
          >
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {children || <Outlet />}
      </main>
    </div>
  );
};
