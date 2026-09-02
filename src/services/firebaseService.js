import { isFirebaseConfigured, db, storage } from '../firebase/config';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
  query, where, orderBy, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { mockService } from './mockService';

export const apiService = {
  // Users
  getUserProfile: async (uid) => {
    if (!isFirebaseConfigured) {
      return mockService.getUserById(uid);
    }
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  },

  checkNicknameExists: async (nickname, excludeUid = null) => {
    if (!isFirebaseConfigured) {
      return mockService.checkNicknameExists(nickname, excludeUid);
    }
    const q = query(collection(db, 'users'), where('nickname', '==', nickname.trim()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    if (excludeUid) {
      return snapshot.docs.some(doc => doc.id !== excludeUid);
    }
    return true;
  },

  saveUserProfile: async (uid, profileData) => {
    if (!isFirebaseConfigured) {
      return mockService.saveUser({ uid, ...profileData });
    }
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { uid, ...profileData, updatedAt: serverTimestamp() }, { merge: true });
    return { uid, ...profileData };
  },

  getAllUsers: async () => {
    if (!isFirebaseConfigured) {
      return mockService.getUsers();
    }
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => doc.data());
  },

  toggleBlockUser: async (uid, currentStatus) => {
    if (!isFirebaseConfigured) {
      return mockService.toggleBlockUser(uid);
    }
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { isBlocked: !currentStatus });
  },

  deleteUser: async (uid) => {
    if (!isFirebaseConfigured) {
      return mockService.deleteUser(uid);
    }
    await deleteDoc(doc(db, 'users', uid));
  },

  // File Upload Helper (Firebase Storage or Base64/Object Data URL fallback)
  uploadFile: async (file, path) => {
    if (!isFirebaseConfigured) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // Posts
  getPosts: async (tagFilter = null) => {
    if (!isFirebaseConfigured) {
      let posts = mockService.getPosts();
      if (tagFilter) {
        posts = posts.filter(p => p.tags && p.tags.includes(tagFilter));
      }
      return posts;
    }
    let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    if (tagFilter) {
      q = query(collection(db, 'posts'), where('tags', 'array-contains', tagFilter), orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getPostById: async (id) => {
    if (!isFirebaseConfigured) {
      return mockService.getPostById(id);
    }
    const postDoc = await getDoc(doc(db, 'posts', id));
    return postDoc.exists() ? { id: postDoc.id, ...postDoc.data() } : null;
  },

  createPost: async (postData) => {
    if (!isFirebaseConfigured) {
      return mockService.createPost(postData);
    }
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      commentCount: 0,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...postData };
  },

  updatePost: async (id, data) => {
    if (!isFirebaseConfigured) {
      return mockService.updatePost(id, data);
    }
    await updateDoc(doc(db, 'posts', id), data);
  },

  deletePost: async (id) => {
    if (!isFirebaseConfigured) {
      return mockService.deletePost(id);
    }
    await deleteDoc(doc(db, 'posts', id));
  },

  deleteMediaItem: async (postId, index, isVideo) => {
    if (!isFirebaseConfigured) {
      return mockService.deleteMediaItem(postId, index, isVideo);
    }
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (postDoc.exists()) {
      const data = postDoc.data();
      if (isVideo) {
        await updateDoc(doc(db, 'posts', postId), { videoUrl: null });
      } else if (data.images && data.images.length > 0) {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        let newIndex = data.representativeImageIndex || 0;
        if (newIndex >= newImages.length) newIndex = 0;
        await updateDoc(doc(db, 'posts', postId), { 
          images: newImages, 
          representativeImageIndex: newIndex 
        });
      }
    }
  },

  // Comments
  getCommentsByPostId: async (postId) => {
    if (!isFirebaseConfigured) {
      return mockService.getCommentsByPostId(postId);
    }
    const q = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  addComment: async (postId, currentUser, text) => {
    if (!isFirebaseConfigured) {
      return mockService.createComment(postId, currentUser, text);
    }
    // Check 1 comment per user limit
    const comments = await apiService.getCommentsByPostId(postId);
    if (comments.some(c => c.authorId === currentUser.uid)) {
      throw new Error('한 사람이 하나의 게시물에는 1개밖에 댓글을 달 수 없습니다.');
    }

    const docRef = await addDoc(collection(db, 'comments'), {
      postId,
      authorId: currentUser.uid,
      authorNickname: currentUser.nickname,
      authorProfileUrl: currentUser.profileImageUrl || '',
      text,
      createdAt: serverTimestamp()
    });

    // Increment post comment count
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    if (postDoc.exists()) {
      await updateDoc(postRef, { commentCount: (postDoc.data().commentCount || 0) + 1 });
    }

    return { id: docRef.id, postId, authorId: currentUser.uid, text };
  },

  updateComment: async (commentId, text) => {
    if (!isFirebaseConfigured) {
      return mockService.updateComment(commentId, text);
    }
    await updateDoc(doc(db, 'comments', commentId), { text });
  },

  deleteComment: async (commentId, postId) => {
    if (!isFirebaseConfigured) {
      return mockService.deleteComment(commentId);
    }
    await deleteDoc(doc(db, 'comments', commentId));
    if (postId) {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists() && postDoc.data().commentCount > 0) {
        await updateDoc(postRef, { commentCount: postDoc.data().commentCount - 1 });
      }
    }
  }
};
