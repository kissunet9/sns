import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/firebaseService';
import { Image, Video, Tag, Star, Trash2, Upload, AlertCircle } from 'lucide-react';

export const PostCreateModal = ({ isOpen, onClose, onPostCreated }) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [repIndex, setRepIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      setError('사진은 하나의 게시물에 최대 4장까지 추가할 수 있습니다.');
      return;
    }
    setError('');

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => {
          const next = [...prev, reader.result];
          if (next.length > 4) return prev;
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (repIndex >= next.length) setRepIndex(0);
      return next;
    });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const cleaned = tagInput.trim().replace(/^#/, '');
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
      setTagInput('');
    }
  };

  const removeTag = (target) => {
    setTags(tags.filter(t => t !== target));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0 && !videoUrl) {
      setError('내용, 사진, 또는 동영상 중 하나 이상을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const postData = {
        authorId: currentUser.uid,
        authorNickname: currentUser.nickname,
        authorProfileUrl: currentUser.profileImageUrl || '',
        content: content.trim(),
        images,
        representativeImageIndex: repIndex,
        videoUrl: videoUrl || null,
        tags
      };

      await apiService.createPost(postData);
      
      // Reset form
      setContent('');
      setImages([]);
      setRepIndex(0);
      setVideoUrl('');
      setTags([]);
      
      if (onPostCreated) onPostCreated();
      onClose();
    } catch (err) {
      setError(err.message || '게시물 등록 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 게시물 등록">
      <form onSubmit={handleSubmit} className="modal-body" style={{ padding: 0 }}>
        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', color: '#fb7185', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Content Textarea */}
        <div className="form-group">
          <label className="form-label">게시물 내용</label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="어떤 이야기를 공유하고 싶으신가요? 텍스트만 올릴 수도 있고 사진이나 영상을 첨부할 수 있습니다."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            id="post-content-textarea"
          />
        </div>

        {/* Photo Upload & Preview Section */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">사진 첨부 (최대 4장)</label>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{images.length}/4장</span>
          </div>

          {images.length < 4 && (
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'var(--bg-input)', border: '1px dashed var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
              <Upload size={18} className="text-indigo-400" />
              <span style={{ fontSize: '0.88rem' }}>사진 선택하기</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} id="photo-file-input" />
            </label>
          )}

          {/* Photo Previews with Representative Image Picker */}
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' }}>
              {images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', height: '90px', borderRadius: '8px', overflow: 'hidden', border: idx === repIndex ? '2px solid #818cf8' : '1px solid var(--border-color)' }}>
                  <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  {/* Representative Star Button */}
                  <button
                    type="button"
                    onClick={() => setRepIndex(idx)}
                    title={idx === repIndex ? '현재 대표 이미지' : '대표 이미지로 설정'}
                    style={{ position: 'absolute', top: '4px', left: '4px', background: idx === repIndex ? '#818cf8' : 'rgba(0,0,0,0.6)', padding: '4px', borderRadius: '50%', color: '#fff' }}
                  >
                    <Star size={12} fill={idx === repIndex ? '#fff' : 'none'} />
                  </button>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(244, 63, 94, 0.8)', padding: '4px', borderRadius: '50%', color: '#fff' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length > 0 && (
            <p style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: '4px' }}>
              ★ 별 아이콘을 클릭하여 대표 사진으로 등록할 컷을 선택할 수 있습니다. (현재 {repIndex + 1}번 대표)
            </p>
          )}
        </div>

        {/* Video Upload Section (Max 1) */}
        <div className="form-group">
          <label className="form-label">동영상 첨부 (최대 1개)</label>
          {!videoUrl ? (
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'var(--bg-input)', border: '1px dashed var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
              <Video size={18} className="text-pink-400" />
              <span style={{ fontSize: '0.88rem' }}>동영상 파일 첨부</span>
              <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} id="video-file-input" />
            </label>
          ) : (
            <div style={{ position: 'relative', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
              <video src={videoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              <button
                type="button"
                onClick={() => setVideoUrl('')}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(244, 63, 94, 0.8)', padding: '6px 12px', borderRadius: '20px', color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}
              >
                동영상 삭제
              </button>
            </div>
          )}
        </div>

        {/* Tag Section */}
        <div className="form-group">
          <label className="form-label">태그 등록 (검색에 사용됨)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="태그 입력 (예: 일상, 여행, 맛집)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              id="tag-input-field"
            />
            <button type="button" className="btn-secondary" onClick={addTag} style={{ flexShrink: 0 }}>
              <Tag size={16} />
              <span>추가</span>
            </button>
          </div>

          {tags.length > 0 && (
            <div className="post-tags" style={{ marginTop: '10px' }}>
              {tags.map((t, idx) => (
                <span key={idx} className="tag-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  #{t}
                  <Trash2 size={12} style={{ cursor: 'pointer' }} onClick={() => removeTag(t)} />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>취소</button>
          <button type="submit" className="btn-primary" disabled={loading} id="submit-post-btn">
            {loading ? '게시물 업로드 중...' : '게시물 등록 완료'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
