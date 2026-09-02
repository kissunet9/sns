import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/firebaseService';
import { Modal } from '../../components/common/Modal';
import { Users, Ban, ShieldCheck, Trash2, Edit, Save, AlertCircle } from 'lucide-react';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const list = await apiService.getAllUsers();
      setUsers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (user) => {
    if (window.confirm(`'${user.nickname}' 회원의 접속 상태를 [${user.isBlocked ? '차단 해제' : '접속 차단'}]하시겠습니까?`)) {
      try {
        await apiService.toggleBlockUser(user.uid, user.isBlocked);
        await fetchUsers();
      } catch (err) {
        alert(err.message || '차단 상태 변경 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`정말로 '${user.nickname}' 회원 및 관련 컨텐츠를 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        await apiService.deleteUser(user.uid);
        await fetchUsers();
      } catch (err) {
        alert('회원 삭제 실패');
      }
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditNickname(user.nickname);
    setEditBio(user.bio || '');
  };

  const handleSaveEdit = async () => {
    if (!editNickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    try {
      await apiService.saveUserProfile(editingUser.uid, {
        ...editingUser,
        nickname: editNickname.trim(),
        bio: editBio.trim()
      });
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      alert('회원정보 수정 실패');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>사용자 관리</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          회원 리스트를 확인하고 정보 수정, 계정 삭제 및 접속 차단(블락) 설정을 관리합니다.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>사용자 목록을 불러오는 중...</p>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>등록된 회원이 없습니다.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>프로필</th>
                  <th>닉네임</th>
                  <th>이메일</th>
                  <th>남김말</th>
                  <th>접속 상태</th>
                  <th>관리 작업</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.uid} id={`admin-user-row-${user.uid}`}>
                    <td>
                      <img 
                        src={user.profileImageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                        alt="avatar" 
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #818cf8' }} 
                      />
                    </td>
                    <td style={{ fontWeight: 700 }}>{user.nickname}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{user.email || 'sns_user@gmail.com'}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.bio || '-'}
                    </td>
                    <td>
                      {user.isBlocked ? (
                        <span className="status-badge status-blocked">접속 차단됨 (Blocked)</span>
                      ) : (
                        <span className="status-badge status-active">정상 (Active)</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          onClick={() => openEditModal(user)}
                          title="정보 수정"
                          id={`user-edit-btn-${user.uid}`}
                        >
                          <Edit size={14} />
                          <span>수정</span>
                        </button>

                        <button 
                          className="btn-secondary" 
                          style={{ 
                            padding: '6px 10px', 
                            fontSize: '0.78rem',
                            color: user.isBlocked ? '#34d399' : '#f59e0b',
                            borderColor: user.isBlocked ? 'rgba(52, 211, 153, 0.4)' : 'rgba(245, 158, 11, 0.4)'
                          }}
                          onClick={() => handleToggleBlock(user)}
                          title={user.isBlocked ? '차단 해제' : '접속 차단'}
                          id={`user-block-btn-${user.uid}`}
                        >
                          {user.isBlocked ? <ShieldCheck size={14} /> : <Ban size={14} />}
                          <span>{user.isBlocked ? '차단 해제' : '접속 차단'}</span>
                        </button>

                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#fb7185', borderColor: 'rgba(244,63,94,0.4)' }}
                          onClick={() => handleDeleteUser(user)}
                          title="회원 삭제"
                          id={`user-delete-btn-${user.uid}`}
                        >
                          <Trash2 size={14} />
                          <span>삭제</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Info Edit Modal */}
      {editingUser && (
        <Modal isOpen={Boolean(editingUser)} onClose={() => setEditingUser(null)} title="회원 정보 수정">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">닉네임</label>
              <input
                type="text"
                className="form-input"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                id="edit-user-nickname-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">남김말</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                id="edit-user-bio-input"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button className="btn-secondary" onClick={() => setEditingUser(null)}>취소</button>
              <button className="btn-primary" onClick={handleSaveEdit} id="save-edit-user-btn">
                <Save size={16} />
                <span>저장 완료</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
