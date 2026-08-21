import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CLUBS } from '../data/clubs';
import { useApp } from '../context/AppContext';

const CATEGORIES = ['All Clubs', 'Technology', 'Arts & Design', 'Business', 'Social Impact', 'Sports', 'Gaming'];

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function Clubs() {
  const { joinedClubs, joinClub, leaveClub, getClubMemberCount, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Clubs');

  const glaClubs = CLUBS.filter(c => c.collegeId === 'gla-university');
  const myClubs = CLUBS.filter(c => joinedClubs.has(c.id));

  const filteredGlaClubs = glaClubs.filter(club => {
    const matchesSearch =
      !search ||
      normalize(club.title + club.description + club.category + club.tags.join(' ')).includes(
        normalize(search)
      );
    const matchesCategory =
      activeCategory === 'All Clubs' || club.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-background relative z-10">
      <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">

        {/* My Clubs */}
        {myClubs.length > 0 && (
          <section className="mb-xl">
            <h2 className="font-headline-md text-primary mb-md">Your Clubs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {myClubs.map(club => (
                <div
                  key={club.id}
                  className="bg-surface border border-primary/30 rounded-xl p-lg flex flex-col gap-md group hover:border-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(125,64,71,0.2)]"
                >
                  <div className="flex items-center gap-md">
                    <div className="w-16 h-16 rounded-lg bg-surface-container-high border border-outline-variant shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-2xl">{club.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-on-background line-clamp-1 group-hover:text-primary transition-colors">
                        {club.title}
                      </h3>
                      <p className="font-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-xs">group</span>{' '}
                        {getClubMemberCount(club.id, club.members).toLocaleString()} members
                      </p>
                    </div>
                  </div>
                  <p className="font-body-sm text-on-surface-variant flex-1 line-clamp-3">{club.description}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {club.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant font-label-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/clubs/${club.id}`}
                    className="w-full mt-4 py-3 rounded-lg bg-primary-container text-on-primary-container font-label-md hover:bg-secondary-container transition-all text-center block cursor-pointer"
                  >
                    View Dashboard
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        <header className="mb-xl">
          <h2 className="font-headline-xl text-on-background mb-sm">Discover Clubs at GLA University</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Find your people at GLA University. Build your future. Explore communities centered around shared passions and endless opportunities.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-lg mb-xl items-start md:items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary">
              search
            </span>
            <input
              className="w-full bg-surface border border-outline-variant rounded-full py-3 pl-12 pr-4 font-body-md text-on-background placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Search clubs, topics, or interests..."
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-sm overflow-x-auto pb-lg hide-scrollbar mb-xl">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-lg py-2 rounded-full border font-label-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'border-primary bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(125,64,71,0.3)]'
                  : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredGlaClubs.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-4 block">group_off</span>
            <p className="font-body-md">No clubs found{search ? ` for "${search}"` : ''}.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All Clubs'); }}
              className="mt-4 text-primary font-label-md hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {filteredGlaClubs.map(club => {
              const joined = joinedClubs.has(club.id);
              const memberCount = getClubMemberCount(club.id, club.members);

              return (
                <div
                  key={club.id}
                  className={`bg-surface rounded-xl p-lg flex flex-col gap-md relative group transition-all duration-300 border ${
                    joined
                      ? 'border-primary/30 hover:border-primary hover:shadow-[0_0_30px_rgba(125,64,71,0.2)]'
                      : 'border-outline-variant hover:border-primary/50'
                  }`}
                >
                  {club.isTrending && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-primary">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
                        local_fire_department
                      </span>
                      <span className="font-label-sm text-label-sm">Trending</span>
                    </div>
                  )}
                  <div className="flex items-center gap-md">
                    <div className="w-16 h-16 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-2xl">{club.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-on-background group-hover:text-primary transition-colors">
                        {club.title}
                      </h3>
                      <p className="font-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-xs">group</span>{' '}
                        {memberCount.toLocaleString()} members
                      </p>
                    </div>
                  </div>
                  <p className="font-body-sm text-on-surface-variant flex-1 line-clamp-3">{club.description}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {club.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant font-label-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-sm mt-2">
                    <Link
                      to={`/clubs/${club.id}`}
                      className="flex-1 py-2 rounded-lg border border-outline-variant text-on-surface font-label-md text-center hover:bg-surface-container-high transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => (joined ? leaveClub(club.id) : joinClub(club.id))}
                      className={`flex-1 py-2 rounded-lg font-label-md transition-all cursor-pointer ${
                        joined
                          ? 'bg-surface-container-high text-on-surface border border-outline-variant hover:bg-error-container hover:text-on-error-container'
                          : 'bg-surface-container-high text-on-surface border border-outline-variant hover:bg-primary-container hover:text-on-primary-container hover:border-primary-container'
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

        <div className="mt-xl flex justify-center">
          <button 
            onClick={() => showToast('All current campus clubs loaded!', 'info')}
            className="px-xl py-3 rounded-full border border-outline-variant text-on-surface hover:border-primary hover:text-primary transition-colors font-label-md cursor-pointer"
          >
            All Communities Loaded
          </button>
        </div>
      </div>
    </div>
  );
}
