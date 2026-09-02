// Mock & LocalStorage Service for Seamless Demo Experience
const STORAGE_KEYS = {
  USERS: 'sns_mock_users',
  POSTS: 'sns_mock_posts',
  COMMENTS: 'sns_mock_comments',
  CURRENT_USER: 'sns_mock_current_user'
};

// Initial Seed Data
const initialUsers = [
  {
    uid: 'user_dev_01',
    email: 'kimdev@gmail.com',
    nickname: '개발자김코딩',
    bio: 'React와 Firebase로 만드는 세상 🚀',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    termsAgreed: true,
    isBlocked: false,
    createdAt: '2026-08-15T10:00:00.000Z'
  },
  {
    uid: 'user_design_02',
    email: 'leedesign@gmail.com',
    nickname: '여행가이디자인',
    bio: '전 세계의 아름다운 순간들을 기록합니다 ✈️📸',
    profileImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    termsAgreed: true,
    isBlocked: false,
    createdAt: '2026-08-20T14:30:00.000Z'
  },
  {
    uid: 'user_startup_03',
    email: 'parkceo@gmail.com',
    nickname: '스타트업대표',
    bio: '혁신적인 커뮤니티 플랫폼 빌딩 중!',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    termsAgreed: true,
    isBlocked: false,
    createdAt: '2026-08-25T09:15:00.000Z'
  }
];

const initialPosts = [
  {
    id: 'post_01',
    authorId: 'user_design_02',
    authorNickname: '여행가이디자인',
    authorProfileUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    content: '제주도 신창풍차해안도로에서 담아온 노을빛 풍경입니다! 대표 이미지는 1번 사진으로 설정했어요 🌅✨',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1476514525535-ce74f45814ce?w=800&auto=format&fit=crop&q=80'
    ],
    representativeImageIndex: 0,
    videoUrl: null,
    tags: ['여행', '제주도', '풍경', '힐링'],
    commentCount: 1,
    createdAt: '2026-09-01T11:20:00.000Z'
  },
  {
    id: 'post_02',
    authorId: 'user_dev_01',
    authorNickname: '개발자김코딩',
    authorProfileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'React + Firebase로 완성한 실시간 모듈형 SNS 데모 시연 영상입니다. 피드 반응속도가 정말 빠르네요! 💻🔥',
    images: [],
    representativeImageIndex: 0,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    tags: ['리액트', '개발', '코딩', '파이어베이스'],
    commentCount: 1,
    createdAt: '2026-09-02T08:45:00.000Z'
  },
  {
    id: 'post_03',
    authorId: 'user_startup_03',
    authorNickname: '스타트업대표',
    authorProfileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    content: '새로 오픈한 라운지 오피스 인테리어 투어! 총 4장의 사진 중 2번째 컷을 대표 이미지로 픽했습니다 😎',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&auto=format&fit=crop&q=80'
    ],
    representativeImageIndex: 1,
    videoUrl: null,
    tags: ['스타트업', '오피스', '인테리어'],
    commentCount: 0,
    createdAt: '2026-09-02T14:10:00.000Z'
  }
];

const initialComments = [
  {
    id: 'comment_01',
    postId: 'post_01',
    authorId: 'user_dev_01',
    authorNickname: '개발자김코딩',
    authorProfileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    text: '풍경 사진이 정말 예술이네요! 제주도 가고 싶어집니다 🌊',
    createdAt: '2026-09-01T12:00:00.000Z'
  },
  {
    id: 'comment_02',
    postId: 'post_02',
    authorId: 'user_startup_03',
    authorNickname: '스타트업대표',
    authorProfileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    text: 'UI/UX가 무척 깔끔하고 부드럽네요. 응원합니다!',
    createdAt: '2026-09-02T09:30:00.000Z'
  }
];

// Helper to initialize local storage if empty
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(initialPosts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(initialComments));
  }
};

initStorage();

export const mockService = {
  // Users
  getUsers: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },

  getUserById: (uid) => {
    const users = mockService.getUsers();
    return users.find(u => u.uid === uid) || null;
  },

  checkNicknameExists: (nickname, excludeUid = null) => {
    const users = mockService.getUsers();
    return users.some(u => u.nickname.trim() === nickname.trim() && u.uid !== excludeUid);
  },

  saveUser: (userData) => {
    const users = mockService.getUsers();
    const index = users.findIndex(u => u.uid === userData.uid);
    if (index >= 0) {
      users[index] = { ...users[index], ...userData };
    } else {
      users.push(userData);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return userData;
  },

  toggleBlockUser: (uid) => {
    const users = mockService.getUsers();
    const index = users.findIndex(u => u.uid === uid);
    if (index >= 0) {
      users[index].isBlocked = !users[index].isBlocked;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    return users;
  },

  deleteUser: (uid) => {
    let users = mockService.getUsers();
    users = users.filter(u => u.uid !== uid);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Remove posts & comments by deleted user
    let posts = mockService.getPosts().filter(p => p.authorId !== uid);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    let comments = mockService.getComments().filter(c => c.authorId !== uid);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));

    return users;
  },

  // Posts
  getPosts: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
  },

  getPostById: (id) => {
    const posts = mockService.getPosts();
    return posts.find(p => p.id === id) || null;
  },

  createPost: (postData) => {
    const posts = mockService.getPosts();
    const newPost = {
      id: `post_${Date.now()}`,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      ...postData
    };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return newPost;
  },

  updatePost: (id, updatedFields) => {
    const posts = mockService.getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index >= 0) {
      posts[index] = { ...posts[index], ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }
    return posts[index];
  },

  deletePost: (id) => {
    let posts = mockService.getPosts();
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

    // Delete comments for this post
    let comments = mockService.getComments().filter(c => c.postId !== id);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));

    return posts;
  },

  deleteMediaItem: (postId, mediaIndex, isVideo = false) => {
    const posts = mockService.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index >= 0) {
      if (isVideo) {
        posts[index].videoUrl = null;
      } else if (posts[index].images && posts[index].images.length > 0) {
        posts[index].images.splice(mediaIndex, 1);
        if (posts[index].representativeImageIndex >= posts[index].images.length) {
          posts[index].representativeImageIndex = 0;
        }
      }
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }
    return posts[index];
  },

  // Comments
  getComments: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '[]');
  },

  getCommentsByPostId: (postId) => {
    const comments = mockService.getComments();
    return comments.filter(c => c.postId === postId);
  },

  createComment: (postId, authorUser, text) => {
    const comments = mockService.getComments();
    
    // Check 1 comment per user per post
    const existing = comments.find(c => c.postId === postId && c.authorId === authorUser.uid);
    if (existing) {
      throw new Error('한 사람이 하나의 게시물에는 1개밖에 댓글을 달 수 없습니다.');
    }

    const newComment = {
      id: `comment_${Date.now()}`,
      postId,
      authorId: authorUser.uid,
      authorNickname: authorUser.nickname,
      authorProfileUrl: authorUser.profileImageUrl,
      text,
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));

    // Update post comment count
    const posts = mockService.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex >= 0) {
      posts[postIndex].commentCount = (posts[postIndex].commentCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }

    return newComment;
  },

  updateComment: (commentId, text) => {
    const comments = mockService.getComments();
    const index = comments.findIndex(c => c.id === commentId);
    if (index >= 0) {
      comments[index].text = text;
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    }
    return comments[index];
  },

  deleteComment: (commentId) => {
    let comments = mockService.getComments();
    const target = comments.find(c => c.id === commentId);
    if (target) {
      comments = comments.filter(c => c.id !== commentId);
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));

      // Decrement post comment count
      const posts = mockService.getPosts();
      const postIndex = posts.findIndex(p => p.id === target.postId);
      if (postIndex >= 0 && posts[postIndex].commentCount > 0) {
        posts[postIndex].commentCount -= 1;
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      }
    }
    return comments;
  }
};
