import { useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getClubById } from '../data/clubs';
import { getEventsByClub } from '../data/events';
import { useApp } from '../context/AppContext';
import type { Post, Comment } from '../data/types';

const CURRENT_USER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuALGkZg4umnZu-tLOdOYdz0Vnj_OQIO0WmriQJX0_RE30b2Y4w--HOkOne1Y1BmYb3ihB2ex_VUfC0uiboeT3w4POkPSKt3FRyzPQmvGv7ZDPohfY6-KmdOv01SmAeZTvw2vowFicPX7KG_RnaFOhlQEOdu8ArQUo7SUNZGSiX0CsDimvZRnhOkEyJUSZl2Ol5TjPXtrAqbB7Ja_InLmdqZ9j8D3OonDOzHTNLO-8Y5pAdykQ0WGs2z';

type Tab = 'feed' | 'discussions' | 'members' | 'events' | 'resources';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ClubDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const club = getClubById(id ?? '');

  if (!club) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-md text-on-surface-variant p-xl">
        <span className="material-symbols-outlined text-5xl">group_off</span>
        <h2 className="font-headline-md text-on-surface">Club not found</h2>
        <p className="font-body-md">The club &ldquo;{id}&rdquo; does not exist.</p>
        <button
          onClick={() => navigate('/clubs')}
          className="mt-md px-lg py-sm bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-colors"
        >
          Back to Clubs
        </button>
      </div>
    );
  }

  const {
    joinedClubs,
    joinClub,
    leaveClub,
    getClubMemberCount,
    clubPosts,
    addClubPost,
    likePost,
    unlikePost,
    likedPosts,
    addComment,
    comments,
    rsvpdEvents,
    interestedEvents,
    rsvpEvent,
    cancelRsvp,
    markInterested,
    removeInterested,
  } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const joined = joinedClubs.has(club.id);
  const memberCount = getClubMemberCount(club.id, club.members);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-margin-mobile md:p-margin-desktop">
        {/* Club Header */}
        <div className="bg-surface rounded-xl border border-outline-variant mb-lg overflow-hidden">
          <div className="h-32 bg-secondary-container/20" />
          <div className="p-lg flex flex-col md:flex-row items-start md:items-end justify-between gap-md relative -mt-16">
            <div className="flex items-end gap-md">
              <div className="w-24 h-24 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-primary text-4xl">{club.icon}</span>
              </div>
              <div className="mb-xs">
                <h1 className="font-headline-lg text-on-surface flex items-center gap-xs">
                  {club.title}
                  <span
                    className="material-symbols-outlined text-primary text-xl"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    verified
                  </span>
                </h1>
                <p className="text-body-sm text-on-surface-variant">
                  {club.category} • {memberCount.toLocaleString()} members • {club.college}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <Link
                to={`/college/${club.collegeId}`}
                className="px-md py-sm bg-surface-container border border-outline-variant rounded-lg text-on-surface font-label-md hover:bg-surface-container-high transition-colors text-sm"
              >
                View College
              </Link>
              <button
                onClick={() => (joined ? leaveClub(club.id) : joinClub(club.id))}
                className={`px-md py-sm rounded-lg font-label-md transition-all flex items-center gap-xs ${
                  joined
                    ? 'bg-surface-container-high border border-outline-variant text-on-surface hover:bg-error-container hover:text-on-error-container'
                    : 'bg-primary text-on-primary hover:opacity-90'
                }`}
              >
                {joined ? (
                  <>
                    Joined <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </>
                ) : (
                  'Join Club'
                )}
              </button>
            </div>
          </div>
          <div className="border-t border-outline-variant px-lg flex overflow-x-auto">
            {(['feed', 'discussions', 'members', 'events', 'resources'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-md py-sm font-label-md whitespace-nowrap capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-8 flex flex-col gap-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'feed' && (
                  <ClubFeedTab
                    clubId={club.id}
                    posts={clubPosts[club.id] ?? []}
                    onAddPost={post => addClubPost(club.id, post)}
                    onLike={likePost}
                    onUnlike={unlikePost}
                    likedPosts={likedPosts}
                    comments={comments}
                    onAddComment={addComment}
                  />
                )}
                {activeTab === 'discussions' && <ClubDiscussionsTab clubTitle={club.title} />}
                {activeTab === 'members' && (
                  <ClubMembersTab club={club} memberCount={memberCount} />
                )}
                {activeTab === 'events' && (
                  <ClubEventsTab
                    clubId={club.id}
                    rsvpdEvents={rsvpdEvents}
                    interestedEvents={interestedEvents}
                    onRsvp={rsvpEvent}
                    onCancelRsvp={cancelRsvp}
                    onInterested={markInterested}
                    onRemoveInterested={removeInterested}
                  />
                )}
                {activeTab === 'resources' && <ClubResourcesTab clubTitle={club.title} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-lg lg:col-span-4 sticky top-24">
            <div className="bg-surface rounded-xl border border-outline-variant p-md flex flex-col gap-md">
              <h3 className="font-headline-sm font-semibold text-on-surface">About</h3>
              <p className="text-body-sm text-on-surface-variant">
                {club.about ?? club.description}
              </p>
              <div className="flex flex-wrap gap-xs">
                {club.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-sm py-xs rounded-full bg-surface-container-high text-on-surface font-label-sm text-[11px] border border-outline-variant"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-surface rounded-xl border border-outline-variant p-md">
              <h3 className="font-headline-sm font-semibold text-on-surface mb-md">Stats</h3>
              <div className="flex gap-lg">
                <div className="flex flex-col items-center">
                  <span className="font-headline-md text-primary">{memberCount.toLocaleString()}</span>
                  <span className="font-label-sm text-on-surface-variant text-[11px]">Members</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-headline-md text-primary">{getEventsByClub(club.id).length}</span>
                  <span className="font-label-sm text-on-surface-variant text-[11px]">Events</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ── Club Feed Tab ──────────────────────────────────────────────

interface ClubFeedTabProps {
  clubId: string;
  posts: Post[];
  onAddPost: (post: Post) => void;
  onLike: (id: string) => void;
  onUnlike: (id: string) => void;
  likedPosts: Set<string>;
  comments: Record<string, Comment[]>;
  onAddComment: (postId: string, comment: Comment) => void;
}

function ClubFeedTab({ clubId, posts, onAddPost, onLike, onUnlike, likedPosts, comments, onAddComment }: ClubFeedTabProps) {
  const { userProfile } = useApp();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const handlePost = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setPostError('Post cannot be empty.');
      return;
    }
    setPostError('');
    setIsSubmitting(true);
    setTimeout(() => {
      onAddPost({
        id: `club-post-${Date.now()}`,
        authorId: 'current-user',
        authorName: userProfile.name,
        authorAvatar: userProfile.avatar,
        authorMajor: userProfile.college,
        clubId,
        content: text.trim(),
        tag: 'Update',
        likes: 0,
        liked: false,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
      });
      setText('');
      setIsSubmitting(false);
    }, 200);
  };

  const handleAddComment = (postId: string) => {
    const t = commentInputs[postId]?.trim();
    if (!t) return;
    onAddComment(postId, {
      id: `comment-${Date.now()}`,
      postId,
      authorId: 'current-user',
      authorName: userProfile.name,
      authorAvatar: userProfile.avatar,
      text: t,
      createdAt: new Date().toISOString(),
    });
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="flex flex-col gap-lg">
      <form onSubmit={handlePost} className="bg-surface rounded-xl border border-outline-variant p-md flex flex-col gap-md">
        <div className="flex gap-md items-center">
          <img className="w-10 h-10 rounded-full object-cover border border-outline-variant shrink-0" src={userProfile.avatar} alt={userProfile.name} />
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setPostError(''); }}
            className="flex-1 bg-surface-container-low rounded-lg border border-outline-variant flex items-center px-md py-sm cursor-pointer font-body-sm text-on-surface placeholder:text-on-surface-variant hover:border-primary-container resize-none focus:outline-none focus:border-primary min-h-[48px]"
            placeholder="Share an update..."
            rows={2}
          />
        </div>
        {postError && <p className="text-error font-label-sm text-[12px]">{postError}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="bg-primary text-on-primary px-lg py-xs rounded-full font-label-md hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-4 block">dynamic_feed</span>
          <p className="font-body-md">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        posts.map(post => {
          const isLiked = likedPosts.has(post.id);
          const postComments = comments[post.id] ?? [];
          const showComments = expandedComments.has(post.id);
          return (
            <article key={post.id} className="bg-surface rounded-xl border border-outline-variant p-md flex flex-col gap-md">
              <div className="flex items-center gap-sm">
                <img className="w-9 h-9 rounded-full object-cover border border-outline-variant" src={post.authorAvatar} alt={post.authorName} />
                <div>
                  <span className="font-label-md text-on-surface">{post.authorName}</span>
                  <p className="font-label-sm text-on-surface-variant">{timeAgo(post.createdAt)}</p>
                </div>
              </div>
              <p className="font-body-md text-on-surface">{post.content}</p>
              <div className="flex items-center gap-lg pt-sm border-t border-outline-variant/50 text-on-surface-variant">
                <button
                  onClick={() => (isLiked ? onUnlike(post.id) : onLike(post.id))}
                  className={`flex items-center gap-xs transition-colors ${isLiked ? 'text-primary' : 'hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? '"FILL" 1' : '"FILL" 0' }}>favorite</span>
                  <span className="font-label-md">{post.likes}</span>
                </button>
                <button
                  onClick={() => setExpandedComments(prev => { const n = new Set(prev); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n; })}
                  className="flex items-center gap-xs hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">chat_bubble</span>
                  <span className="font-label-md">{post.commentsCount + postComments.length}</span>
                </button>
              </div>
              {showComments && (
                <div className="flex flex-col gap-sm border-t border-outline-variant/30 pt-md">
                  {postComments.map(c => (
                    <div key={c.id} className="flex gap-sm bg-surface-container-low/50 p-sm rounded-lg border border-outline-variant/20">
                      <img className="w-7 h-7 rounded-full object-cover" src={c.authorAvatar} alt={c.authorName} />
                      <div>
                        <span className="font-label-sm text-on-surface font-semibold">{c.authorName}</span>
                        <p className="text-body-sm text-on-surface-variant">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-sm mt-xs">
                    <img className="w-7 h-7 rounded-full object-cover" src={userProfile.avatar} alt={userProfile.name} />
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInputs[post.id] ?? ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                      className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-md py-xs text-body-sm focus:outline-none focus:border-primary"
                    />
                    <button onClick={() => handleAddComment(post.id)} className="bg-primary-container text-on-primary-container px-md py-xs rounded-lg font-label-sm">Reply</button>
                  </div>
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}

// ── Club Discussions Tab ───────────────────────────────────────

function ClubDiscussionsTab({ clubTitle }: { clubTitle: string }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', author: 'Sarah Chen', text: `Welcome to ${clubTitle}! Excited to collaborate with everyone.`, time: '2h ago' },
    { id: '2', author: 'Mike Ross', text: 'Great to be here! When is the next meeting?', time: '1h ago' },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), author: 'Alex (You)', text: message.trim(), time: 'Just now' },
    ]);
    setMessage('');
  };

  return (
    <div className="flex overflow-hidden border border-outline-variant rounded-xl h-[500px]">
      <div className="flex-1 flex flex-col bg-surface">
        <div className="flex-1 overflow-y-auto p-md flex flex-col gap-md">
          {messages.map(msg => (
            <div key={msg.id} className="flex gap-md">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 border border-outline-variant">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
              </div>
              <div>
                <div className="flex items-center gap-sm mb-xs">
                  <span className="font-label-md text-on-surface">{msg.author}</span>
                  <span className="text-label-sm text-on-surface-variant">{msg.time}</span>
                </div>
                <p className="text-body-md text-on-surface-variant">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-md border-t border-outline-variant">
          <div className="bg-surface-container-high rounded-xl border border-outline-variant p-sm flex items-center gap-sm">
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant font-body-md outline-none px-sm"
              placeholder={`Message ${clubTitle}...`}
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} className="text-primary hover:text-primary-fixed transition-colors">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Club Members Tab ───────────────────────────────────────────

function ClubMembersTab({ club, memberCount }: { club: NonNullable<ReturnType<typeof getClubById>>; memberCount: number }) {
  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h2 className="text-headline-md text-on-surface mb-md">Leadership</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {club.president && (
            <div className="bg-surface border border-outline-variant rounded-xl p-lg flex items-center gap-lg">
              <div className="w-16 h-16 rounded-full border-2 border-primary bg-surface-container-high flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-2xl">person</span>
              </div>
              <div>
                <span className="text-primary font-label-sm uppercase tracking-wide">President</span>
                <h3 className="text-headline-sm font-bold text-on-surface">{club.president}</h3>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <p className="text-on-surface-variant font-body-sm">
          {memberCount.toLocaleString()} total members in {club.title}. Join to connect with them.
        </p>
      </div>
    </div>
  );
}

// ── Club Events Tab ────────────────────────────────────────────

interface ClubEventsTabProps {
  clubId: string;
  rsvpdEvents: Set<string>;
  interestedEvents: Set<string>;
  onRsvp: (id: string) => void;
  onCancelRsvp: (id: string) => void;
  onInterested: (id: string) => void;
  onRemoveInterested: (id: string) => void;
}

function ClubEventsTab({ clubId, rsvpdEvents, interestedEvents, onRsvp, onCancelRsvp, onInterested, onRemoveInterested }: ClubEventsTabProps) {
  const events = getEventsByClub(clubId);

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-4 block">event_busy</span>
        <p className="font-body-md">No events scheduled for this club yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      {events.map(event => (
        <div key={event.id} className="bg-surface border border-outline-variant rounded-xl p-md flex flex-col gap-md">
          {event.image && (
            <div className="h-40 rounded-lg overflow-hidden">
              <img alt={event.title} className="w-full h-full object-cover" src={event.image} />
            </div>
          )}
          <div>
            <h3 className="font-label-md text-on-surface">{event.title}</h3>
            <p className="font-body-sm text-on-surface-variant mt-xs">
              {event.date}, {event.time} • {event.location}
            </p>
            <p className="font-body-sm text-on-surface-variant mt-sm">{event.description}</p>
          </div>
          <div className="flex gap-sm">
            <button
              onClick={() => (rsvpdEvents.has(event.id) ? onCancelRsvp(event.id) : onRsvp(event.id))}
              className={`flex-1 py-sm border rounded-lg font-label-md transition-colors ${
                rsvpdEvents.has(event.id)
                  ? 'bg-primary text-on-primary border-primary'
                  : 'border-outline-variant text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {rsvpdEvents.has(event.id) ? "RSVP'd ✓" : 'RSVP'}
            </button>
            <button
              onClick={() => (interestedEvents.has(event.id) ? onRemoveInterested(event.id) : onInterested(event.id))}
              className={`flex-1 py-sm border rounded-lg font-label-md transition-colors ${
                interestedEvents.has(event.id)
                  ? 'bg-primary-container text-on-primary-container border-primary-container'
                  : 'border-outline-variant text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {interestedEvents.has(event.id) ? 'Interested ✓' : 'Interested'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Club Resources Tab ─────────────────────────────────────────

function ClubResourcesTab({ clubTitle }: { clubTitle: string }) {
  return (
    <div className="flex flex-col gap-md">
      <div className="bg-surface border border-outline-variant rounded-xl p-md flex items-center gap-md hover:border-primary-container transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">description</span>
        </div>
        <div className="flex-1">
          <h3 className="font-label-md text-on-surface group-hover:text-primary transition-colors">
            {clubTitle} — Onboarding Guide
          </h3>
          <p className="font-body-sm text-on-surface-variant">PDF • 1.2 MB</p>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant">download</span>
      </div>
      <div className="bg-surface border border-outline-variant rounded-xl p-md flex items-center gap-md hover:border-primary-container transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">link</span>
        </div>
        <div className="flex-1">
          <h3 className="font-label-md text-on-surface group-hover:text-primary transition-colors">
            Shared Drive — Meeting Notes
          </h3>
          <p className="font-body-sm text-on-surface-variant">Google Drive link</p>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant">open_in_new</span>
      </div>
      <p className="text-center text-on-surface-variant font-body-sm py-4">
        More resources will be added by club admins.
      </p>
    </div>
  );
}
