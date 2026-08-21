import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Post, Comment, Project, ConnectionStatus, Notification } from '../data/types';
import { INITIAL_PROJECTS } from '../data/projects';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface UserProfile {
  name: string;
  username: string;
  bio: string;
  location: string;
  avatar: string;
  college: string;
  joinedDate: string;
  skills: string[];
  interests: string[];
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface AppState {
  isAuthenticated: boolean;
  userProfile: UserProfile;
  joinedClubs: Set<string>;
  rsvpdEvents: Set<string>;
  interestedEvents: Set<string>;
  collegePosts: Record<string, Post[]>;
  clubPosts: Record<string, Post[]>;
  homePosts: Post[];
  projects: Project[];
  comments: Record<string, Comment[]>;
  likedPosts: Set<string>;
  connections: Record<string, ConnectionStatus>;
  notifications: Notification[];
  toast: ToastMessage | null;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Kavya Rajput',
  username: 'kvya.x_x',
  bio: 'Building things that matter. Exploring the intersection of design, technology, and community. Always down for a coffee chat. ☕️',
  location: 'Mathura, India',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZWZ6hXOz2o4IibLgz9AtdxXjPUPiNFEJyqza76VKCXd6EarCFBjmLwqJgrFk3dLIwrZxuLyaAeLRf21F4oWlwnn8Z7wyA91tJ4M5R4KoRyq_V6NEmzRYisnXpr3PlVqgFxoecgga1cxgXrCY46RDc_VlzbXejWyRlIQCPCm3oQOGB_vy6rfMwfjOdZn4nw47ClxfDPXvATwEYekYZshmpLmsvHoUfP7qfREcHBKgLg26vmr_BBLFQ',
  college: 'GLA University',
  joinedDate: 'Aug 2026',
  skills: ['React', 'Figma', 'UI/UX', 'TypeScript'],
  interests: ['Design', 'AI', 'Startups', 'Open Source'],
};

const INITIAL_HOME_POSTS: Post[] = [
  {
    id: '1',
    authorId: 'rohan-sharma',
    authorName: 'Rohan Sharma',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb3houXNWLXON9IYsFB6QtYiXNkHjkCtZgQjOfjW8uLVF4Niwp4i7FQSGDFqiwQDy1SkJ6wnl_KaZQeyVIYEIgWzgtdCIO3KRubQofQHdYTiH9bmT1DUkBT1ZSo7i9Wt3hi1_eZgwdtWaDjLD9B5pcZR6pyNtfXLSZ4AWjzxIQr0jnA_oT-e2o7-7jCcd7Zw5dPOTeCYIsbxld6cDb_0KCm5j74eLxB3nZU9DCBmesWH40C4rYiT0O',
    authorMajor: 'Mechanical',
    createdAt: '15m ago',
    tag: 'Memes',
    category: 'Memes',
    content: 'Me trying to explain to the professor why my code works on my machine but not on the server during the demo. 🤡',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
    likes: 412,
    liked: false,
    commentsCount: 2,
  },
  {
    id: '2',
    authorId: 'ishaan-v',
    authorName: 'Ishaan V.',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZjNqDwbJvLnKjZxoSz-wKHamiapQLn9xPtLOSCp4wip0ONfOW6wZlhtFaYuDzZbAVS9u-MeP8V1hmGAdb_3zPjyZfowLnjzcBSgPW0BivhvPSF0CaFZ1jnVxs68ErehpeEuaCRKExDy05rwSR2gFNX4TWcXB5Qt1Kie458MCMsUO1WMJM8HXawjBPx70XXtbW8oJdQbqvi3gqeqAw288InId1KEdNKWuXWWM509tck4EAgHvazddm',
    authorMajor: 'CS',
    createdAt: '1h ago',
    tag: 'Ask Help',
    category: 'Ask Help',
    badgeStyle: 'bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full text-label-sm flex items-center gap-xs',
    content: 'Bhai ye professor ka assignment samajh aaya? The logic for the third question seems impossible. Anyone figured it out? #AssignmentHelp',
    likes: 24,
    liked: false,
    isUpvoteStyle: true,
    commentsCount: 1,
  },
  {
    id: '3',
    authorId: 'ananya-k',
    authorName: 'Ananya K.',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8jjI1mgvdtQOgIgy4ITgY16uTSuVwJUFqw6uAVSoyc8WzDlrOC394updzRMMNiVQONA6osROpzMCkkJ0s9TMJaRdRAKZkzoFq8JzgZ_MV1XaS3ZRf_MFSownVoSke29bQ2azYT4xjTzSJY4JGSDWNGchV-hXFrruhzDo9nB9H2hLrisDgun6d4BlWdLotnZMbLZYEZSqhuYGbO4pTsIPmpPcJ4SpA6FodGiyBNSb6GEQWoFfSIuMR',
    authorMajor: 'Arts',
    createdAt: '3h ago',
    tag: 'Hot Takes',
    category: 'Hot Takes',
    content: "Hot Take: The canteen's coffee is actually just hot bean water. Change my mind. ☕️💀",
    likes: 1200,
    liked: true,
    isHotTake: true,
    commentsCount: 245,
  }
];

const INITIAL_COMMENTS: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1-1',
      postId: '1',
      authorId: 'vikram-a',
      authorName: 'Vikram A.',
      authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUXnEH6lKCl6QUFpBOnBCol61TGevdyhB3nbEyqlVaTugoGuGMl303b0fVqFJjhFfu63S_go__AvgbdT-it_fE-1hAV6bz1rrpLB4XbSx4WM9HoFTPDfVm21YfLOFdHN4y9pCRTgbpjaLzL37L0T4ZqalyT2HVDOGxH6LlhGG3KJ6Z8TY-jHonoYZRYiOfmqIASAvp_7nh_vauzHupg6jruXquZTVbYZWfSYINwK_pw1uFDfJnXYBd',
      text: 'Classic student experience, bro! 💀',
      createdAt: '10m ago'
    },
    {
      id: 'c1-2',
      postId: '1',
      authorId: 'meera-k',
      authorName: 'Meera K.',
      authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8jjI1mgvdtQOgIgy4ITgY16uTSuVwJUFqw6uAVSoyc8WzDlrOC394updzRMMNiVQONA6osROpzMCkkJ0s9TMJaRdRAKZkzoFq8JzgZ_MV1XaS3ZRf_MFSownVoSke29bQ2azYT4xjTzSJY4JGSDWNGchV-hXFrruhzDo9nB9H2hLrisDgun6d4BlWdLotnZMbLZYEZSqhuYGbO4pTsIPmpPcJ4SpA6FodGiyBNSb6GEQWoFfSIuMR',
      text: 'Should have containerized it with Docker!',
      createdAt: '5m ago'
    }
  ],
  '2': [
    {
      id: 'c2-1',
      postId: '2',
      authorId: 'dev-s',
      authorName: 'Dev S.',
      authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkW0-Q-qSQJaUSxnkuhLJGehGfFkZ9-JOsOic33tWYOfZMTgkYAvx4LIj2OSM0ztDn6yJSjc2G2DG7ZdyFlTly-9WQPa9Qr6-Hg_RErCdMbudMDKfcGdA0RDtvCjU8eg4y3mBqmow1_-a8HqrAwnygiE4BtEwop_5YgfGeN7S8zZ0l_sE_ONmcJSwfol8hkREiuSJg_TuW-KK9uAAFAsLUhZC32SFrKSFop69kioUWXBfVeKSYNXBe',
      text: 'I am stuck on it too, let me know if you get it!',
      createdAt: '30m ago'
    }
  ]
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'connection_accept',
    title: 'New Connection',
    message: 'Sarah Chen accepted your connection request.',
    timestamp: '2h ago',
    read: false,
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLsqe0P27_ZN0NGElJkl4B0ZIv-WAk7WGAyvi7A3R4IMk4LVuLhV7nQVmSGCTwyqqkXzMauJjN1L5jhFyqQDAogLl6tzRsFXD75rwOyot6ttAcqBPAMTPnbmFpX-oB8LFpbwajspy5Io93EfwrPOHeXAVWuDojxzDFoZSUf-lWemoEmMW9nEmxwEtwU9wOKYcIGSTjSOiZOhfZpFMDglZtX8pe8UgEcoWzeE83Y21BUXL-rp59fJJfrHSjs',
    link: '/discover'
  },
  {
    id: 'n2',
    type: 'post_like',
    title: 'Post Liked',
    message: 'Rohan Sharma liked your recent post.',
    timestamp: '5h ago',
    read: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb3houXNWLXON9IYsFB6QtYiXNkHjkCtZgQjOfjW8uLVF4Niwp4i7FQSGDFqiwQDy1SkJ6wnl_KaZQeyVIYEIgWzgtdCIO3KRubQofQHdYTiH9bmT1DUkBT1ZSo7i9Wt3hi1_eZgwdtWaDjLD9B5pcZR6pyNtfXLSZ4AWjzxIQr0jnA_oT-e2o7-7jCcd7Zw5dPOTeCYIsbxld6cDb_0KCm5j74eLxB3nZU9DCBmesWH40C4rYiT0O',
    link: '/home'
  }
];

interface AppContextValue extends AppState {
  login: (email?: string, name?: string) => void;
  logout: () => void;
  signup: (name: string, email: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  joinClub: (clubId: string) => void;
  leaveClub: (clubId: string) => void;
  rsvpEvent: (eventId: string) => void;
  cancelRsvp: (eventId: string) => void;
  markInterested: (eventId: string) => void;
  removeInterested: (eventId: string) => void;
  addCollegePost: (collegeId: string, post: Post) => void;
  addClubPost: (clubId: string, post: Post) => void;
  addHomePost: (post: Post) => void;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  addComment: (postId: string, comment: Comment) => void;
  addProject: (project: Project) => void;
  setConnectionStatus: (personId: string, status: ConnectionStatus) => void;
  getClubMemberCount: (clubId: string, baseCount: number) => number;
  updateUserProfile: (updates: Partial<UserProfile>, silent?: boolean) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

// ─────────────────────────────────────────
// Helpers: localStorage persistence
// ─────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`trybee_${key}`);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`trybee_${key}`, JSON.stringify(value));
  } catch {
    // ignore quota errors silently
  }
}

// ─────────────────────────────────────────
// Context
// ─────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => loadFromStorage<boolean>('auth', true) // Default true for demo/MVP smoothness, persisted
  );

  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(
    () => new Set<string>(loadFromStorage<string[]>('joinedClubs', ['ai-ml-hub']))
  );

  const [rsvpdEvents, setRsvpdEvents] = useState<Set<string>>(
    () => new Set<string>(loadFromStorage<string[]>('rsvpdEvents', ['gla-ai-showcase']))
  );

  const [interestedEvents, setInterestedEvents] = useState<Set<string>>(
    () => new Set<string>(loadFromStorage<string[]>('interestedEvents', []))
  );

  const [collegePosts, setCollegePosts] = useState<Record<string, Post[]>>(
    () => loadFromStorage<Record<string, Post[]>>('collegePosts', {})
  );

  const [clubPosts, setClubPosts] = useState<Record<string, Post[]>>(
    () => loadFromStorage<Record<string, Post[]>>('clubPosts', {})
  );

  const [homePosts, setHomePosts] = useState<Post[]>(
    () => loadFromStorage<Post[]>('homePosts', INITIAL_HOME_POSTS)
  );

  const [projects, setProjects] = useState<Project[]>(
    () => {
      const stored = loadFromStorage<Project[]>('projects', []);
      const storedOwn = stored.filter(p => p.isOwn);
      const nonOwn = INITIAL_PROJECTS.filter(p => !p.isOwn);
      const ownFromSeed = INITIAL_PROJECTS.filter(p => p.isOwn);
      const ownProjects = storedOwn.length > 0 ? storedOwn : ownFromSeed;
      return [...ownProjects, ...nonOwn];
    }
  );

  const [comments, setComments] = useState<Record<string, Comment[]>>(
    () => loadFromStorage<Record<string, Comment[]>>('comments', INITIAL_COMMENTS)
  );

  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    () => new Set<string>(loadFromStorage<string[]>('likedPosts', ['3']))
  );

  const [connections, setConnections] = useState<Record<string, ConnectionStatus>>(
    () => loadFromStorage<Record<string, ConnectionStatus>>('connections', {
      'sarah-chen': 'connected',
      'priya-sharma': 'pending'
    })
  );

  const [notifications, setNotifications] = useState<Notification[]>(
    () => loadFromStorage<Notification[]>('notifications', INITIAL_NOTIFICATIONS)
  );

  const [userProfile, setUserProfile] = useState<UserProfile>(
    () => loadFromStorage<UserProfile>('userProfile', DEFAULT_PROFILE)
  );

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // ── Toast Helper ──
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(curr => curr?.id === id ? null : curr);
    }, 3000);
  }, []);

  // ── Persist to localStorage ──
  useEffect(() => {
    saveToStorage('auth', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    saveToStorage('joinedClubs', Array.from(joinedClubs));
  }, [joinedClubs]);

  useEffect(() => {
    saveToStorage('rsvpdEvents', Array.from(rsvpdEvents));
  }, [rsvpdEvents]);

  useEffect(() => {
    saveToStorage('interestedEvents', Array.from(interestedEvents));
  }, [interestedEvents]);

  useEffect(() => {
    saveToStorage('collegePosts', collegePosts);
  }, [collegePosts]);

  useEffect(() => {
    saveToStorage('clubPosts', clubPosts);
  }, [clubPosts]);

  useEffect(() => {
    saveToStorage('homePosts', homePosts);
  }, [homePosts]);

  useEffect(() => {
    const ownProjects = projects.filter(p => p.isOwn);
    saveToStorage('projects', ownProjects);
  }, [projects]);

  useEffect(() => {
    saveToStorage('comments', comments);
  }, [comments]);

  useEffect(() => {
    saveToStorage('likedPosts', Array.from(likedPosts));
  }, [likedPosts]);

  useEffect(() => {
    saveToStorage('connections', connections);
  }, [connections]);

  useEffect(() => {
    saveToStorage('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    saveToStorage('userProfile', userProfile);
  }, [userProfile]);

  // ── Auth Actions ────────────────────────────────────────────

  const login = useCallback((email?: string, name?: string) => {
    setIsAuthenticated(true);
    if (name || email) {
      setUserProfile(prev => ({
        ...prev,
        ...(name ? { name } : {}),
        ...(email ? { username: email.split('@')[0] } : {})
      }));
    }
    showToast(`Welcome back, ${name || userProfile.name}!`);
  }, [showToast, userProfile.name]);

  const signup = useCallback((name: string, email: string) => {
    setIsAuthenticated(true);
    setUserProfile(prev => ({
      ...prev,
      name,
      username: email.split('@')[0] || 'student'
    }));
    showToast(`Account created successfully! Welcome to TRYBE.`);
  }, [showToast]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    showToast('Logged out successfully.', 'info');
  }, [showToast]);

  // ── Club & Event Actions ───────────────────────────────────

  const joinClub = useCallback((clubId: string) => {
    setJoinedClubs(prev => new Set(prev).add(clubId));
    showToast('Joined club successfully!');
  }, [showToast]);

  const leaveClub = useCallback((clubId: string) => {
    setJoinedClubs(prev => {
      const next = new Set(prev);
      next.delete(clubId);
      return next;
    });
    showToast('Left club.', 'info');
  }, [showToast]);

  const rsvpEvent = useCallback((eventId: string) => {
    setRsvpdEvents(prev => new Set(prev).add(eventId));
    showToast('RSVP confirmed! Added to your schedule.');
  }, [showToast]);

  const cancelRsvp = useCallback((eventId: string) => {
    setRsvpdEvents(prev => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });
    showToast('RSVP cancelled.', 'info');
  }, [showToast]);

  const markInterested = useCallback((eventId: string) => {
    setInterestedEvents(prev => new Set(prev).add(eventId));
    showToast('Saved to interested events!');
  }, [showToast]);

  const removeInterested = useCallback((eventId: string) => {
    setInterestedEvents(prev => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });
  }, []);

  // ── Posts Actions ──────────────────────────────────────────

  const addCollegePost = useCallback((collegeId: string, post: Post) => {
    setCollegePosts(prev => ({
      ...prev,
      [collegeId]: [post, ...(prev[collegeId] ?? [])],
    }));
    showToast('Post published to college feed!');
  }, [showToast]);

  const addClubPost = useCallback((clubId: string, post: Post) => {
    setClubPosts(prev => ({
      ...prev,
      [clubId]: [post, ...(prev[clubId] ?? [])],
    }));
    showToast('Post published to club feed!');
  }, [showToast]);

  const addHomePost = useCallback((post: Post) => {
    setHomePosts(prev => [post, ...prev]);
    showToast('Post created successfully!');
  }, [showToast]);

  const likePost = useCallback((postId: string) => {
    setLikedPosts(prev => {
      if (prev.has(postId)) return prev; // Idempotent check
      return new Set(prev).add(postId);
    });

    setHomePosts(prev => prev.map(p =>
      p.id === postId && !p.liked ? { ...p, likes: p.likes + 1, liked: true } : p
    ));

    setCollegePosts(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].map(p =>
          p.id === postId && !p.liked ? { ...p, likes: p.likes + 1, liked: true } : p
        );
      }
      return next;
    });

    setClubPosts(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].map(p =>
          p.id === postId && !p.liked ? { ...p, likes: p.likes + 1, liked: true } : p
        );
      }
      return next;
    });
  }, []);

  const unlikePost = useCallback((postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });

    setHomePosts(prev => prev.map(p =>
      p.id === postId && p.liked ? { ...p, likes: Math.max(0, p.likes - 1), liked: false } : p
    ));

    setCollegePosts(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].map(p =>
          p.id === postId && p.liked ? { ...p, likes: Math.max(0, p.likes - 1), liked: false } : p
        );
      }
      return next;
    });

    setClubPosts(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].map(p =>
          p.id === postId && p.liked ? { ...p, likes: Math.max(0, p.likes - 1), liked: false } : p
        );
      }
      return next;
    });
  }, []);

  const addComment = useCallback((postId: string, comment: Comment) => {
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), comment],
    }));

    setHomePosts(prev => prev.map(p =>
      p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
    ));

    setCollegePosts(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].map(p =>
          p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
        );
      }
      return next;
    });

    setClubPosts(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].map(p =>
          p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
        );
      }
      return next;
    });

    showToast('Comment added!');
  }, [showToast]);

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [project, ...prev]);
    showToast('Project posted successfully!');
  }, [showToast]);

  // ── Connection Actions ──────────────────────────────────────

  const setConnectionStatus = useCallback((personId: string, status: ConnectionStatus) => {
    setConnections(prev => ({ ...prev, [personId]: status }));
    if (status === 'pending') {
      showToast('Connection request sent!');
    } else if (status === 'connected') {
      showToast('Connected successfully!');
    } else if (status === 'none') {
      showToast('Connection removed.', 'info');
    }
  }, [showToast]);

  const getClubMemberCount = useCallback(
    (clubId: string, baseCount: number): number => {
      return joinedClubs.has(clubId) ? baseCount + 1 : baseCount;
    },
    [joinedClubs]
  );

  const updateUserProfile = useCallback((updates: Partial<UserProfile>, silent = false) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    if (!silent) {
      showToast('Profile updated successfully!');
    }
  }, [showToast]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: AppContextValue = {
    isAuthenticated,
    login,
    logout,
    signup,
    showToast,
    toast,
    joinedClubs,
    rsvpdEvents,
    interestedEvents,
    collegePosts,
    clubPosts,
    homePosts,
    projects,
    comments,
    likedPosts,
    connections,
    notifications,
    userProfile,
    joinClub,
    leaveClub,
    rsvpEvent,
    cancelRsvp,
    markInterested,
    removeInterested,
    addCollegePost,
    addClubPost,
    addHomePost,
    likePost,
    unlikePost,
    addComment,
    addProject,
    setConnectionStatus,
    getClubMemberCount,
    updateUserProfile,
    markNotificationRead,
    clearNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
