import { useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import type { Project } from '../data/types';

const TECH_OPTIONS = ['React', 'TypeScript', 'Python', 'Flutter', 'Firebase', 'Node.js', 'Figma', 'FastAPI', 'LangChain', 'Raspberry Pi'];
const SKILL_OPTIONS = ['AI', 'UI/UX', 'Frontend', 'Backend', 'Mobile Development', 'Design', 'NLP', 'Machine Learning', 'Data Science'];
const PROJECT_TYPES: Project['projectType'][] = ['academic', 'personal', 'startup', 'research'];

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function Work() {
  const { projects, addProject, showToast, userProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'my_projects' | 'browse'>('my_projects');

  // Search + filter state (Browse tab)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'' | Project['projectType']>('');
  const [filterCampus, setFilterCampus] = useState<'' | 'in-campus' | 'off-campus'>('');

  // Requested projects state
  const [requestedProjects, setRequestedProjects] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('trybee_requested_projects');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleRequestToJoin = (projectId: string) => {
    setRequestedProjects(prev => {
      const next = new Set(prev).add(projectId);
      try {
        localStorage.setItem('trybee_requested_projects', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
    showToast('Join request sent to project owner!');
  };

  // Create project form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    technologies: '',
    skills: '',
    projectType: 'academic' as Project['projectType'],
    campusType: 'in-campus' as Project['campusType'],
    teamRequired: '2',
    deadline: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<typeof form>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const myProjects = projects.filter(p => p.ownerId === userProfile.username);
  const browseProjects = projects.filter(p => p.ownerId !== userProfile.username);

  const filteredBrowse = browseProjects.filter(p => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQ =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.technologies.some(t => t.toLowerCase().includes(q)) ||
      p.skills.some(s => s.toLowerCase().includes(q));
    const matchesType = !filterType || p.projectType === filterType;
    const matchesCampus = !filterCampus || p.campusType === filterCampus;
    return matchesQ && matchesType && matchesCampus;
  });

  const validateForm = (): boolean => {
    const errors: Partial<typeof form> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    if (!form.technologies.trim()) errors.technologies = 'At least one tech tag is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProject = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        title: form.title.trim(),
        description: form.description.trim(),
        ownerId: userProfile.username,
        ownerName: userProfile.name,
        technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        projectType: form.projectType,
        campusType: form.campusType,
        teamRequired: Math.max(1, parseInt(form.teamRequired) || 2),
        teamCurrent: 1,
        deadline: form.deadline || undefined,
        createdAt: new Date().toISOString(),
        isOwn: true,
      };
      addProject(newProject);
      setForm({
        title: '', description: '', technologies: '', skills: '',
        projectType: 'academic', campusType: 'in-campus', teamRequired: '2', deadline: '',
      });
      setFormErrors({});
      setIsSubmitting(false);
      setShowCreateForm(false);
      setActiveTab('my_projects');
    }, 300);
  };

  // ── Project Detail Modal ──────────────────────────────────────

  if (selectedProject) {
    return (
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-[800px] mx-auto p-margin-mobile md:p-margin-desktop">
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-xs text-on-surface-variant hover:text-on-surface transition-colors mb-lg font-label-md"
          >
            <span className="material-symbols-outlined">arrow_back</span> Back to Work
          </button>

          <div className="bg-surface border border-outline-variant rounded-xl p-xl flex flex-col gap-xl">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-headline-lg text-on-surface mb-xs">{selectedProject.title}</h1>
                <p className="font-body-sm text-on-surface-variant">By {selectedProject.ownerName}</p>
              </div>
              <div className="flex gap-sm">
                <span className={`px-sm py-xs rounded-full font-label-sm text-label-sm border ${
                  selectedProject.campusType === 'in-campus'
                    ? 'bg-surface-container-high text-on-surface border-outline-variant'
                    : 'bg-secondary-container/20 text-on-secondary-container border-secondary-container/30'
                }`}>
                  {selectedProject.campusType === 'in-campus' ? 'In-Campus' : 'Off-Campus'}
                </span>
                <span className="px-sm py-xs rounded-full bg-surface-container-high text-on-surface font-label-sm border border-outline-variant capitalize">
                  {selectedProject.projectType}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-label-md text-on-surface-variant uppercase tracking-wide mb-sm">Description</h3>
              <p className="font-body-md text-on-surface leading-relaxed">{selectedProject.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div>
                <h3 className="font-label-md text-on-surface-variant uppercase tracking-wide mb-sm">Technologies</h3>
                <div className="flex flex-wrap gap-xs">
                  {selectedProject.technologies.map(t => (
                    <span key={t} className="px-sm py-xs bg-surface-container-high rounded text-[11px] text-on-surface border border-outline-variant">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-label-md text-on-surface-variant uppercase tracking-wide mb-sm">Skills Needed</h3>
                <div className="flex flex-wrap gap-xs">
                  {selectedProject.skills.map(s => (
                    <span key={s} className="px-sm py-xs bg-primary-container/20 rounded text-[11px] text-primary border border-primary-container/30">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-md bg-surface-container-low rounded-xl p-md border border-outline-variant">
              <div>
                <p className="font-label-sm text-on-surface-variant">Team Size</p>
                <p className="font-headline-sm text-on-surface">
                  {selectedProject.teamCurrent}/{selectedProject.teamRequired}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant">Posted</p>
                <p className="font-label-md text-on-surface">{timeAgo(selectedProject.createdAt)}</p>
              </div>
              {selectedProject.deadline && (
                <div>
                  <p className="font-label-sm text-on-surface-variant">Deadline</p>
                  <p className="font-label-md text-on-surface">{new Date(selectedProject.deadline).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {selectedProject.ownerId !== userProfile.username && (
              <button 
                onClick={() => handleRequestToJoin(selectedProject.id)}
                disabled={requestedProjects.has(selectedProject.id)}
                className={`w-full py-md font-label-md rounded-lg transition-colors shadow-sm cursor-pointer ${
                  requestedProjects.has(selectedProject.id)
                    ? 'bg-surface-container-high text-on-surface-variant border border-outline-variant cursor-not-allowed'
                    : 'bg-primary text-on-primary hover:opacity-90'
                }`}
              >
                {requestedProjects.has(selectedProject.id) ? 'Request Pending ✓' : 'Request to Join'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto relative">
      <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-primary-container/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto p-margin-mobile md:p-margin-desktop relative z-10 flex flex-col lg:flex-row gap-xl items-start">
        <div className="flex-1 min-w-0 w-full">
          <header className="mb-xl">
            <h2 className="font-headline-xl text-on-background mb-sm">Work</h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl">
              Collaborate on projects, find team members, and build your portfolio with students on and off campus.
            </p>
          </header>

          <div className="flex gap-lg border-b border-outline-variant mb-xl">
            <button
              onClick={() => setActiveTab('my_projects')}
              className={`pb-2 px-2 font-label-md transition-all ${
                activeTab === 'my_projects' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              My Projects
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`pb-2 px-2 font-label-md transition-all ${
                activeTab === 'browse' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Browse Projects
            </button>
          </div>

          {/* ── MY PROJECTS ─────────────────────────────────────── */}
          {activeTab === 'my_projects' && (
            <div className="flex flex-col gap-xl">
              {/* Create Project */}
              {showCreateForm ? (
                <section className="bg-surface-container-low border border-outline-variant rounded-xl p-lg shadow-sm">
                  <div className="flex justify-between items-center mb-md">
                    <h3 className="font-headline-md text-on-background flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">add_circle</span> Create a New Project
                    </h3>
                    <button onClick={() => setShowCreateForm(false)} className="text-on-surface-variant hover:text-on-surface">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <form onSubmit={handleCreateProject} className="flex flex-col gap-md" noValidate>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
                      <div>
                        <label className="block font-label-md text-on-surface-variant mb-xs">
                          Project Title <span className="text-error">*</span>
                        </label>
                        <input
                          className={`w-full bg-surface border rounded-lg py-2 px-3 text-on-background focus:outline-none focus:border-primary transition-colors ${
                            formErrors.title ? 'border-error' : 'border-outline-variant'
                          }`}
                          placeholder="e.g. NextGen Robotics"
                          type="text"
                          value={form.title}
                          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        />
                        {formErrors.title && <p className="text-error text-[11px] mt-xs">{formErrors.title}</p>}
                      </div>
                      <div>
                        <label className="block font-label-md text-on-surface-variant mb-xs">Project Type</label>
                        <select
                          className="w-full bg-surface border border-outline-variant rounded-lg py-2 px-3 text-on-background focus:outline-none focus:border-primary capitalize"
                          value={form.projectType}
                          onChange={e => setForm(f => ({ ...f, projectType: e.target.value as Project['projectType'] }))}
                        >
                          {PROJECT_TYPES.map(t => (
                            <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-label-md text-on-surface-variant mb-xs">Location Type</label>
                        <select
                          className="w-full bg-surface border border-outline-variant rounded-lg py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                          value={form.campusType}
                          onChange={e => setForm(f => ({ ...f, campusType: e.target.value as Project['campusType'] }))}
                        >
                          <option value="in-campus">In-Campus</option>
                          <option value="off-campus">Off-Campus</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-label-md text-on-surface-variant mb-xs">Team Members Required</label>
                        <input
                          className="w-full bg-surface border border-outline-variant rounded-lg py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                          type="number"
                          placeholder="e.g. 3"
                          min="1"
                          max="20"
                          value={form.teamRequired}
                          onChange={e => setForm(f => ({ ...f, teamRequired: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-label-md text-on-surface-variant mb-xs">
                        Project Description <span className="text-error">*</span>
                      </label>
                      <textarea
                        className={`w-full bg-surface border rounded-lg py-2 px-3 text-on-background focus:outline-none focus:border-primary h-24 resize-none transition-colors ${
                          formErrors.description ? 'border-error' : 'border-outline-variant'
                        }`}
                        placeholder="Describe your project, goals, and what you're building..."
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      />
                      {formErrors.description && <p className="text-error text-[11px] mt-xs">{formErrors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                      <div>
                        <label className="block font-label-md text-on-surface-variant mb-xs">
                          Technologies <span className="text-error">*</span>
                          <span className="text-[11px] ml-xs">(comma-separated)</span>
                        </label>
                        <input
                          className={`w-full bg-surface border rounded-lg py-2 px-3 text-on-background focus:outline-none focus:border-primary transition-colors ${
                            formErrors.technologies ? 'border-error' : 'border-outline-variant'
                          }`}
                          placeholder="React, Python, Figma"
                          value={form.technologies}
                          onChange={e => setForm(f => ({ ...f, technologies: e.target.value }))}
                        />
                        {formErrors.technologies && <p className="text-error text-[11px] mt-xs">{formErrors.technologies}</p>}
                        <div className="flex flex-wrap gap-xs mt-xs">
                          {TECH_OPTIONS.map(t => (
                            <button
                              key={t} type="button"
                              onClick={() => setForm(f => ({
                                ...f,
                                technologies: f.technologies
                                  ? f.technologies.split(',').map(s => s.trim()).includes(t)
                                    ? f.technologies
                                    : `${f.technologies}, ${t}`
                                  : t
                              }))}
                              className="text-[10px] px-xs py-[2px] bg-surface-container-high border border-outline-variant rounded text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                            >
                              +{t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block font-label-md text-on-surface-variant mb-xs">
                          Skills Needed <span className="text-[11px] ml-xs">(comma-separated)</span>
                        </label>
                        <input
                          className="w-full bg-surface border border-outline-variant rounded-lg py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                          placeholder="Frontend, AI, Design"
                          value={form.skills}
                          onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                        />
                        <div className="flex flex-wrap gap-xs mt-xs">
                          {SKILL_OPTIONS.map(s => (
                            <button
                              key={s} type="button"
                              onClick={() => setForm(f => ({
                                ...f,
                                skills: f.skills
                                  ? f.skills.split(',').map(sk => sk.trim()).includes(s)
                                    ? f.skills
                                    : `${f.skills}, ${s}`
                                  : s
                              }))}
                              className="text-[10px] px-xs py-[2px] bg-surface-container-high border border-outline-variant rounded text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                            >
                              +{s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-label-md text-on-surface-variant mb-xs">
                        Deadline (Optional)
                      </label>
                      <input
                        className="w-full bg-surface border border-outline-variant rounded-lg py-2 px-3 text-on-background focus:outline-none focus:border-primary"
                        type="date"
                        value={form.deadline}
                        onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                      />
                    </div>

                    <div className="flex justify-end gap-sm mt-xs">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-lg py-2 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-high transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-xl py-2 rounded-lg bg-primary-container text-on-primary-container font-label-md hover:bg-secondary-container transition-all disabled:opacity-60 flex items-center gap-xs"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                            Creating...
                          </>
                        ) : 'Start Project'}
                      </button>
                    </div>
                  </form>
                </section>
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-sm px-lg py-sm bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-colors w-fit shadow-sm"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Create New Project
                </button>
              )}

              {/* My Projects List */}
              <section>
                <div className="flex items-center justify-between mb-md">
                  <h3 className="font-headline-md text-primary">My Projects ({myProjects.length})</h3>
                </div>
                {myProjects.length === 0 ? (
                  <div className="text-center py-12 text-on-surface-variant border border-outline-variant rounded-xl">
                    <span className="material-symbols-outlined text-4xl mb-4 block">work_off</span>
                    <p className="font-body-md">No projects yet. Create your first one!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                    {myProjects.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onView={() => setSelectedProject(project)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── BROWSE PROJECTS ────────────────────────────────── */}
          {activeTab === 'browse' && (
            <div className="flex flex-col gap-xl">
              {/* Search + Filters */}
              <div className="flex flex-col md:flex-row gap-md items-start md:items-center">
                <div className="relative flex-1 w-full">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by tech, skill, title..."
                    className="w-full bg-surface border border-outline-variant rounded-full py-sm pl-12 pr-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>
                <div className="flex gap-sm flex-wrap">
                  <select
                    className="bg-surface border border-outline-variant rounded-lg py-sm px-md font-label-sm text-on-surface focus:outline-none focus:border-primary"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value as '' | Project['projectType'])}
                  >
                    <option value="">All Types</option>
                    {PROJECT_TYPES.map(t => (
                      <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                  <select
                    className="bg-surface border border-outline-variant rounded-lg py-sm px-md font-label-sm text-on-surface focus:outline-none focus:border-primary"
                    value={filterCampus}
                    onChange={e => setFilterCampus(e.target.value as '' | 'in-campus' | 'off-campus')}
                  >
                    <option value="">All Locations</option>
                    <option value="in-campus">In-Campus</option>
                    <option value="off-campus">Off-Campus</option>
                  </select>
                  {(filterType || filterCampus) && (
                    <button
                      onClick={() => { setFilterType(''); setFilterCampus(''); }}
                      className="px-md py-sm text-primary font-label-sm hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {filteredBrowse.length === 0 ? (
                <div className="text-center py-16 text-on-surface-variant border border-outline-variant rounded-xl">
                  <span className="material-symbols-outlined text-4xl mb-4 block">search_off</span>
                  <p className="font-body-md">No projects found.</p>
                  <button onClick={() => { setSearchQuery(''); setFilterType(''); setFilterCampus(''); }} className="mt-4 text-primary font-label-md hover:underline">
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                  {filteredBrowse.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onView={() => setSelectedProject(project)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reusable Project Card ──────────────────────────────────────

function ProjectCard({ project, onView }: { project: Project; onView: () => void; key?: string }) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col gap-md hover:border-primary/50 transition-all">
      <div>
        <h4 className="font-headline-md text-on-background line-clamp-1 mb-xs">{project.title}</h4>
        <p className="font-body-sm text-on-surface-variant line-clamp-2">{project.description}</p>
      </div>
      {project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-xs">
          {project.technologies.slice(0, 3).map(t => (
            <span key={t} className="px-2 py-1 bg-surface-container-highest rounded text-[10px] text-on-surface border border-outline-variant/50">
              {t}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="px-2 py-1 bg-surface-container-highest rounded text-[10px] text-on-surface-variant">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between mt-auto pt-sm border-t border-outline-variant/50">
        <span className={`px-2 py-1 rounded font-label-sm text-label-sm ${
          project.campusType === 'in-campus'
            ? 'bg-surface-container-high text-on-surface-variant'
            : 'bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30'
        }`}>
          {project.campusType === 'in-campus' ? 'In-Campus' : 'Off-Campus'}
        </span>
        <div className="flex items-center gap-sm">
          <span className="text-on-surface-variant text-label-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">group</span>
            {project.teamCurrent}/{project.teamRequired}
          </span>
          <button
            onClick={onView}
            className="text-primary font-label-sm hover:underline"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
