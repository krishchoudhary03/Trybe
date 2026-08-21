import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Post, PostCategory } from '../data/types';

type PostMode = 'gossip' | 'meme' | 'question' | 'photo' | 'general';

export default function HomeFeed() {
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    userProfile, 
    homePosts, 
    addHomePost, 
    likePost, 
    unlikePost, 
    likedPosts, 
    comments, 
    addComment,
    showToast 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('All');
  const [newPostText, setNewPostText] = useState('');
  const [postMode, setPostMode] = useState<PostMode>('gossip');
  const [attachedImage, setAttachedImage] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (location.hash === '#create-post' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [location]);

  const getPlaceholder = () => {
    switch (postMode) {
      case 'meme':
        return "Share a funny meme or image link...";
      case 'question':
        return "What is your question or issue?";
      case 'photo':
        return "Describe the photo you are sharing...";
      case 'general':
        return "Share an update with your campus...";
      case 'gossip':
      default:
        return `What's on your mind, ${userProfile.name.split(' ')[0]}?`;
    }
  };

  const handleCreatePost = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!newPostText.trim() && !attachedImage) return;

    let tag = 'Campus Gossip';
    let category: PostCategory = 'Campus Gossip';
    if (postMode === 'meme') { tag = 'Memes'; category = 'Memes'; }
    else if (postMode === 'question') { tag = 'Ask Help'; category = 'Ask Help'; }
    else if (postMode === 'photo') { tag = 'Photos'; category = 'Photos'; }
    else if (postMode === 'general') { tag = 'General'; category = 'General'; }

    const newPost: Post = {
      id: Date.now().toString(),
      authorId: userProfile.username,
      authorName: userProfile.name,
      authorAvatar: userProfile.avatar,
      authorMajor: userProfile.skills[0] ? `${userProfile.skills[0]} Student` : 'CS Student',
      createdAt: 'Just now',
      tag: tag,
      category: category,
      content: newPostText,
      image: attachedImage ? attachedImage : undefined,
      likes: 0,
      liked: false,
      commentsCount: 0,
    };

    addHomePost(newPost);
    setNewPostText('');
    setAttachedImage('');
    setPostMode('gossip');
  };

  const handleLikeToggle = (postId: string) => {
    if (likedPosts.has(postId)) {
      unlikePost(postId);
    } else {
      likePost(postId);
    }
  };

  const handleToggleComments = (id: string) => {
    setOpenComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCommentSubmit = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    addComment(postId, {
      id: Date.now().toString(),
      postId,
      authorId: 'current-user',
      authorName: userProfile.name,
      authorAvatar: userProfile.avatar,
      text,
      createdAt: 'Just now',
    });

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const togglePostMode = (mode: PostMode) => {
    setPostMode(current => current === mode ? 'gossip' : mode);
    setAttachedImage('');
  };

  const filteredPosts = activeFilter === 'All' 
    ? homePosts 
    : homePosts.filter(post => post.tag.toLowerCase().includes(activeFilter.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim().toLowerCase()));

  return (
    <div className="flex justify-center p-margin-mobile md:p-margin-desktop gap-xl w-full">
      <div className="w-full max-w-2xl flex flex-col gap-xl">
        
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline-md font-headline-md text-on-surface">Good day, {userProfile.name.split(' ')[0]} 👋</h1>
            <p className="text-body-sm text-on-surface-variant">Here's what's happening on campus today.</p>
          </div>
        </div>

        {/* Create Post Card */}
        <form onSubmit={handleCreatePost} className="bg-surface border border-outline-variant rounded-xl p-md flex flex-col gap-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="flex gap-md items-start">
            <img className="w-12 h-12 rounded-full object-cover border border-outline-variant shrink-0" alt={userProfile.name} src={userProfile.avatar} />
            <div className="flex-1 flex flex-col gap-sm">
              <input 
                ref={inputRef}
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                className="w-full bg-transparent border-none text-body-lg text-on-surface placeholder:text-on-surface-variant focus:ring-0 p-0 focus:outline-none" 
                placeholder={getPlaceholder()} 
                type="text" 
              />
              
              {(postMode === 'photo' || postMode === 'meme') && (
                <div className="flex flex-col gap-xs mt-xs">
                  <div className="flex gap-xs items-center">
                    <input 
                      type="text" 
                      placeholder="Paste image URL here..." 
                      value={attachedImage} 
                      onChange={(e) => setAttachedImage(e.target.value)} 
                      className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-md py-xs text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    />
                    <button 
                      type="button"
                      onClick={() => setAttachedImage('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80')}
                      className="text-primary text-label-sm font-semibold hover:underline shrink-0 bg-surface-container-high px-sm py-xs rounded-lg cursor-pointer"
                    >
                      Sample Image
                    </button>
                  </div>
                  {attachedImage && (
                    <div className="relative w-28 h-20 rounded overflow-hidden border border-outline-variant mt-xs">
                      <img src={attachedImage} className="w-full h-full object-cover" alt="Attached preview" />
                      <button 
                        type="button" 
                        onClick={() => setAttachedImage('')}
                        className="absolute top-1 right-1 bg-background/80 hover:bg-background text-on-surface rounded-full p-[2px] flex items-center justify-center cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-sm border-t border-outline-variant/50">
            <div className="flex gap-xs sm:gap-sm text-on-surface-variant flex-wrap">
              <button 
                type="button" 
                onClick={() => togglePostMode('gossip')}
                className={`flex items-center gap-xs px-sm py-xs rounded-full transition-colors text-label-sm cursor-pointer ${postMode === 'gossip' ? 'bg-[#C85C68]/20 text-[#ffb2b9] border border-[#C85C68]/30 font-bold' : 'hover:bg-surface-container-high hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[18px]">forum</span>
                <span className="hidden sm:inline">Gossip</span>
              </button>

              <button 
                type="button" 
                onClick={() => togglePostMode('meme')}
                className={`flex items-center gap-xs px-sm py-xs rounded-full transition-colors text-label-sm cursor-pointer ${postMode === 'meme' ? 'bg-[#C85C68]/20 text-[#ffb2b9] border border-[#C85C68]/30 font-bold' : 'hover:bg-surface-container-high hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[18px]">mood</span>
                <span className="hidden sm:inline">Meme</span>
              </button>

              <button 
                type="button" 
                onClick={() => togglePostMode('question')}
                className={`flex items-center gap-xs px-sm py-xs rounded-full transition-colors text-label-sm cursor-pointer ${postMode === 'question' ? 'bg-[#C85C68]/20 text-[#ffb2b9] border border-[#C85C68]/30 font-bold' : 'hover:bg-surface-container-high hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[18px]">quiz</span>
                <span className="hidden sm:inline">Ask Help</span>
              </button>

              <button 
                type="button" 
                onClick={() => togglePostMode('photo')}
                className={`flex items-center gap-xs px-sm py-xs rounded-full transition-colors text-label-sm cursor-pointer ${postMode === 'photo' ? 'bg-[#C85C68]/20 text-[#ffb2b9] border border-[#C85C68]/30 font-bold' : 'hover:bg-surface-container-high hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                <span className="hidden sm:inline">Photo</span>
              </button>
            </div>
            <button type="submit" className="bg-primary-container text-on-primary-container px-lg py-xs rounded-full font-label-md hover:bg-primary hover:text-on-primary transition-all glow-accent cursor-pointer">Post</button>
          </div>
        </form>

        {/* Filters Scrollable list */}
        <div className="flex items-center gap-sm overflow-x-auto scrollbar-hide pb-sm mb-xs">
          {[
            { label: 'All', emoji: '' },
            { label: 'Campus Gossip', emoji: '🏫' },
            { label: 'Memes', emoji: '😂' },
            { label: 'Hot Takes', emoji: '🔥' },
            { label: 'Ask Help', emoji: '❓' },
            { label: 'Team Finding', emoji: '🤝' },
            { label: 'Photos', emoji: '📸' }
          ].map((filter) => (
            <button 
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              className={`whitespace-nowrap px-lg py-xs rounded-full font-label-md border transition-all active:scale-95 cursor-pointer ${
                activeFilter === filter.label 
                  ? 'bg-primary-container text-on-primary-container border-primary/30' 
                  : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-highest hover:text-on-surface'
              }`}
            >
              {filter.emoji ? `${filter.emoji} ` : ''}{filter.label}
            </button>
          ))}
        </div>

        {/* Posts Feed list */}
        <div className="flex flex-col gap-lg">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant border border-outline-variant border-dashed rounded-xl">
              <span className="material-symbols-outlined text-4xl mb-2 block">dynamic_feed</span>
              <p className="font-body-md">No posts found in this category.</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isLiked = likedPosts.has(post.id) || post.liked;
              const postComments = comments[post.id] || [];
              const isCommentsOpen = !!openComments[post.id];

              return (
                <article 
                  key={post.id} 
                  className={`bg-surface border border-outline-variant rounded-xl p-md flex flex-col gap-md transition-all duration-300 ${post.isHotTake ? 'glow-accent' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-sm items-center">
                      <img className="w-10 h-10 rounded-full object-cover border border-outline-variant shrink-0" src={post.authorAvatar} alt={post.authorName} />
                      <div>
                        <h3 className="font-label-md text-on-surface">{post.authorName}</h3>
                        <p className="font-label-sm text-on-surface-variant">{post.authorMajor || 'GLA Student'} • {post.createdAt}</p>
                      </div>
                    </div>
                    {post.badgeStyle ? (
                      <span className={post.badgeStyle}>
                        <span className="material-symbols-outlined text-[14px]">help</span> Helpful
                      </span>
                    ) : (
                      <span className="bg-primary/20 text-primary px-sm py-xs rounded-full text-label-sm border border-primary/30">
                        #{post.tag.replace(/\s+/g, '')}
                      </span>
                    )}
                  </div>
                  
                  <div className="font-body-md text-on-surface">
                    <p>{post.content}</p>
                  </div>

                  {post.image && (
                    <div className="rounded-lg overflow-hidden border border-outline-variant/50 max-h-96 w-full bg-surface-container-low flex items-center justify-center">
                      <img src={post.image} className="w-full h-full object-cover" alt="Post attachment" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-lg pt-sm border-t border-outline-variant/50 text-on-surface-variant text-label-sm">
                    <button 
                      onClick={() => handleLikeToggle(post.id)}
                      className={`flex items-center gap-xs transition-colors group cursor-pointer ${isLiked ? 'text-primary' : 'hover:text-primary'}`}
                    >
                      <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>
                        favorite
                      </span>
                      {post.likes}
                    </button>
                    <button 
                      onClick={() => handleToggleComments(post.id)}
                      className="flex items-center gap-xs hover:text-primary transition-colors group cursor-pointer"
                    >
                      <span className="material-symbols-outlined group-hover:scale-110 transition-transform">chat_bubble</span>
                      {post.commentsCount + postComments.length}
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href);
                        showToast('Post link copied to clipboard!');
                      }} 
                      className="flex items-center gap-xs hover:text-primary transition-colors group ml-auto cursor-pointer"
                    >
                      <span className="material-symbols-outlined group-hover:scale-110 transition-transform">share</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {isCommentsOpen && (
                    <div className="border-t border-outline-variant/30 pt-md mt-sm flex flex-col gap-sm">
                      {postComments.map((comment) => (
                        <div key={comment.id} className="flex gap-sm items-start bg-surface-container-low/50 p-sm rounded-lg border border-outline-variant/20">
                          <img className="w-8 h-8 rounded-full object-cover border border-outline-variant shrink-0" src={comment.authorAvatar} alt={comment.authorName} />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-xs">
                              <span className="font-label-sm text-on-surface font-semibold">{comment.authorName}</span>
                              <span className="text-[10px] text-on-surface-variant">{comment.createdAt}</span>
                            </div>
                            <p className="text-body-sm text-on-surface-variant leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment Input */}
                      <div className="flex gap-sm items-center mt-xs">
                        <img className="w-8 h-8 rounded-full object-cover border border-outline-variant shrink-0" src={userProfile.avatar} alt={userProfile.name} />
                        <div className="flex-1 flex gap-sm">
                          <input 
                            type="text" 
                            placeholder="Add a comment..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddCommentSubmit(post.id);
                            }}
                            className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-md py-xs text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                          />
                          <button 
                            onClick={() => handleAddCommentSubmit(post.id)}
                            className="bg-primary-container text-on-primary-container px-md py-xs rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col gap-lg sticky top-margin-desktop h-[calc(100vh-80px)]">
        <div className="bg-surface border border-outline-variant rounded-xl p-md flex flex-col gap-md">
          <div className="flex items-center justify-between border-b border-outline-variant/50 pb-sm">
            <h2 className="font-headline-sm font-bold flex items-center gap-xs text-on-surface">
              <span className="material-symbols-outlined text-primary">rocket_launch</span>
              Project Showcase
            </h2>
          </div>
          <div className="flex flex-col gap-md">
            <Link to="/work" className="group cursor-pointer block">
              <div className="h-32 w-full rounded-lg overflow-hidden border border-outline-variant relative mb-sm">
                <div className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDykJBbCuDCi0HfrIPBD3b4Zghpx020J_6J-cloA8yZcCemduq_nt3xH_FCqRaP-N7QX7ALY2OO5VqUEuaegsNWRsTEUudZdNGoDOxUhSMVeTn86sOX4uA6qXPpeUO20Yg7_QZhaolvIwjmwdY0ftd7y5-oJkzyu1SfRl4UUC48JWB8Shb4N-aJV7j2T72i2qtA_6V7OfH2avsXIf7LUw0cLUcCiR6xrg3SnAxbWUMwKFhawM6-93ER")' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end p-sm">
                  <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-xs py-[2px] rounded uppercase tracking-wider">Trending</span>
                </div>
              </div>
              <h3 className="font-label-md text-on-surface group-hover:text-primary transition-colors">Smart Mirror UI Framework</h3>
              <p className="font-body-sm text-on-surface-variant line-clamp-2 mt-xs">An open-source React framework for building personal smart mirror interfaces.</p>
            </Link>
          </div>
          <Link to="/work" className="w-full block text-center py-sm border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container-high transition-colors mt-xs">
            View All Projects
          </Link>
        </div>
        
        {/* Footer Links */}
        <div className="flex flex-wrap gap-x-md gap-y-sm text-label-sm text-on-surface-variant/70 px-sm">
          <Link className="hover:text-primary transition-colors" to="/privacy">Privacy</Link>
          <Link className="hover:text-primary transition-colors" to="/terms">Terms</Link>
          <Link className="hover:text-primary transition-colors" to="/guidelines">Guidelines</Link>
          <Link className="hover:text-primary transition-colors" to="/contact">Contact</Link>
          <span className="w-full mt-xs">© 2026 TRYBE Inc.</span>
        </div>
      </aside>
    </div>
  );
}
