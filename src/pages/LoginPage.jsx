import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { isFirebaseConfigured } from '../firebase/config';
import { Share2, Shield, LogIn, AlertCircle, Sparkles, UserPlus, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { loginWithGoogle, authError, switchDemoAccount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const handleGoogleBtnClick = async () => {
    // If real Firebase is configured, attempt popup; otherwise or if modal desired, open Account Selector Modal!
    if (isFirebaseConfigured) {
      setLoading(true);
      setErr('');
      try {
        const res = await loginWithGoogle();
        if (res.isRegistered) {
          navigate('/');
        } else {
          navigate('/signup');
        }
      } catch (error) {
        // If popup fails or is blocked, open Account Selector modal seamlessly!
        setIsAccountModalOpen(true);
      } finally {
        setLoading(false);
      }
    } else {
      // In Demo Mode, open Google Account Selector Modal!
      setIsAccountModalOpen(true);
    }
  };

  const handleSelectAccount = (uid) => {
    setIsAccountModalOpen(false);
    if (uid === 'new') {
      navigate('/signup');
      return;
    }
    switchDemoAccount(uid);
    navigate('/');
  };

  const displayError = (err && !err.includes('api-key')) ? err : ((authError && !authError.includes('api-key')) ? authError : '');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
        {/* Brand Icon & Logo */}
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)' }}>
          <Share2 size={32} color="#fff" />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>SocialVerse</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '32px' }}>
          당신의 소중한 미디어와 이야기를 공유하는 감성 소셜 서비스
        </p>

        {displayError && (
          <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', color: '#fb7185', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{displayError}</span>
          </div>
        )}

        {/* Main Google Login Button */}
        <button
          className="btn-primary"
          onClick={handleGoogleBtnClick}
          disabled={loading}
          style={{ width: '100%', padding: '14px', fontSize: '1rem', justifyContent: 'center', borderRadius: '14px', marginBottom: '24px' }}
          id="google-login-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{loading ? '구글 계정 연결 중...' : '구글 계정으로 시작하기'}</span>
        </button>

        {/* Fast Demo Account Switcher Card */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#818cf8', fontWeight: 700, marginBottom: '12px' }}>
            <Sparkles size={14} />
            <span>원클릭 빠른 계정 선택</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn-secondary"
              onClick={() => handleSelectAccount('user_dev_01')}
              style={{ justifyContent: 'flex-start', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem' }}
              id="demo-user1-btn"
            >
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="user1" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
              <span>개발자김코딩 계정으로 시작</span>
            </button>

            <button
              className="btn-secondary"
              onClick={() => handleSelectAccount('user_design_02')}
              style={{ justifyContent: 'flex-start', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem' }}
              id="demo-user2-btn"
            >
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" alt="user2" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
              <span>여행가이디자인 계정으로 시작</span>
            </button>
          </div>
        </div>

        {/* Link to Admin Login */}
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => navigate('/admin/login')}
            style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            id="go-admin-login-link"
          >
            <Shield size={14} />
            <span>관리자 로그인 화면으로 이동</span>
          </button>
        </div>
      </div>

      {/* Google Account Selector Dialog Modal */}
      <Modal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} title="구글 계정 선택" maxWidth="460px">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>계정 선택</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            SocialVerse(으)로 이동하기 위해 로그인할 계정을 선택하세요.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Account 1 */}
          <div 
            onClick={() => handleSelectAccount('user_dev_01')}
            style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'all 0.15s' }}
            className="google-account-item"
            id="google-account-user1"
          >
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>개발자김코딩</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>kimdev@gmail.com</div>
            </div>
            <CheckCircle2 size={18} className="text-indigo-400" />
          </div>

          {/* Account 2 */}
          <div 
            onClick={() => handleSelectAccount('user_design_02')}
            style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'all 0.15s' }}
            className="google-account-item"
            id="google-account-user2"
          >
            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>여행가이디자인</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>leedesign@gmail.com</div>
            </div>
            <CheckCircle2 size={18} className="text-indigo-400" />
          </div>

          {/* Account 3 */}
          <div 
            onClick={() => handleSelectAccount('user_startup_03')}
            style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'all 0.15s' }}
            className="google-account-item"
            id="google-account-user3"
          >
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>스타트업대표</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>parkceo@gmail.com</div>
            </div>
            <CheckCircle2 size={18} className="text-indigo-400" />
          </div>

          {/* New Account Register */}
          <div 
            onClick={() => handleSelectAccount('new')}
            style={{ padding: '12px 16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px dashed rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', marginTop: '6px' }}
            id="google-account-new"
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <UserPlus size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#818cf8' }}>다른 계정으로 회원가입하기</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>새로운 구글 계정으로 프로필 생성</div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
