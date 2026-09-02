import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export const AdminLoginPage = () => {
  const { loginAdmin, authError, switchDemoAccount } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@sns.com');
  const [password, setPassword] = useState('admin1234');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      await loginAdmin(email, password);
      navigate('/admin/dashboard');
    } catch (error) {
      if (error.message?.includes('api-key') || error.code === 'auth/api-key-not-valid') {
        // Seamless fallback to demo admin login when Firebase API key is unconfigured/invalid
        if (email === 'admin@sns.com' && password === 'admin1234') {
          switchDemoAccount('admin');
          navigate('/admin/dashboard');
          return;
        }
      }
      setErr(error.message || '관리자 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const displayError = (err && !err.includes('api-key')) ? err : ((authError && !authError.includes('api-key')) ? authError : '');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '40px', borderRadius: '24px' }}>
        <button className="btn-secondary" onClick={() => navigate('/login')} style={{ marginBottom: '20px', padding: '6px 12px', fontSize: '0.82rem' }}>
          <ArrowLeft size={14} />
          <span>사용자 로그인으로 이동</span>
        </button>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>관리자 로그인</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            관리자 전용 이메일과 비밀번호로 접속하세요.
          </p>
        </div>

        {displayError && (
          <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', color: '#fb7185', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label className="form-label">관리자 이메일</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sns.com"
                id="admin-email-input"
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                id="admin-password-input"
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.78rem', color: '#a5b4fc' }}>
            💡 데모 관리자 계정: <strong>admin@sns.com</strong> / <strong>admin1234</strong>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center', marginTop: '6px' }}
            id="admin-login-submit-btn"
          >
            <Shield size={18} />
            <span>{loading ? '인증 처리 중...' : '관리자 로그인'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
