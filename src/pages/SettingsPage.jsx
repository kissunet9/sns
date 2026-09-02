import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/firebaseService';
import { UserCheck, CheckCircle2, AlertCircle, Upload, Save, ArrowLeft } from 'lucide-react';

export const SettingsPage = () => {
  const { currentUser, registerProfile } = useAuth();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const [isCheckedNickname, setIsCheckedNickname] = useState(true);
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameSuccess, setNicknameSuccess] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setNickname(currentUser.nickname || '');
      setBio(currentUser.bio || '');
      setProfileImageUrl(currentUser.profileImageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
    }
  }, [currentUser]);

  const handleNicknameCheck = async () => {
    if (!nickname.trim()) {
      setNicknameError('닉네임을 입력해 주세요.');
      setNicknameSuccess('');
      setIsCheckedNickname(false);
      return;
    }

    if (nickname.trim() === currentUser.nickname) {
      setNicknameSuccess('현재 사용 중인 본인의 닉네임입니다.');
      setNicknameError('');
      setIsCheckedNickname(true);
      return;
    }

    try {
      const exists = await apiService.checkNicknameExists(nickname.trim(), currentUser.uid);
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
      setMessage('닉네임은 필수 항목입니다.');
      return;
    }
    if (!isCheckedNickname) {
      setMessage('닉네임 변경 후 중복 체크를 완료해 주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await registerProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        profileImageUrl,
        termsAgreed: true
      });
      setMessage('성공적으로 프로필 정보가 수정되었습니다!');
      setTimeout(() => {
        navigate(`/profile/${currentUser.uid}`);
      }, 1000);
    } catch (err) {
      setMessage(err.message || '정보 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      <Header />

      <main style={{ maxWidth: '580px', margin: '30px auto', padding: '0 20px' }}>
        <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
          <ArrowLeft size={18} />
          <span>피드로 돌아가기</span>
        </button>

        <div className="glass-panel" style={{ padding: '36px', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>회원 정보 수정</h2>

          {message && (
            <div style={{ padding: '12px', background: message.includes('성공') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', border: `1px solid ${message.includes('성공') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`, borderRadius: '10px', color: message.includes('성공') ? '#34d399' : '#fb7185', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {message.includes('성공') ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Avatar Modify */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '96px', height: '96px' }}>
                <img 
                  src={profileImageUrl} 
                  alt="avatar" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #818cf8' }} 
                />
                <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#6366f1', padding: '6px', borderRadius: '50%', cursor: 'pointer', color: '#fff' }}>
                  <Upload size={14} />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} id="settings-avatar-input" />
                </label>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>프로필 사진 변경</span>
            </div>

            {/* Nickname Modify & Check */}
            <div className="form-group">
              <label className="form-label">닉네임</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    if (e.target.value === currentUser?.nickname) {
                      setIsCheckedNickname(true);
                      setNicknameError('');
                    } else {
                      setIsCheckedNickname(false);
                      setNicknameError('');
                      setNicknameSuccess('');
                    }
                  }}
                  id="settings-nickname-input"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleNicknameCheck}
                  style={{ flexShrink: 0, padding: '10px 16px' }}
                  id="settings-nickname-check-btn"
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

            {/* Bio Modify */}
            <div className="form-group">
              <label className="form-label">남김말 (소개글)</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                id="settings-bio-textarea"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !isCheckedNickname}
              style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center', marginTop: '10px' }}
              id="submit-settings-btn"
            >
              <Save size={18} />
              <span>{loading ? '저장 중...' : '변경사항 저장하기'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
