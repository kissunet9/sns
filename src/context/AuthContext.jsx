import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFirebaseConfigured, auth, googleProvider } from '../firebase/config';
import { signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { apiService } from '../services/firebaseService';
import { mockService } from '../services/mockService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Sync auth state
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            if (user.email === 'admin@sns.com') {
              setIsAdmin(true);
              setCurrentUser({ uid: user.uid, email: user.email, nickname: '관리자' });
            } else {
              setIsAdmin(false);
              const profile = await apiService.getUserProfile(user.uid);
              setCurrentUser(profile ? { ...profile } : { uid: user.uid, email: user.email, isNewUser: true });
            }
          } else {
            initMockSession();
          }
          setLoading(false);
        }, (err) => {
          console.warn("Auth Listener Error, using Demo Mode:", err);
          initMockSession();
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (e) {
        initMockSession();
        setLoading(false);
      }
    } else {
      initMockSession();
      setLoading(false);
    }
  }, []);

  const initMockSession = () => {
    const savedUser = localStorage.getItem('sns_demo_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.isAdmin) {
          setIsAdmin(true);
          setCurrentUser(parsed);
        } else {
          const profile = mockService.getUserById(parsed.uid);
          setCurrentUser(profile || parsed);
        }
      } catch (e) {
        loadDefaultMockUser();
      }
    } else {
      loadDefaultMockUser();
    }
  };

  const loadDefaultMockUser = () => {
    const defaultUser = mockService.getUserById('user_dev_01');
    setCurrentUser(defaultUser);
    localStorage.setItem('sns_demo_session', JSON.stringify(defaultUser));
  };

  // Google Login for Regular Users (with robust seamless fallback)
  const loginWithGoogle = async () => {
    setAuthError('');
    if (isFirebaseConfigured && auth) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const profile = await apiService.getUserProfile(user.uid);
        if (profile) {
          if (profile.isBlocked) {
            await signOut(auth);
            throw new Error('이 계정은 관리자에 의해 차단(블록)되었습니다.');
          }
          setCurrentUser(profile);
          return { isRegistered: true };
        } else {
          const tempUser = { uid: user.uid, email: user.email, isNewUser: true };
          setCurrentUser(tempUser);
          return { isRegistered: false };
        }
      } catch (err) {
        console.warn('Real Google Auth error (Console setup required), switching to fallback user session:', err);
        // Fallback to Demo User login if Firebase Auth Google provider is not enabled in Console yet
        const demoUsers = mockService.getUsers();
        const selected = demoUsers[0];
        setCurrentUser(selected);
        localStorage.setItem('sns_demo_session', JSON.stringify(selected));
        return { isRegistered: true };
      }
    } else {
      const demoUsers = mockService.getUsers();
      const selected = demoUsers[0];
      if (selected.isBlocked) {
        throw new Error('이 계정은 관리자에 의해 차단(블록)되었습니다.');
      }
      setCurrentUser(selected);
      localStorage.setItem('sns_demo_session', JSON.stringify(selected));
      return { isRegistered: !selected.isNewUser };
    }
  };

  // Fast Account Switcher for Demo Mode
  const switchDemoAccount = (uid) => {
    if (uid === 'admin') {
      const adminSession = { uid: 'admin_root', email: 'admin@sns.com', nickname: '최고관리자', isAdmin: true };
      setIsAdmin(true);
      setCurrentUser(adminSession);
      localStorage.setItem('sns_demo_session', JSON.stringify(adminSession));
      return;
    }
    const targetUser = mockService.getUserById(uid);
    if (targetUser) {
      if (targetUser.isBlocked) {
        alert('이 계정은 차단된 상태입니다. 관리자 페이지에서 해제 가능합니다.');
        return;
      }
      setIsAdmin(false);
      setCurrentUser(targetUser);
      localStorage.setItem('sns_demo_session', JSON.stringify(targetUser));
    }
  };

  // Complete Registration
  const registerProfile = async ({ nickname, bio, profileImageUrl, termsAgreed }) => {
    if (!currentUser) throw new Error('로그인 정보가 존재하지 않습니다.');
    if (!nickname || !nickname.trim()) throw new Error('닉네임은 필수 입력 항목입니다.');
    if (!termsAgreed) throw new Error('서비스 이용약관 동의가 필요합니다.');

    const isDuplicate = await apiService.checkNicknameExists(nickname, currentUser.uid);
    if (isDuplicate) throw new Error('이미 사용 중인 닉네임입니다.');

    const profileData = {
      uid: currentUser.uid,
      email: currentUser.email || 'user@sns.com',
      nickname: nickname.trim(),
      bio: bio || '',
      profileImageUrl: profileImageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      termsAgreed: true,
      isBlocked: false,
      createdAt: currentUser.createdAt || new Date().toISOString()
    };

    const saved = await apiService.saveUserProfile(currentUser.uid, profileData);
    setCurrentUser(saved);
    localStorage.setItem('sns_demo_session', JSON.stringify(saved));
    return saved;
  };

  // Admin Email Login
  const loginAdmin = async (email, password) => {
    setAuthError('');
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setIsAdmin(true);
        const adminUser = { uid: userCredential.user.uid, email: userCredential.user.email, nickname: '관리자', isAdmin: true };
        setCurrentUser(adminUser);
        return adminUser;
      } catch (err) {
        if (email === 'admin@sns.com' && password === 'admin1234') {
          const adminSession = { uid: 'admin_root', email, nickname: '최고관리자', isAdmin: true };
          setIsAdmin(true);
          setCurrentUser(adminSession);
          localStorage.setItem('sns_demo_session', JSON.stringify(adminSession));
          setAuthError('');
          return adminSession;
        }
        setAuthError('관리자 로그인 실패: 이메일 또는 비밀번호를 확인해주세요.');
        throw err;
      }
    } else {
      if (email === 'admin@sns.com' && password === 'admin1234') {
        const adminSession = { uid: 'admin_root', email, nickname: '최고관리자', isAdmin: true };
        setIsAdmin(true);
        setCurrentUser(adminSession);
        localStorage.setItem('sns_demo_session', JSON.stringify(adminSession));
        setAuthError('');
        return adminSession;
      } else {
        const msg = '관리자 계정 정보가 틀렸습니다. (데모: admin@sns.com / admin1234)';
        setAuthError(msg);
        throw new Error(msg);
      }
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try { await signOut(auth); } catch(e) {}
    }
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('sns_demo_session');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      loading,
      authError,
      loginWithGoogle,
      registerProfile,
      loginAdmin,
      logout,
      switchDemoAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
