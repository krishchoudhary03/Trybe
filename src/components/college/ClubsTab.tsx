import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClubsByCollege } from '../../data/clubs';
import { useApp } from '../../context/AppContext';

const COLLEGE_ID = 'gla-university';
const CATEGORIES = ['All', 'Technology', 'Arts & Design', 'Business', 'Sports', 'Social Impact', 'Gaming'];

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function ClubsTab() {
  const navigate = useNavigate();
  const { joinedClubs, joinClub, leaveClub, getClubMemberCount } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const allClubs = getClubsByCollege(COLLEGE_ID);

  const filtered = allClubs.filter(club => {
    const matchesSearch =
      !search ||
      normalize(club.title + club.description + club.category + club.tags.join(' ')).includes(
        normalize(search)
      );
    const matchesCategory = activeCategory === 'All' || club.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col gap-lg max-w-[700px]">
      <div className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <h2 className="font-headline-md text-headline-md text-on-surface">Discover Clubs at GLA University</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Find your community and explore your passions with fellow students.
          </p>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm pl-12 pr-md font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Search for clubs (e.g. AI, Design, Python...)"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-sm overflow-x-auto hide-scrollbar pb-sm">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-md py-base rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors border ${
              activeCategory === cat
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface border-outline-variant'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-4 block">group_off</span>
          <p className="font-body-md">
            No clubs found{search ? ` for "${search}"` : ''} in {activeCategory !== 'All' ? activeCategory : 'any category'}.
          </p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('All'); }}
            className="mt-4 text-primary font-label-md hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {filtered.map(club => {
            const joined = joinedClubs.has(club.id);
            const memberCount = getClubMemberCount(club.id, club.members);

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
                    {memberCount.toLocaleString()} Members
                  </span>
                </div>
                <div className="flex flex-col gap-xs flex-1">
                  <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                    {club.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    {club.description}
                  </p>
                  <div className="flex flex-wrap gap-xs mt-xs">
                    {club.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-xs py-[2px] rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-sm mt-auto">
                  <button
                    onClick={() => navigate(`/clubs/${club.id}`)}
                    className="flex-1 py-base border border-outline-variant text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-container-high transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => (joined ? leaveClub(club.id) : joinClub(club.id))}
                    className={`flex-1 py-base rounded-lg font-label-sm text-label-sm transition-all ${
                      joined
                        ? 'bg-surface-container-high border border-outline-variant text-on-surface hover:bg-error-container hover:text-on-error-container hover:border-error-container'
                        : 'bg-surface-variant text-on-surface border border-outline-variant hover:bg-primary hover:text-on-primary hover:border-primary'
                    }`}
                  >
                    {joined ? 'Joined ✓' : 'Join Club'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
