import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Post, PostCategory } from '../data/types';
import { NextBestActionCard } from '../components/career/NextBestActionCard';
import { mediaService } from '../services/mediaService';

type PostMode = 'gossip' | 'meme' | 'question' | 'photo' | 'video' | 'general';

export default function HomeFeed() {
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  const [attachedMedia, setAttachedMedia] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadSource, setUploadSource] = useState<'supabase' | 'local' | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (location.hash === '#create-post' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [location]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      showToast('Please select an image or video file.');
      return;
    }

    // Guard against excessively large files (>25MB)
    if (file.size > 25 * 1024 * 1024) {
      showToast('File size must be under 25MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAttachedMedia(base64);
      const detectedType = isVideo ? 'video' : 'image';
      setMediaType(detectedType);
      if (detectedType === 'video' && postMode !== 'video') setPostMode('video');
      if (detectedType === 'image' && postMode !== 'photo' && postMode !== 'meme') setPostMode('photo');

      // Upload to Supabase Storage in the background
      setIsUploadingMedia(true);
      try {
        const uploadRes = await mediaService.uploadPostMedia(file, base64, userProfile.id);
        if (uploadRes.source === 'supabase') {
          setAttachedMedia(uploadRes.publicUrl);
          setUploadSource('supabase');
          showToast(isVideo ? 'Video uploaded to Supabase Storage! 🚀' : 'Photo uploaded to Supabase Storage! 🚀');
        } else {
          setUploadSource('local');
          showToast(isVideo ? 'Video attached (local preview)' : 'Photo attached (local preview)');
        }
      } catch {
        setUploadSource('local');
      } finally {
        setIsUploadingMedia(false);
      }
    };
    reader.onerror = () => {
      showToast('Failed to read file.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getPlaceholder = () => {
    switch (postMode) {
      case 'video':
        return "Describe the video or clip you are sharing...";
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
    if (!newPostText.trim() && !attachedMedia) return;

    const isVideo =
      mediaType === 'video' ||
      postMode === 'video' ||
      (attachedMedia && (attachedMedia.includes('.mp4') || attachedMedia.includes('.webm') || attachedMedia.startsWith('data:video')));

    let tag = 'Campus Gossip';
    let category: PostCategory = 'Campus Gossip';
    if (isVideo) { tag = 'Videos'; category = 'Videos'; }
    else if (postMode === 'meme') { tag = 'Memes'; category = 'Memes'; }
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
      image: !isVideo && attachedMedia ? attachedMedia : undefined,
      video: isVideo && attachedMedia ? attachedMedia : undefined,
      mediaType: attachedMedia ? (isVideo ? 'video' : 'image') : undefined,
      likes: 0,
      liked: false,
      commentsCount: 0,
    };

    addHomePost(newPost);
    setNewPostText('');
    setAttachedMedia('');
    setMediaType(null);
    setIsUploadingMedia(false);
    setUploadSource(null);
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
    const nextMode = postMode === mode ? 'gossip' : mode;
    setPostMode(nextMode);
    if (nextMode !== 'photo' && nextMode !== 'meme' && nextMode !== 'video') {
      setAttachedMedia('');
      setMediaType(null);
    }
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

        {/* Career: next best action */}
        <NextBestActionCard variant="compact" />

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
              
              {/* Hidden file input for native device upload */}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept={postMode === 'video' ? 'video/*' : 'image/*,video/*'} 
                onChange={handleFileUpload} 
                className="hidden" 
              />

              {(postMode === 'photo' || postMode === 'meme' || postMode === 'video' || attachedMedia) && (
                <div className="flex flex-col gap-xs mt-xs">
                  <div className="flex gap-xs items-center flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-xs px-sm py-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-label-sm font-medium shrink-0 cursor-pointer transition-colors border border-outline-variant/60"
                      title="Upload photo or video from your device"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload_file</span>
                      <span>Upload {postMode === 'video' ? 'Video' : 'File'}</span>
                    </button>

                    <input 
                      type="text" 
                      placeholder={postMode === 'video' ? "Paste video URL (MP4, WebM) or click Upload..." : "Paste image URL or click Upload..."} 
                      value={attachedMedia} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setAttachedMedia(val);
                        const lower = val.toLowerCase();
                        if (lower.includes('.mp4') || lower.includes('.webm') || lower.includes('youtube') || lower.includes('vimeo')) {
                          setMediaType('video');
                        } else if (val) {
                          setMediaType('image');
                        }
                      }} 
                      className="flex-1 min-w-[200px] bg-surface-container-low border border-outline-variant rounded-lg px-md py-xs text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    />

                    {postMode === 'video' ? (
                      <button 
                        type="button"
                        onClick={() => {
                          setAttachedMedia('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                          setMediaType('video');
                        }}
                        className="text-primary text-label-sm font-semibold hover:underline shrink-0 bg-surface-container-high px-sm py-xs rounded-lg cursor-pointer"
                      >
                        Sample Video
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => {
                          setAttachedMedia('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80');
                          setMediaType('image');
                        }}
                        className="text-primary text-label-sm font-semibold hover:underline shrink-0 bg-surface-container-high px-sm py-xs rounded-lg cursor-pointer"
                      >
                        Sample Image
                      </button>
                    )}
                  </div>

                  {attachedMedia && (
                    <div className="mt-xs flex flex-col gap-xs">
                      {mediaType === 'video' || attachedMedia.includes('.mp4') || attachedMedia.includes('.webm') || attachedMedia.startsWith('data:video') ? (
                        <div className="relative w-full max-w-sm rounded-lg overflow-hidden border border-outline-variant bg-black">
                          <video 
                            src={attachedMedia} 
                            controls 
                            playsInline 
                            className="w-full max-h-48 object-contain" 
                          />
                          <button 
                            type="button" 
                            onClick={() => { setAttachedMedia(''); setMediaType(null); setUploadSource(null); }}
                            className="absolute top-2 right-2 bg-background/80 hover:bg-background text-on-surface rounded-full p-1 flex items-center justify-center cursor-pointer shadow"
                            title="Remove video"
                          >
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-28 h-20 rounded overflow-hidden border border-outline-variant">
                          <img src={attachedMedia} className="w-full h-full object-cover" alt="Attached preview" />
                          <button 
                            type="button" 
                            onClick={() => { setAttachedMedia(''); setMediaType(null); setUploadSource(null); }}
                            className="absolute top-1 right-1 bg-background/80 hover:bg-background text-on-surface rounded-full p-[2px] flex items-center justify-center cursor-pointer shadow"
                            title="Remove image"
                          >
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                        </div>
                      )}

                      {/* Storage Status indicator */}
                      <div className="flex items-center gap-xs text-[11px]">
                        {isUploadingMedia ? (
                          <span className="flex items-center gap-xs text-primary font-medium animate-pulse">
                            <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                            Uploading to Supabase Storage...
                          </span>
                        ) : uploadSource === 'supabase' || attachedMedia.includes('supabase.co') ? (
                          <span className="flex items-center gap-xs text-green-400 font-medium">
                            <span className="material-symbols-outlined text-xs">cloud_done</span>
                            Saved in Supabase Storage (post-media)
                          </span>
                        ) : null}
                      </div>
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

              <button 
                type="button" 
                onClick={() => togglePostMode('video')}
                className={`flex items-center gap-xs px-sm py-xs rounded-full transition-colors text-label-sm cursor-pointer ${postMode === 'video' ? 'bg-[#C85C68]/20 text-[#ffb2b9] border border-[#C85C68]/30 font-bold' : 'hover:bg-surface-container-high hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[18px]">videocam</span>
                <span className="hidden sm:inline">Video</span>
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
            { label: 'Photos', emoji: '📸' },
            { label: 'Videos', emoji: '🎥' }
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

              const hasVideo = Boolean(
                post.video ||
                post.mediaType === 'video' ||
                (post.image && (post.image.includes('.mp4') || post.image.includes('.webm') || post.image.startsWith('data:video')))
              );
              const videoSrc = post.video || post.image;

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

                  {/* Media rendering (Video or Image) */}
                  {hasVideo && videoSrc ? (
                    <div className="rounded-lg overflow-hidden border border-outline-variant/50 max-h-[460px] w-full bg-black flex items-center justify-center">
                      <video 
                        src={videoSrc} 
                        controls 
                        playsInline 
                        preload="metadata"
                        className="w-full max-h-[460px] object-contain rounded-lg" 
                      />
                    </div>
                  ) : post.image ? (
                    <div className="rounded-lg overflow-hidden border border-outline-variant/50 max-h-96 w-full bg-surface-container-low flex items-center justify-center">
                      <img src={post.image} className="w-full h-full object-cover" alt="Post attachment" />
                    </div>
                  ) : null}

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
