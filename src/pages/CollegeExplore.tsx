import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getCollegeById, PRIMARY_COLLEGE_ID } from '../data/colleges';
import { getClubsByCollege } from '../data/clubs';
import { getEventsByCollege } from '../data/events';
import { useApp } from '../context/AppContext';

// CollegeExplore handles /college/:collegeId
// — Primary college shows: Feed, Clubs, Events, About, Discussions
// — Other colleges show:   About, Clubs, Events  (no Feed, no Discussions, no Create Post)

type PrimaryTab = 'Feed' | 'Clubs' | 'Events' | 'About' | 'Discussions';
type OtherTab = 'About' | 'Clubs' | 'Events';

export default function CollegeExplore() {
  const { collegeId } = useParams<{ collegeId: string }>();
  const navigate = useNavigate();

  const college = getCollegeById(collegeId ?? '');

  if (!college) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-md text-on-surface-variant p-xl">
        <span className="material-symbols-outlined text-5xl">domain_disabled</span>
        <h2 className="font-headline-md text-on-surface">College not found</h2>
        <p className="font-body-md">The college &ldquo;{collegeId}&rdquo; does not exist.</p>
        <button
          onClick={() => navigate('/college')}
          className="mt-md px-lg py-sm bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-colors"
        >
          Back to My College
        </button>
      </div>
    );
  }

  const isPrimary = college.id === PRIMARY_COLLEGE_ID;

  // If it's the primary college, redirect to /college (the full dashboard)
  // We allow the page to render for direct URL access but note it's the primary
  if (isPrimary) {
    return <PrimaryCollegeDashboard college={college} />;
  }

  return <OtherCollegePage college={college} />;
}

// ── Primary College (same college as user's) ───────────────────────

function PrimaryCollegeDashboard({ college }: { college: ReturnType<typeof getCollegeById> & {} }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PrimaryTab>('About');
  const tabs: PrimaryTab[] = ['Feed', 'Clubs', 'Events', 'About', 'Discussions'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <CollegeHeader
        college={college}
        isPrimary
        onBack={() => navigate('/college')}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as PrimaryTab)}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto w-full px-margin-mobile md:px-margin-desktop py-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'About' && <CollegeAboutSection college={college} />}
              {activeTab === 'Clubs' && <CollegeClubsSection collegeId={college.id} />}
              {activeTab === 'Events' && <CollegeEventsSection collegeId={college.id} />}
              {(activeTab === 'Feed' || activeTab === 'Discussions') && (
                <div className="text-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-4 block">
                    {activeTab === 'Feed' ? 'dynamic_feed' : 'forum'}
                  </span>
                  <p className="font-body-md">
                    {activeTab === 'Feed'
                      ? 'Visit your My College page to access the full feed.'
                      : 'Visit your My College page to join discussions.'}
                  </p>
                  <button
                    onClick={() => navigate('/college')}
                    className="mt-4 px-lg py-sm bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-colors"
                  >
                    Go to My College
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Other College ──────────────────────────────────────────────

function OtherCollegePage({ college }: { college: ReturnType<typeof getCollegeById> & {} }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OtherTab>('About');
  const tabs: OtherTab[] = ['About', 'Clubs', 'Events'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <CollegeHeader
        college={college}
        isPrimary={false}
        onBack={() => navigate('/college')}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as OtherTab)}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto w-full px-margin-mobile md:px-margin-desktop py-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'About' && <CollegeAboutSection college={college} />}
              {activeTab === 'Clubs' && <CollegeClubsSection collegeId={college.id} />}
              {activeTab === 'Events' && <CollegeEventsSection collegeId={college.id} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Shared header ──────────────────────────────────────────────

interface CollegeHeaderProps {
  college: NonNullable<ReturnType<typeof getCollegeById>>;
  isPrimary: boolean;
  onBack: () => void;
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function CollegeHeader({ college, isPrimary, onBack, tabs, activeTab, onTabChange }: CollegeHeaderProps) {
  return (
    <div className="w-full bg-surface-container border-b border-outline-variant relative overflow-hidden shrink-0">
      <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-primary-container to-transparent pointer-events-none" />
      <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-xl relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-lg">
        <div className="flex items-center gap-lg">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-lg border border-outline-variant bg-surface flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors shrink-0"
            aria-label="Back"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="w-16 h-16 rounded-xl bg-surface border border-outline flex items-center justify-center p-sm shadow-lg">
            <span className="material-symbols-outlined text-3xl text-primary">{college.icon}</span>
          </div>
          <div className="flex flex-col gap-xs">
            <div className="flex items-center gap-sm">
              <h1 className="font-headline-lg text-on-surface">{college.name}</h1>
              {isPrimary && (
                <span className="px-sm py-base bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm flex items-center gap-base border border-on-secondary-fixed-variant">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    verified
                  </span>
                  Primary
                </span>
              )}
            </div>
            <p className="font-body-md text-on-surface-variant">
              {college.location} • {college.students} Students
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-lg overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`pb-sm font-label-md text-label-md relative transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-b-2 border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── About section ──────────────────────────────────────────────

function CollegeAboutSection({ college }: { college: NonNullable<ReturnType<typeof getCollegeById>> }) {
  return (
    <div className="flex flex-col gap-lg max-w-[700px]">
      <div className="bg-surface rounded-xl border border-outline-variant p-lg flex flex-col gap-md">
        <h2 className="font-headline-md text-headline-md text-on-surface">About {college.name}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{college.about}</p>
        <div className="flex flex-wrap gap-md mt-sm">
          <div className="flex flex-col items-center px-lg py-sm bg-surface-container-low rounded-lg border border-outline-variant">
            <span className="font-headline-md text-primary">{college.students}</span>
            <span className="font-label-sm text-on-surface-variant">Students</span>
          </div>
          <div className="flex flex-col items-center px-lg py-sm bg-surface-container-low rounded-lg border border-outline-variant">
            <span className="font-headline-md text-primary">{college.activeClubs}</span>
            <span className="font-label-sm text-on-surface-variant">Active Clubs</span>
          </div>
        </div>
      </div>

      {college.facilities.length > 0 && (
        <div className="bg-surface rounded-xl border border-outline-variant p-lg">
          <h3 className="font-headline-sm text-on-surface mb-md">Campus Facilities</h3>
          <div className="flex flex-wrap gap-sm">
            {college.facilities.map(f => (
              <span
                key={f}
                className="px-md py-xs bg-surface-container-high text-on-surface font-label-sm rounded-lg border border-outline-variant"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Clubs section ──────────────────────────────────────────────

function CollegeClubsSection({ collegeId }: { collegeId: string }) {
  const clubs = getClubsByCollege(collegeId);
  const { joinedClubs, joinClub, leaveClub, getClubMemberCount } = useApp();
  const [search, setSearch] = useState('');

  const filtered = clubs.filter(c =>
    normalize(c.title + c.description + c.category).includes(normalize(search))
  );

  function normalize(s: string) {
    return s.trim().toLowerCase();
  }

  if (clubs.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-4 block">group_off</span>
        <p className="font-body-md">No clubs found for this college yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="relative max-w-[400px]">
        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clubs..."
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm pl-12 pr-md font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-on-surface-variant">
          <p className="font-body-md">No clubs match &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {filtered.map(club => {
            const joined = joinedClubs.has(club.id);
            const count = getClubMemberCount(club.id, club.members);
            return (
              <div
                key={club.id}
                className="bg-surface rounded-xl border border-outline-variant p-md flex flex-col gap-md hover:border-primary-container transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">{club.icon}</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {count.toLocaleString()} Members
                  </span>
                </div>
                <div className="flex flex-col gap-xs flex-1">
                  <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                    {club.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    {club.description}
                  </p>
                </div>
                <button
                  onClick={() => (joined ? leaveClub(club.id) : joinClub(club.id))}
                  className={`w-full py-base rounded-lg font-label-sm text-label-sm transition-all ${
                    joined
                      ? 'bg-surface-container-high border border-outline-variant text-on-surface hover:bg-error-container hover:text-on-error-container'
                      : 'bg-surface-variant text-on-surface border border-outline-variant hover:bg-primary hover:text-on-primary hover:border-primary'
                  }`}
                >
                  {joined ? 'Joined ✓' : 'Join Club'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Events section ─────────────────────────────────────────────

function CollegeEventsSection({ collegeId }: { collegeId: string }) {
  const events = getEventsByCollege(collegeId);
  const { rsvpdEvents, interestedEvents, rsvpEvent, cancelRsvp, markInterested, removeInterested } = useApp();

  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-4 block">event_busy</span>
        <p className="font-body-md">No upcoming events for this college.</p>
      </div>
    );
  }

  const featured = events.find(e => e.isFeatured);
  const rest = events.filter(e => !e.isFeatured);

  return (
    <div className="flex flex-col gap-lg max-w-[700px]">
      {featured && (
        <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden flex flex-col">
          {featured.image && (
            <div className="h-48 bg-surface-container-high relative">
              <img alt={featured.title} className="w-full h-full object-cover opacity-60" src={featured.image} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
              <div className="absolute bottom-md left-md">
                <span className="px-sm py-base bg-primary text-on-primary rounded-full font-label-sm text-label-sm">
                  Featured Event
                </span>
              </div>
            </div>
          )}
          <div className="p-md flex flex-col gap-md">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-xs">
                <h2 className="font-headline-md text-headline-md text-on-surface">{featured.title}</h2>
                <div className="flex items-center gap-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-body-sm">calendar_today</span>
                  <span className="font-body-sm text-body-sm">
                    {featured.date}, {featured.time}
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant">{featured.location}</p>
              </div>
              <button
                onClick={() =>
                  rsvpdEvents.has(featured.id) ? cancelRsvp(featured.id) : rsvpEvent(featured.id)
                }
                className={`px-lg py-sm rounded-lg font-label-md text-label-md transition-colors shrink-0 ${
                  rsvpdEvents.has(featured.id)
                    ? 'bg-surface-container-high border border-outline-variant text-on-surface'
                    : 'bg-primary text-on-primary hover:bg-primary-fixed'
                }`}
              >
                {rsvpdEvents.has(featured.id) ? 'RSVP\'d ✓' : 'RSVP Now'}
              </button>
            </div>
            <p className="font-body-sm text-on-surface-variant">{featured.description}</p>
          </div>
        </div>
      )}

      {rest.map(event => (
        <div key={event.id} className="bg-surface rounded-xl border border-outline-variant p-md flex flex-col gap-md">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h3 className="font-label-md text-label-md text-on-surface">{event.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                {event.date}, {event.time} • {event.location}
              </p>
            </div>
          </div>
          <p className="font-body-sm text-on-surface-variant line-clamp-2">{event.description}</p>
          <div className="flex gap-sm">
            <button
              onClick={() =>
                rsvpdEvents.has(event.id) ? cancelRsvp(event.id) : rsvpEvent(event.id)
              }
              className={`flex-1 py-base border rounded-lg font-label-sm text-label-sm transition-colors ${
                rsvpdEvents.has(event.id)
                  ? 'bg-primary text-on-primary border-primary'
                  : 'border-outline-variant text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {rsvpdEvents.has(event.id) ? 'RSVP\'d ✓' : 'RSVP'}
            </button>
            <button
              onClick={() =>
                interestedEvents.has(event.id) ? removeInterested(event.id) : markInterested(event.id)
              }
              className={`flex-1 py-base border rounded-lg font-label-sm text-label-sm transition-colors ${
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
