import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CLUBS } from '../data/clubs';
import { Modal } from '../components/Modal';

type ProfileTab = 'Activity' | 'About' | 'Clubs' | 'Projects';

export default function Profile() {
  const { userProfile, updateUserProfile, joinedClubs, rsvpdEvents, interestedEvents, homePosts, projects, logout } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('Activity');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const myClubs = CLUBS.filter(c => joinedClubs.has(c.id));
  const myProjects = projects.filter(p => p.isOwn);
  const myPosts = homePosts.filter(p => p.authorName === userProfile.name || p.authorId === userProfile.username);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Banner */}
      <div className="w-full h-40 md:h-52 relative bg-surface-container-high overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/40 via-primary/15 to-secondary-container/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute top-6 left-1/3 w-56 h-56 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-2 right-1/4 w-36 h-36 bg-secondary-container/25 rounded-full blur-[50px] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-margin-mobile md:px-lg relative">
        {/* Profile header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md -mt-14 md:-mt-16 mb-lg relative z-10">
          {/* Left: avatar + name */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-md">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background bg-surface-container-high shrink-0 overflow-hidden shadow-xl ring-2 ring-primary/20 relative z-20">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="pb-1">
              <div className="flex items-center gap-xs">
                <h2 className="font-bold text-[22px] md:text-[28px] text-on-surface tracking-tight leading-tight">
                  {userProfile.name}
                </h2>
                <span
                  className="material-symbols-outlined text-primary text-[20px] shrink-0"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  verified
                </span>
              </div>
              <p className="font-body-sm text-on-surface-variant">@{userProfile.username}</p>
              <p className="font-body-sm text-on-surface mt-xs max-w-sm leading-relaxed line-clamp-2">
                {userProfile.bio}
              </p>
              <div className="flex flex-wrap items-center gap-x-md gap-y-xs mt-xs text-on-surface-variant text-[12px]">
                <span className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {userProfile.location}
                </span>
                <span className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">school</span>
                  {userProfile.college}
                </span>
                <span className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                  Joined {userProfile.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-sm self-start sm:self-end shrink-0 pb-1">
            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              onClick={() => setShowEditModal(true)}
              className="h-9 px-4 rounded-full border border-outline-variant bg-surface font-label-md text-on-surface hover:bg-surface-container-high hover:border-primary/40 transition-colors flex items-center gap-xs text-[13px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
              Edit Profile
            </motion.button>
            <Link
              to="/settings"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
              title="Settings"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </Link>
            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              onClick={() => setShowLogoutConfirm(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant hover:bg-error-container/30 hover:text-error hover:border-error/30 transition-colors cursor-pointer"
              title="Log out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </motion.button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex gap-lg mb-lg px-md py-sm rounded-xl border border-outline-variant bg-surface-container-low/60 w-fit">
          <div className="flex flex-col items-center px-sm">
            <span className="font-bold text-[18px] text-on-surface">{myClubs.length}</span>
            <span className="font-label-sm text-on-surface-variant text-[11px] uppercase tracking-widest">Clubs</span>
          </div>
          <div className="w-px bg-outline-variant" />
          <div className="flex flex-col items-center px-sm">
            <span className="font-bold text-[18px] text-on-surface">{myProjects.length}</span>
            <span className="font-label-sm text-on-surface-variant text-[11px] uppercase tracking-widest">Projects</span>
          </div>
          <div className="w-px bg-outline-variant" />
          <div className="flex flex-col items-center px-sm">
            <span className="font-bold text-[18px] text-on-surface">{rsvpdEvents.size + interestedEvents.size}</span>
            <span className="font-label-sm text-on-surface-variant text-[11px] uppercase tracking-widest">Events</span>
          </div>
        </div>

        {/* Skills + Interests chips inline under stats */}
        {(userProfile.skills.length > 0 || userProfile.interests.length > 0) && (
          <div className="flex flex-wrap gap-xs mb-lg">
            {userProfile.skills.slice(0, 5).map(s => (
              <span key={s} className="px-sm py-xs rounded-full bg-primary-container/20 text-primary font-label-sm text-[11px] border border-primary-container/40">
                {s}
              </span>
            ))}
            {userProfile.interests.slice(0, 4).map(i => (
              <span key={i} className="px-sm py-xs rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] border border-outline-variant">
                {i}
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-outline-variant mb-lg">
          <nav className="flex gap-lg overflow-x-auto hide-scrollbar">
            {(['Activity', 'About', 'Clubs', 'Projects'] as ProfileTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-sm font-label-md whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  activeTab === tab
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant hover:text-on-surface border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pb-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'Activity' && <ActivityTab profile={userProfile} />}
              {activeTab === 'About' && <AboutTab profile={userProfile} />}
              {activeTab === 'Clubs' && <ClubsTab clubs={myClubs} />}
              {activeTab === 'Projects' && <ProjectsTab projects={myProjects} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal
            profile={userProfile}
            onSave={updates => {
              updateUserProfile(updates);
              setShowEditModal(false);
            }}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Logout Confirm Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Log out?"
        subtitle="You will be redirected to the login page."
        size="sm"
        icon="logout"
        iconVariant="error"
        footer={
          <>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-lg py-sm rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-lg py-sm rounded-lg bg-error text-on-error font-label-md hover:opacity-90 transition-all flex items-center gap-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Log Out
            </button>
          </>
        }
      >
        <p className="font-body-sm text-on-surface-variant leading-relaxed">
          Are you sure you want to log out? Your session data will stay safely saved in this browser.
        </p>
      </Modal>
    </div>
  );
}

// ── Activity Tab ───────────────────────────────────────────────

function ActivityTab({ profile }: { profile: ReturnType<typeof useApp>['userProfile'] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
      <div className="lg:col-span-1 space-y-md">
        <div className="p-md rounded-xl border border-outline-variant bg-surface">
          <h3 className="font-label-md text-on-surface mb-sm">Current Vibe</h3>
          <div className="flex flex-wrap gap-xs">
            {profile.interests.slice(0, 3).map(i => (
              <span key={i} className="px-sm py-xs rounded-full bg-primary-container/20 text-primary font-label-sm text-[11px] border border-primary-container/40">
                #{i.replace(/\s+/g, '')}
              </span>
            ))}
            <span className="px-sm py-xs rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] border border-outline-variant">
              #LateNightHacking
            </span>
          </div>
        </div>

        <div className="p-md rounded-xl border border-outline-variant bg-surface">
          <h3 className="font-label-md text-on-surface mb-sm">Quick Links</h3>
          <div className="flex flex-col gap-xs">
            <Link to="/clubs" className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors font-body-sm py-xs">
              <span className="material-symbols-outlined text-[16px]">hub</span> My Clubs
            </Link>
            <Link to="/work" className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors font-body-sm py-xs">
              <span className="material-symbols-outlined text-[16px]">work</span> My Projects
            </Link>
            <Link to="/settings" className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors font-body-sm py-xs">
              <span className="material-symbols-outlined text-[16px]">settings</span> Settings
            </Link>
            <Link to="/help" className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors font-body-sm py-xs">
              <span className="material-symbols-outlined text-[16px]">help_outline</span> Help
            </Link>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-md">
        <div className="p-md rounded-xl border border-outline-variant bg-surface hover:border-primary-container transition-colors">
          <div className="flex items-center gap-sm mb-sm">
            <div className="w-9 h-9 rounded-full border border-outline-variant overflow-hidden">
              <img src={profile.avatar} className="w-full h-full object-cover" alt={profile.name} />
            </div>
            <div>
              <h4 className="font-label-md text-on-surface">{profile.name}</h4>
              <p className="font-body-sm text-on-surface-variant text-[11px]">
                Just now • in{' '}
                <Link to="/clubs/design-circle" className="text-primary hover:underline">
                  Design Circle
                </Link>
              </p>
            </div>
          </div>
          <p className="font-body-sm text-on-surface leading-relaxed">
            Just dropped some new explorations for the campus app overhaul. Leaning into deep blacks, high contrast typography, and subtle crimson glows. What do we think? 🤔
          </p>
        </div>

        <div className="p-md rounded-xl border border-outline-variant bg-surface hover:border-primary-container transition-colors flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-[18px]">event</span>
          <div>
            <h4 className="font-label-md text-on-surface">RSVP'd to AI & ML Fall Showcase</h4>
            <p className="font-body-sm text-on-surface-variant">Today, 7:00 PM • Main Auditorium</p>
          </div>
        </div>

        <div className="text-center py-8 text-on-surface-variant border border-outline-variant border-dashed rounded-xl">
          <span className="material-symbols-outlined text-3xl mb-2 block">dynamic_feed</span>
          <p className="font-body-sm">Post, join clubs, and RSVP to events — your activity will appear here.</p>
        </div>
      </div>
    </div>
  );
}

// ── About Tab ──────────────────────────────────────────────────

function AboutTab({ profile }: { profile: ReturnType<typeof useApp>['userProfile'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-md max-w-2xl">
      <div className="p-md rounded-xl border border-outline-variant bg-surface flex flex-col gap-sm">
        <h3 className="font-label-md text-on-surface">Skills</h3>
        <div className="flex flex-wrap gap-xs">
          {profile.skills.length > 0 ? (
            profile.skills.map(s => (
              <span key={s} className="px-sm py-xs rounded-full bg-primary-container/20 text-primary font-label-sm text-[11px] border border-primary-container/40">
                {s}
              </span>
            ))
          ) : (
            <p className="text-on-surface-variant font-body-sm text-[12px]">No skills added. Edit your profile.</p>
          )}
        </div>
      </div>

      <div className="p-md rounded-xl border border-outline-variant bg-surface flex flex-col gap-sm">
        <h3 className="font-label-md text-on-surface">Interests</h3>
        <div className="flex flex-wrap gap-xs">
          {profile.interests.length > 0 ? (
            profile.interests.map(i => (
              <span key={i} className="px-sm py-xs rounded-full bg-surface-container-high text-on-surface font-label-sm text-[11px] border border-outline-variant">
                {i}
              </span>
            ))
          ) : (
            <p className="text-on-surface-variant font-body-sm text-[12px]">No interests added yet.</p>
          )}
        </div>
      </div>

      <div className="p-md rounded-xl border border-outline-variant bg-surface flex flex-col gap-sm md:col-span-2">
        <h3 className="font-label-md text-on-surface">About Me</h3>
        <p className="font-body-sm text-on-surface-variant leading-relaxed">{profile.bio}</p>
        <div className="flex flex-wrap gap-md text-on-surface-variant font-body-sm text-[12px] pt-sm border-t border-outline-variant">
          <span className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[14px]">location_on</span>{profile.location}
          </span>
          <span className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[14px]">school</span>{profile.college}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Clubs Tab ──────────────────────────────────────────────────

function ClubsTab({ clubs }: { clubs: typeof CLUBS }) {
  if (clubs.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant border border-outline-variant border-dashed rounded-xl">
        <span className="material-symbols-outlined text-4xl mb-3 block">group_off</span>
        <p className="font-body-sm">You haven't joined any clubs yet.</p>
        <Link to="/clubs" className="mt-3 inline-block text-primary font-label-sm hover:underline">
          Browse Clubs →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
      {clubs.map(club => (
        <Link
          key={club.id}
          to={`/clubs/${club.id}`}
          className="p-md rounded-xl border border-outline-variant bg-surface hover:border-primary-container transition-colors group flex items-center gap-md"
        >
          <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[18px]">{club.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-label-md text-on-surface group-hover:text-primary transition-colors truncate">{club.title}</h3>
            <p className="font-body-sm text-on-surface-variant text-[11px] truncate">{club.category}</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">chevron_right</span>
        </Link>
      ))}
    </div>
  );
}

// ── Projects Tab ───────────────────────────────────────────────

function ProjectsTab({ projects }: { projects: ReturnType<typeof useApp>['projects'] }) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant border border-outline-variant border-dashed rounded-xl">
        <span className="material-symbols-outlined text-4xl mb-3 block">work_off</span>
        <p className="font-body-sm">No projects yet.</p>
        <Link to="/work" className="mt-3 inline-block text-primary font-label-sm hover:underline">
          Create a Project →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
      {projects.map(p => (
        <Link
          key={p.id}
          to="/work"
          className="p-md rounded-xl border border-outline-variant bg-surface hover:border-primary-container transition-colors group"
        >
          <h3 className="font-label-md text-on-surface group-hover:text-primary transition-colors mb-xs truncate">{p.title}</h3>
          <p className="font-body-sm text-on-surface-variant line-clamp-2 mb-sm text-[12px]">{p.description}</p>
          <div className="flex flex-wrap gap-xs">
            {p.technologies.slice(0, 3).map(t => (
              <span key={t} className="px-xs py-[2px] bg-surface-container-high rounded text-[10px] text-on-surface border border-outline-variant/50">
                {t}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}

// ── Edit Profile Modal ─────────────────────────────────────────

interface EditProfileModalProps {
  profile: ReturnType<typeof useApp>['userProfile'];
  onSave: (updates: Partial<ReturnType<typeof useApp>['userProfile']>) => void;
  onClose: () => void;
}

function EditProfileModal({ profile, onSave, onClose }: EditProfileModalProps) {
  const [form, setForm] = useState({
    name: profile.name,
    username: profile.username,
    bio: profile.bio,
    location: profile.location,
    avatar: profile.avatar,
    skillsStr: profile.skills.join(', '),
    interestsStr: profile.interests.join(', '),
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSave({
        name: form.name.trim() || profile.name,
        username: form.username.trim().replace(/^@/, '') || profile.username,
        bio: form.bio.trim(),
        location: form.location.trim(),
        avatar: form.avatar.trim() || profile.avatar,
        skills: form.skillsStr.split(',').map(s => s.trim()).filter(Boolean),
        interests: form.interestsStr.split(',').map(s => s.trim()).filter(Boolean),
      });
      setIsSaving(false);
    }, 200);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Profile"
      subtitle="Update your student profile details and bio."
      size="lg"
      icon="edit"
      iconVariant="primary"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-lg py-sm rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={(e) => {
              handleSubmit(e as any);
            }}
            className="px-lg py-sm rounded-lg bg-primary text-on-primary font-label-md hover:opacity-90 transition-all disabled:opacity-60 flex items-center gap-xs cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">check</span>
                Save Changes
              </>
            )}
          </button>
        </>
      }
    >
      <form id="edit-profile-form" onSubmit={handleSubmit} className="flex flex-col gap-md w-full">
        <div className="w-full">
          <label className="block font-label-sm font-medium text-on-surface-variant mb-xs">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-on-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="Your full name"
          />
        </div>

        <div className="w-full">
          <label className="block font-label-sm font-medium text-on-surface-variant mb-xs">Username</label>
          <div className="relative w-full">
            <span className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">@</span>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value.replace(/^@/, '') }))}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm pl-8 pr-md text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="username"
            />
          </div>
        </div>

        <div className="w-full">
          <label className="block font-label-sm font-medium text-on-surface-variant mb-xs">Avatar Image URL</label>
          <input
            type="text"
            value={form.avatar}
            onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-on-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="https://..."
          />
        </div>

        <div className="w-full">
          <label className="block font-label-sm font-medium text-on-surface-variant mb-xs">Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-on-surface focus:outline-none focus:border-primary transition-colors resize-none h-24"
            placeholder="Tell people about yourself..."
          />
        </div>

        <div className="w-full">
          <label className="block font-label-sm font-medium text-on-surface-variant mb-xs">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-on-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="City, Country"
          />
        </div>

        <div className="w-full">
          <label className="block font-label-sm font-medium text-on-surface-variant mb-xs">
            Skills <span className="text-[11px] ml-xs opacity-60">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={form.skillsStr}
            onChange={e => setForm(f => ({ ...f, skillsStr: e.target.value }))}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-on-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="React, Python, Figma"
          />
        </div>

        <div className="w-full">
          <label className="block font-label-sm font-medium text-on-surface-variant mb-xs">
            Interests <span className="text-[11px] ml-xs opacity-60">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={form.interestsStr}
            onChange={e => setForm(f => ({ ...f, interestsStr: e.target.value }))}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-on-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="AI, Design, Startups"
          />
        </div>
      </form>
    </Modal>
  );
}
