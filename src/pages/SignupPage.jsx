import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/firebaseService';
import { UserCheck, CheckCircle2, AlertCircle, Upload, ShieldCheck } from 'lucide-react';

export const SignupPage = () => {
  const { registerProfile } = useAuth();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  
  const [isCheckedNickname, setIsCheckedNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameSuccess, setNicknameSuccess] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleNicknameCheck = async () => {
    if (!nickname.trim()) {
      setNicknameError('닉네임을 입력해 주세요.');
      setNicknameSuccess('');
      setIsCheckedNickname(false);
      return;
    }

    try {
      const exists = await apiService.checkNicknameExists(nickname.trim());
      if (exists) {
        setNicknameError('이미 존재하거나 사용 중인 닉네임입니다.');
        setNicknameSuccess('');
        setIsCheckedNickname(false);
      } else {
        setNicknameError('');
        setNicknameSuccess('사용 가능한 닉네임입니다!');
        setIsCheckedNickname(true);
      }
    } catch (err) {
      setNicknameError('중복 체크 중 오류가 발생했습니다.');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setFormError('닉네임은 필수 항목입니다.');
      return;
    }
    if (!isCheckedNickname) {
      setFormError('닉네임 중복 체크를 진행해 주세요.');
      return;
    }
    if (!termsAgreed || !privacyAgreed) {
      setFormError('서비스 이용약관 및 개인정보 취급 방침에 모두 동의해야 합니다.');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      await registerProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        profileImageUrl,
        termsAgreed: true
      });
      navigate('/');
    } catch (err) {
      setFormError(err.message || '회원가입 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = nickname.trim() && isCheckedNickname && termsAgreed && privacyAgreed;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', padding: '36px', borderRadius: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>회원가입 및 프로필 설정</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            SocialVerse에서 사용할 프로필과 필수 닉네임을 설정해 주세요.
          </p>
        </div>

        {formError && (
          <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', color: '#fb7185', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Profile Picture Select */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              <img
                src={profileImageUrl}
                alt="profile preview"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #818cf8' }}
              />
              <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#6366f1', padding: '6px', borderRadius: '50%', cursor: 'pointer', color: '#fff' }}>
                <Upload size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} id="signup-avatar-input" />
              </label>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>프로필 사진 등록</span>
          </div>

          {/* Nickname with Duplicate Check Button */}
          <div className="form-group">
            <label className="form-label">닉네임 (필수)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="사용할 닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setIsCheckedNickname(false);
                  setNicknameError('');
                  setNicknameSuccess('');
                }}
                id="signup-nickname-input"
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleNicknameCheck}
                style={{ flexShrink: 0, padding: '10px 16px' }}
                id="nickname-check-btn"
              >
                <UserCheck size={16} />
                <span>중복체크</span>
              </button>
            </div>
            {nicknameError && (
              <span style={{ fontSize: '0.8rem', color: '#fb7185', marginTop: '4px' }}>{nicknameError}</span>
            )}
            {nicknameSuccess && (
              <span style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} />
                <span>{nicknameSuccess}</span>
              </span>
            )}
          </div>

          {/* Bio / Greeting message */}
          <div className="form-group">
            <label className="form-label">남김말 (소개글)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="프로필에 표시할 짧은 남김말을 입력하세요."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              id="signup-bio-textarea"
            />
          </div>

          {/* Terms Checkboxes */}
          <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                id="terms-check"
              />
              <span>[필수] 서비스 이용약관에 동의합니다.</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
                id="privacy-check"
              />
              <span>[필수] 개인정보 취급 방침에 동의합니다.</span>
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={!isFormValid || loading}
            style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center', marginTop: '8px', opacity: isFormValid ? 1 : 0.5 }}
            id="submit-signup-btn"
          >
            <ShieldCheck size={20} />
            <span>{loading ? '가입 처리 중...' : '회원가입 완료'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
