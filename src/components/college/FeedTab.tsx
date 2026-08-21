import { useState, useRef, type FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import type { Post, Comment } from '../../data/types';

const COLLEGE_ID = 'gla-university';
const CURRENT_USER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuALGkZg4umnZu-tLOdOYdz0Vnj_OQIO0WmriQJX0_RE30b2Y4w--HOkOne1Y1BmYb3ihB2ex_VUfC0uiboeT3w4POkPSKt3FRyzPQmvGv7ZDPohfY6-KmdOv01SmAeZTvw2vowFicPX7KG_RnaFOhlQEOdu8ArQUo7SUNZGSiX0CsDimvZRnhOkEyJUSZl2Ol5TjPXtrAqbB7Ja_InLmdqZ9j8D3OonDOzHTNLO-8Y5pAdykQ0WGs2z';

// Seed posts that always show until user creates their own
const SEED_POSTS: Post[] = [
  {
    id: 'seed-gla-1',
    authorId: 'gla-admin',
    authorName: 'GLA Administration',
    authorAvatar: '',
    authorMajor: 'Official',
    collegeId: COLLEGE_ID,
    content:
      'Mid-semester examinations for all B.Tech programs will commence from October 15th. Please check the university portal for detailed date sheets and seating arrangements. Library hours extended until midnight.',
    tag: 'Academics',
    likes: 245,
    liked: false,
    commentsCount: 32,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-gla-2',
    authorId: 'priya-sharma',
    authorName: 'Priya Sharma',
    authorAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBzSrOPjCm9XqfTTHYXSZpe3BbQs-Jm3dHw_yMaDagkljza4jaOWYta1XqeXWCYMn49nCsLRt_ImjXFAJCSOHd9-j86P01mGNfASwaYKBRItPlBgr3PDBIZZmC62RlE17MrNhDjBzvkrEfDba8cee9INw9Py_3p_gsOpi_boQEr_w2ZVOsQEH_2tRc4tpUU-zaaeUwHwlZMoWXg8zvEWf2slbdt49Q6C3gUdC4Ll8QWjdWKHQlb3jqx',
    authorMajor: 'B.Tech CS',
    collegeId: COLLEGE_ID,
    content:
      'Hey everyone, I left my matte black boAt headphones in Academic Block 3, Room 302 after the OS lecture today. If anyone found them, please let me know. Coffee is on me! ☕️',
    tag: 'Lost & Found',
    likes: 12,
    liked: false,
    commentsCount: 4,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function FeedTab() {
  const { collegePosts, addCollegePost, likePost, unlikePost, likedPosts, addComment, comments, userProfile, showToast } =
    useApp();

  const userPosts = collegePosts[COLLEGE_ID] ?? [];
  const allPosts: Post[] = [...userPosts, ...SEED_POSTS];

  const [postText, setPostText] = useState('');
  const [postTag, setPostTag] = useState('Campus Update');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleCreatePost = (e: FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) {
      setPostError('Post content cannot be empty.');
      inputRef.current?.focus();
      return;
    }
    setPostError('');
    setIsSubmitting(true);

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: userProfile.username,
      authorName: userProfile.name,
      authorAvatar: userProfile.avatar,
      authorMajor: userProfile.college,
      collegeId: COLLEGE_ID,
      content: postText.trim(),
      tag: postTag,
      likes: 0,
      liked: false,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Simulate slight async delay
    setTimeout(() => {
      addCollegePost(COLLEGE_ID, newPost);
      setPostText('');
      setIsSubmitting(false);
    }, 200);
  };

  const handleLike = (post: Post) => {
    if (likedPosts.has(post.id)) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      authorId: 'current-user',
      authorName: 'Alex (You)',
      authorAvatar: CURRENT_USER_AVATAR,
      text,
      createdAt: new Date().toISOString(),
    };

    addComment(postId, comment);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="flex-1 flex flex-col gap-lg max-w-[700px]">
      {/* Create Post */}
      <form
        onSubmit={handleCreatePost}
        className="bg-surface rounded-xl border border-outline-variant p-md flex flex-col gap-md"
      >
        <div className="flex gap-md items-start">
          <img
            alt="You"
            className="w-10 h-10 rounded-full object-cover border border-outline-variant shrink-0"
            src={CURRENT_USER_AVATAR}
          />
          <textarea
            ref={inputRef}
            value={postText}
            onChange={e => {
              setPostText(e.target.value);
              if (postError) setPostError('');
            }}
            className="flex-1 bg-transparent border-none resize-none text-body-md text-on-surface placeholder:text-on-surface-variant focus:ring-0 focus:outline-none min-h-[60px]"
            placeholder="Share campus news or updates..."
            rows={2}
          />
          <button
            onClick={() => showToast('Image upload feature coming soon! You can post text updates.', 'info')}
            className="p-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            type="button"
            aria-label="Add image"
          >
            <span className="material-symbols-outlined" aria-hidden="true">image</span>
          </button>
        </div>

        {postError && (
          <p className="text-error font-label-sm text-[12px] ml-14">{postError}</p>
        )}

        <div className="flex items-center justify-between border-t border-outline-variant/50 pt-sm">
          <select
            value={postTag}
            onChange={e => setPostTag(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded-full px-md py-xs font-label-sm text-label-sm text-on-surface focus:outline-none focus:border-primary"
          >
            <option>Campus Update</option>
            <option>Academics</option>
            <option>Events</option>
            <option>Lost & Found</option>
            <option>Announcement</option>
            <option>Question</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting || !postText.trim()}
            className="bg-primary text-on-primary px-lg py-xs rounded-full font-label-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-xs cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin" aria-hidden="true">progress_activity</span>
                Posting...
              </>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </form>

      {/* Posts feed */}
      {allPosts.map(post => {
        const isLiked = likedPosts.has(post.id) || post.liked;
        const postComments = comments[post.id] ?? [];
        const showComments = expandedComments.has(post.id);
        const likeCount = post.likes;

        return (
          <article
            key={post.id}
            className="bg-surface rounded-xl border border-outline-variant p-md flex flex-col gap-md"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-sm">
                {post.authorAvatar ? (
                  <img
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full border border-outline-variant object-cover shrink-0"
                    src={post.authorAvatar}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-surface" aria-hidden="true">campaign</span>
                  </div>
                )}
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface">{post.authorName}</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {post.authorMajor} • {timeAgo(post.createdAt)}
                  </p>
                </div>
              </div>
              <span className="px-sm py-base bg-surface-container-high rounded-full font-label-sm text-label-sm text-on-surface-variant border border-outline-variant">
                #{post.tag}
              </span>
            </div>

            <p className="font-body-md text-body-md text-on-surface">{post.content}</p>

            <div className="h-px w-full bg-outline-variant" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-lg">
                <button
                  onClick={() => handleLike(post)}
                  className={`flex items-center gap-base transition-colors group cursor-pointer ${
                    isLiked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span
                    className="material-symbols-outlined group-hover:scale-110 transition-transform"
                    style={{ fontVariationSettings: isLiked ? '"FILL" 1' : '"FILL" 0' }}
                    aria-hidden="true"
                  >
                    favorite
                  </span>
                  <span className="font-label-md text-label-md">{likeCount}</span>
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-base text-on-surface-variant hover:text-on-surface transition-colors group cursor-pointer"
                >
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform" aria-hidden="true">comment</span>
                  <span className="font-label-md text-label-md">
                    {post.commentsCount + postComments.length}
                  </span>
                </button>
              </div>
              <button
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(`${window.location.origin}/college#post-${post.id}`);
                  } catch {}
                  showToast('Post link copied to clipboard!');
                }}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                aria-label="Share post"
              >
                <span className="material-symbols-outlined" aria-hidden="true">share</span>
              </button>
            </div>

            {/* Comments */}
            {showComments && (
              <div className="flex flex-col gap-sm border-t border-outline-variant/30 pt-md">
                {postComments.map(comment => (
                  <div
                    key={comment.id}
                    className="flex gap-sm items-start bg-surface-container-low/50 p-sm rounded-lg border border-outline-variant/20"
                  >
                    <img
                      className="w-7 h-7 rounded-full object-cover border border-outline-variant shrink-0"
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-xs">
                        <span className="font-label-sm text-on-surface font-semibold">{comment.authorName}</span>
                        <span className="text-[10px] text-on-surface-variant">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-sm items-center mt-xs">
                  <img
                    className="w-7 h-7 rounded-full object-cover border border-outline-variant shrink-0"
                    src={CURRENT_USER_AVATAR}
                    alt="You"
                  />
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentInputs[post.id] ?? ''}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddComment(post.id);
                    }}
                    className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-md py-xs text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="bg-primary-container text-on-primary-container px-md py-xs rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}

      {allPosts.length === 0 && (
        <div className="text-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-4 block">dynamic_feed</span>
          <p className="font-body-md">No posts yet. Be the first to share!</p>
        </div>
      )}
    </div>
  );
}
