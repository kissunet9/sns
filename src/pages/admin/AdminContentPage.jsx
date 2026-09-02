import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/firebaseService';
import { mockService } from '../../services/mockService';
import { Modal } from '../../components/common/Modal';
import { FileText, Edit, Trash2, Image, Video, MessageSquare, Save, X, Eye } from 'lucide-react';

export const AdminContentPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected post for detail modal & media / comments moderation
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  
  // Post Edit State
  const [editingPost, setEditingPost] = useState(null);
  const [editContentText, setEditContentText] = useState('');

  // Comment Edit State
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const fetchPostsData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsData();
  }, []);

  const openPostDetailModal = async (post) => {
    setSelectedPost(post);
    try {
      const cList = await apiService.getCommentsByPostId(post.id);
      setComments(cList);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshSelectedPost = async (postId) => {
    const updatedPost = await apiService.getPostById(postId);
    setSelectedPost(updatedPost);
    const cList = await apiService.getCommentsByPostId(postId);
    setComments(cList);
    await fetchPostsData();
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('이 컨텐츠(게시물)와 관련 댓글을 정말로 삭제하시겠습니까?')) {
      try {
        await apiService.deletePost(postId);
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(null);
        }
        await fetchPostsData();
      } catch (err) {
        alert('컨텐츠 삭제 실패');
      }
    }
  };

  const openEditPostModal = (post) => {
    setEditingPost(post);
    setEditContentText(post.content);
  };

  const handleSavePostContent = async () => {
    if (!editContentText.trim()) return;
    try {
      await apiService.updatePost(editingPost.id, { content: editContentText.trim() });
      setEditingPost(null);
      if (selectedPost && selectedPost.id === editingPost.id) {
        refreshSelectedPost(editingPost.id);
      } else {
        fetchPostsData();
      }
    } catch (err) {
      alert('게시물 내용 수정 실패');
    }
  };

  // Delete specific individual photo or video
  const handleDeleteMedia = async (postId, index, isVideo = false) => {
    const mediaName = isVideo ? '동영상' : `${index + 1}번 사진`;
    if (window.confirm(`선택한 ${mediaName}을(를) 게시물에서 개별 삭제하시겠습니까?`)) {
      try {
        await apiService.deleteMediaItem(postId, index, isVideo);
        refreshSelectedPost(postId);
      } catch (err) {
        alert('미디어 개별 삭제 실패');
      }
    }
  };

  // Edit comment
  const handleSaveComment = async (commentId) => {
    if (!editCommentText.trim()) return;
    try {
      await apiService.updateComment(commentId, editCommentText.trim());
      setEditingComment(null);
      if (selectedPost) {
        refreshSelectedPost(selectedPost.id);
      }
    } catch (err) {
      alert('댓글 수정 실패');
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('이 댓글을 삭제하시겠습니까?')) {
      try {
        await apiService.deleteComment(commentId, selectedPost?.id);
        if (selectedPost) {
          refreshSelectedPost(selectedPost.id);
        }
      } catch (err) {
        alert('댓글 삭제 실패');
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>컨텐츠 및 댓글 관리</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          사용자들이 작성한 피드 게시물을 조회하고 본인글/댓글 수정 및 사진·동영상 개별 삭제를 수행합니다.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>컨텐츠 로딩 중...</p>
        ) : posts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>등록된 컨텐츠가 없습니다.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>작성자</th>
                  <th>내용 요약</th>
                  <th>첨부 미디어</th>
                  <th>댓글 수</th>
                  <th>작성 일시</th>
                  <th>관리 작업</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} id={`admin-post-row-${post.id}`}>
                    <td style={{ fontWeight: 700 }}>{post.authorNickname}</td>
                    <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.content}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {post.images && post.images.length > 0 && (
                          <span style={{ fontSize: '0.78rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '2px 8px', borderRadius: '12px' }}>
                            사진 {post.images.length}장
                          </span>
                        )}
                        {post.videoUrl && (
                          <span style={{ fontSize: '0.78rem', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', padding: '2px 8px', borderRadius: '12px' }}>
                            동영상 1개
                          </span>
                        )}
                        {(!post.images || post.images.length === 0) && !post.videoUrl && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>텍스트 전용</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{post.commentCount || 0}개</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          onClick={() => openPostDetailModal(post)}
                          title="상세 미디어/댓글 모더레이션"
                          id={`post-detail-modal-btn-${post.id}`}
                        >
                          <Eye size={14} />
                          <span>상세/미디어</span>
                        </button>

                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          onClick={() => openEditPostModal(post)}
                          title="게시물 편집"
                          id={`post-edit-btn-${post.id}`}
                        >
                          <Edit size={14} />
                          <span>수정</span>
                        </button>

                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#fb7185', borderColor: 'rgba(244,63,94,0.4)' }}
                          onClick={() => handleDeletePost(post.id)}
                          title="게시물 삭제"
                          id={`post-delete-btn-${post.id}`}
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

      {/* Post Content Edit Modal */}
      {editingPost && (
        <Modal isOpen={Boolean(editingPost)} onClose={() => setEditingPost(null)} title="게시물 내용 편집">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">게시물 내용</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={editContentText}
                onChange={(e) => setEditContentText(e.target.value)}
                id="edit-post-textarea"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setEditingPost(null)}>취소</button>
              <button className="btn-primary" onClick={handleSavePostContent} id="save-post-content-btn">
                <Save size={16} />
                <span>저장 완료</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detailed Post & Individual Media/Comment Moderation Modal */}
      {selectedPost && (
        <Modal isOpen={Boolean(selectedPost)} onClose={() => setSelectedPost(null)} title={`컨텐츠 모더레이션 (${selectedPost.authorNickname}님 글)`} maxWidth="720px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Post Content Preview */}
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>게시물 본문</h4>
              <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{selectedPost.content}</p>
            </div>

            {/* Individual Media Photos Deletion Section */}
            {selectedPost.images && selectedPost.images.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '10px', color: '#818cf8' }}>
                  📸 첨부 사진 개별 삭제 ({selectedPost.images.length}장)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                  {selectedPost.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={img} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(selectedPost.id, idx, false)}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(244, 63, 94, 0.9)', color: '#fff', padding: '4px', borderRadius: '50%', cursor: 'pointer' }}
                        title="이 사진 개별 삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                      <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '6px' }}>
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Video Deletion Section */}
            {selectedPost.videoUrl && (
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '10px', color: '#f472b6' }}>
                  🎥 첨부 동영상 관리
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#000', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#fff' }}>등록된 동영상 1개</span>
                  <button
                    className="btn-secondary"
                    style={{ color: '#fb7185', borderColor: 'rgba(244,63,94,0.4)', fontSize: '0.8rem', padding: '4px 10px' }}
                    onClick={() => handleDeleteMedia(selectedPost.id, 0, true)}
                  >
                    <Trash2 size={14} />
                    <span>동영상 개별 삭제</span>
                  </button>
                </div>
              </div>
            )}

            {/* Comments Moderation Section */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={18} className="text-indigo-400" />
                <span>등록된 댓글 관리 ({comments.length}개)</span>
              </h4>

              {comments.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>등록된 댓글이 없습니다.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {comments.map(comment => (
                    <div key={comment.id} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{comment.authorNickname}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setEditingComment(comment);
                              setEditCommentText(comment.text);
                            }}
                          >
                            <Edit size={12} />
                            <span>수정</span>
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '2px 8px', fontSize: '0.75rem', color: '#fb7185', borderColor: 'rgba(244,63,94,0.4)' }}
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 size={12} />
                            <span>삭제</span>
                          </button>
                        </div>
                      </div>

                      {editingComment && editingComment.id === comment.id ? (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                          />
                          <button className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => handleSaveComment(comment.id)}>
                            저장
                          </button>
                          <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setEditingComment(null)}>
                            취소
                          </button>
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{comment.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
