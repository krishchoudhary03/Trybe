import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { RightSidebar } from '../components/college/RightSidebar';
import { FeedTab } from '../components/college/FeedTab';
import { ClubsTab } from '../components/college/ClubsTab';
import { EventsTab } from '../components/college/EventsTab';
import { AboutTab } from '../components/college/AboutTab';
import { DiscussionsTab } from '../components/college/DiscussionsTab';
import { COLLEGES, PRIMARY_COLLEGE_ID } from '../data/colleges';
import { PEOPLE } from '../data/people';
import { useApp } from '../context/AppContext';
import type { ConnectionStatus } from '../data/types';
import { Modal } from '../components/Modal';

const OTHER_COLLEGES = COLLEGES.filter(c => c.id !== PRIMARY_COLLEGE_ID);

export default function MyCollege() {
  const navigate = useNavigate();
  const { connections, setConnectionStatus, showToast } = useApp();

  const [view, setView] = useState<'overview' | 'dashboard'>('overview');
  const [activeTab, setActiveTab] = useState<'Feed' | 'Clubs' | 'Events' | 'About' | 'Discussions'>('Feed');

  // Modals state
  const [showDirectory, setShowDirectory] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const tabs = ['Feed', 'Clubs', 'Events', 'About', 'Discussions'] as const;

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/college/gla-university?invite=gla2026`;
    navigator.clipboard?.writeText(inviteUrl);
    setCopiedLink(true);
    showToast('GLA University invite link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const filteredDirectoryPeople = PEOPLE.filter(p =>
    p.collegeId === PRIMARY_COLLEGE_ID &&
    (p.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      p.role.toLowerCase().includes(directorySearch.toLowerCase()) ||
      p.skills.some(s => s.toLowerCase().includes(directorySearch.toLowerCase())))
  );

  if (view === 'overview') {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto p-margin-mobile md:p-margin-desktop">
          {/* Top Section: Your College */}
          <section className="mb-xl">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-md">Your College</h1>
            <div className="relative w-full rounded-xl overflow-hidden border border-outline-variant group min-h-[400px] flex flex-col justify-end p-lg md:p-xl">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBGxytKOaHObzqo9XfI7c2kw2SgDayFpE5scvrXJFd_ir6J0zUkbngQXVPmovaGG9ec-LPRFuCu3rwf_mff3HXDK4hkkSbBzJR29yR2h2uJkAMHKtpf3skUNU4HZSSdogHOQJm8WAYrB4b2XGVoH65K3_U5wpeOBOfzstEES9U4fOEy5PNZ-d0eZ7VEhQRxvOG0o7b14EeXRcgYPzyEYbHMdwfvVIaMImyncySiaSpJuUJS4XGcJL0x')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/80 to-transparent" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-lg">
                <div>
                  <div className="flex items-center gap-sm mb-sm">
                    <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-outline-variant shadow-[0_0_20px_rgba(125,64,71,0.3)]">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
                        school
                      </span>
                    </div>
                    <span className="px-sm py-base bg-secondary-container/50 text-on-secondary-container font-label-sm text-label-sm rounded-full border border-primary-container backdrop-blur-md">
                      Verified Primary
                    </span>
                  </div>
                  <h2 className="font-headline-xl text-headline-xl text-on-surface mb-xs drop-shadow-lg">GLA University</h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    Mathura, Uttar Pradesh
                  </p>
                </div>
                <div className="flex flex-col gap-sm">
                  <div className="flex gap-md bg-surface/40 backdrop-blur-md p-sm rounded-lg border border-outline-variant">
                    <div className="text-center px-sm border-r border-outline-variant">
                      <div className="font-headline-md text-headline-md text-primary">15k+</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Students</div>
                    </div>
                    <div className="text-center px-sm">
                      <div className="font-headline-md text-headline-md text-primary">45</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Active Clubs</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setView('dashboard')}
                    className="w-full md:w-auto bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg hover:bg-primary-fixed-dim transition-all duration-300 active:scale-95 flex items-center justify-center gap-xs shadow-[0_0_15px_rgba(200,92,104,0.4)] cursor-pointer"
                  >
                    View Dashboard <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Discover Other Colleges */}
          <section>
            <div className="flex justify-between items-end mb-lg">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Discover Other Colleges</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                  Expand your kinetic connections beyond your campus.
                </p>
              </div>
              <button
                onClick={() => navigate('/discover')}
                className="hidden md:flex text-primary font-label-md text-label-md items-center gap-xs hover:text-primary-fixed-dim transition-colors cursor-pointer"
              >
                View All <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {OTHER_COLLEGES.map(college => (
                <div
                  key={college.id}
                  className="bg-surface rounded-xl border border-outline-variant overflow-hidden hover:border-primary-container transition-colors duration-300 group"
                >
                  <div className="h-32 w-full relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('${college.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                  </div>
                  <div className="p-md relative">
                    <div className="absolute -top-10 right-md w-12 h-12 bg-surface rounded-lg border border-outline-variant flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-secondary">{college.icon}</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">{college.name}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs mb-md">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {college.location}
                    </p>
                    <button
                      onClick={() => navigate(`/college/${college.id}`)}
                      className="w-full bg-transparent border border-outline-variant text-on-surface font-label-md text-label-md py-sm rounded-lg hover:bg-surface-container-high transition-colors active:scale-95 cursor-pointer"
                    >
                      Explore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ── Dashboard view ──────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <div className="w-full bg-surface-container border-b border-outline-variant relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-primary-container to-transparent pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-xl relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-lg">
          <div className="flex items-center gap-lg">
            <div
              className="w-20 h-20 rounded-xl bg-surface border border-outline flex items-center justify-center p-sm shadow-lg shadow-primary-container/20 cursor-pointer"
              onClick={() => setView('overview')}
            >
              <span className="material-symbols-outlined text-4xl text-primary">account_balance</span>
            </div>
            <div className="flex flex-col gap-xs">
              <div className="flex items-center gap-sm">
                <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
                  GLA University
                </h1>
                <span className="px-sm py-base bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm flex items-center gap-base border border-on-secondary-fixed-variant">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    verified
                  </span>
                  Primary
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">Mathura, Uttar Pradesh • 15K+ Students</p>
            </div>
          </div>

          <div className="flex items-center gap-sm">
            <button
              onClick={() => setShowDirectory(true)}
              className="px-md py-sm bg-surface-variant text-on-surface rounded-lg font-label-md text-label-md border border-outline-variant hover:bg-surface-container-high transition-colors flex items-center gap-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              Directory
            </button>
            <button
              onClick={() => setShowInvite(true)}
              className="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed transition-colors flex items-center gap-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Invite
            </button>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex items-center gap-lg overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-sm font-label-md text-label-md relative transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab
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

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto w-full px-margin-mobile md:px-margin-desktop py-xl flex gap-lg items-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex w-full"
            >
              {activeTab === 'Feed' && <FeedTab />}
              {activeTab === 'Clubs' && <ClubsTab />}
              {activeTab === 'Events' && <EventsTab />}
              {activeTab === 'About' && <AboutTab />}
              {activeTab === 'Discussions' && <DiscussionsTab />}
            </motion.div>
          </AnimatePresence>

          {activeTab !== 'Discussions' && <RightSidebar />}
        </div>
      </div>

      {/* Directory Modal */}
      <Modal
        isOpen={showDirectory}
        onClose={() => {
          setShowDirectory(false);
          setDirectorySearch('');
        }}
        size="xl"
        ariaLabel="GLA University Directory"
      >
        <div className="w-full -m-lg">
          {/* Directory Header */}
          <div className="px-lg pt-lg pb-md border-b border-outline-variant/40">
            <div className="flex items-start justify-between gap-md">
              <div>
                <h2 className="font-headline-lg text-on-surface">
                  Directory
                </h2>
                <p className="font-body-sm text-on-surface-variant mt-xs">
                  GLA University
                </p>
              </div>

              <button
                onClick={() => {
                  setShowDirectory(false);
                  setDirectorySearch('');
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
                aria-label="Close directory"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-lg py-md">
            <div className="relative max-w-[560px] mx-auto">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                search
              </span>

              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search departments, people, or facilities..."
                className="w-full h-11 bg-surface-container-low border border-outline-variant rounded-full pl-12 pr-md text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Directory Content */}
          <div className="px-lg pb-lg">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-md">

              {/* Academic Departments */}
              <div className="bg-surface-container-low/60 border border-outline-variant rounded-xl p-lg">
                <div className="flex items-center gap-sm pb-md mb-md border-b border-outline-variant/40">
                  <div className="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">
                      school
                    </span>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-on-surface">
                      Academic Departments
                    </h3>
                    <p className="font-body-sm text-on-surface-variant">
                      Explore academic areas at GLA
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
                  {[
                    'Computer Science & Engineering',
                    'AI & Data Science',
                    'Mechanical Engineering',
                    'Electrical Engineering',
                    'Civil Engineering',
                    'Business Administration',
                    'Applied Sciences',
                    'Law & Humanities',
                  ]
                    .filter((department) =>
                      department
                        .toLowerCase()
                        .includes(directorySearch.toLowerCase())
                    )
                    .map((department) => (
                      <button
                        key={department}
                        className="text-left px-md py-sm rounded-lg text-body-sm text-on-surface hover:bg-surface-container-high hover:text-primary transition-colors cursor-pointer"
                      >
                        {department}
                      </button>
                    ))}

                  {[
                    'Computer Science & Engineering',
                    'AI & Data Science',
                    'Mechanical Engineering',
                    'Electrical Engineering',
                    'Civil Engineering',
                    'Business Administration',
                    'Applied Sciences',
                    'Law & Humanities',
                  ].filter((department) =>
                    department
                      .toLowerCase()
                      .includes(directorySearch.toLowerCase())
                  ).length === 0 && (
                      <p className="col-span-full py-md text-center text-body-sm text-on-surface-variant">
                        No departments found.
                      </p>
                    )}
                </div>
              </div>

              {/* Key Contacts */}
              <div className="bg-surface-container-low/60 border border-outline-variant rounded-xl p-lg">
                <div className="flex items-center gap-sm pb-md mb-md border-b border-outline-variant/40">
                  <div className="w-9 h-9 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">
                      contacts
                    </span>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-on-surface">
                      Key Contacts
                    </h3>
                    <p className="font-body-sm text-on-surface-variant">
                      Campus support
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-sm">
                  {[
                    {
                      title: 'Registrar Office',
                      subtitle: 'Academic administration',
                      icon: 'person',
                    },
                    {
                      title: 'Student Welfare',
                      subtitle: 'Student support',
                      icon: 'groups',
                    },
                    {
                      title: 'Examination Cell',
                      subtitle: 'Exams & results',
                      icon: 'assignment',
                    },
                    {
                      title: 'Campus Security',
                      subtitle: 'Emergency support',
                      icon: 'shield',
                    },
                  ]
                    .filter((contact) =>
                      `${contact.title} ${contact.subtitle}`
                        .toLowerCase()
                        .includes(directorySearch.toLowerCase())
                    )
                    .map((contact) => (
                      <button
                        key={contact.title}
                        className="flex items-center gap-sm p-sm rounded-lg text-left hover:bg-surface-container-high transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px] text-primary">
                            {contact.icon}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="font-label-md text-on-surface">
                            {contact.title}
                          </p>
                          <p className="font-body-sm text-on-surface-variant truncate">
                            {contact.subtitle}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Campus Facilities */}
            <div className="mt-md bg-surface-container-low/60 border border-outline-variant rounded-xl p-lg">
              <div className="flex items-center justify-between gap-md pb-md mb-md border-b border-outline-variant/40">
                <div className="flex items-center gap-sm">
                  <div className="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">
                      apartment
                    </span>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-on-surface">
                      Campus Facilities
                    </h3>
                    <p className="font-body-sm text-on-surface-variant">
                      Places and facilities around campus
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    window.open(
                      'https://www.google.com/maps/search/GLA+University+Mathura',
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                  className="hidden sm:flex items-center gap-xs text-primary font-label-sm hover:text-primary-fixed-dim transition-colors cursor-pointer"
                >
                  View Map
                  <span className="material-symbols-outlined text-[17px]">
                    open_in_new
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm">
                {[
                  {
                    name: 'Central Library',
                    icon: 'local_library',
                    detail: 'Books, journals & study spaces',
                    status: 'Open',
                  },
                  {
                    name: 'Advanced Tech Labs',
                    icon: 'science',
                    detail: 'Labs & technical facilities',
                    status: 'Open',
                  },
                  {
                    name: 'Sports Complex',
                    icon: 'sports_soccer',
                    detail: 'Indoor & outdoor sports',
                    status: 'Available',
                  },
                  {
                    name: 'Innovation Hub',
                    icon: 'lightbulb',
                    detail: 'Projects, startups & innovation',
                    status: 'Open',
                  },
                ]
                  .filter((facility) =>
                    `${facility.name} ${facility.detail}`
                      .toLowerCase()
                      .includes(directorySearch.toLowerCase())
                  )
                  .map((facility) => (
                    <div
                      key={facility.name}
                      className="bg-surface border border-outline-variant rounded-lg p-md hover:border-primary-container transition-colors"
                    >
                      <div className="flex items-start justify-between gap-sm">
                        <div className="w-9 h-9 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-[19px]">
                            {facility.icon}
                          </span>
                        </div>

                        <span className="px-xs py-[3px] rounded bg-secondary-container/30 text-secondary font-label-sm text-[10px]">
                          {facility.status}
                        </span>
                      </div>

                      <h4 className="font-label-md text-on-surface mt-md">
                        {facility.name}
                      </h4>

                      <p className="font-body-sm text-on-surface-variant mt-xs leading-relaxed">
                        {facility.detail}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invite Students"
        subtitle="Share this unique invite link with peers at GLA University."
        size="md"
        icon="person_add"
        iconVariant="primary"
      >
        <div className="flex flex-col gap-md w-full">
          <p className="font-body-sm text-on-surface-variant leading-relaxed">
            Anyone with this link can join the GLA University campus community on TRYBE and connect with students.
          </p>

          <div className="flex items-center gap-sm bg-surface-container-low border border-outline-variant rounded-lg p-sm w-full">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/college/gla-university?invite=gla2026`}
              className="flex-1 bg-transparent border-none text-body-sm text-on-surface focus:outline-none truncate min-w-0"
            />
            <button
              onClick={handleCopyInvite}
              className="bg-primary text-on-primary px-md py-xs rounded-md font-label-sm hover:opacity-90 transition-colors flex items-center gap-xs cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">{copiedLink ? 'check' : 'content_copy'}</span>
              {copiedLink ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}