import { Link } from 'react-router-dom';

export function RightSidebar() {
  return (
    <aside className="hidden lg:flex flex-col gap-lg w-[320px] sticky top-24">
      {/* Top Clubs Widget */}
      <div className="bg-surface rounded-xl border border-outline-variant p-md flex flex-col gap-md">
        <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Top Clubs in GLA</h3>
        <div className="flex flex-col gap-sm">
          <Link to="/clubs/design-circle" className="flex items-center justify-between p-sm rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant group">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">palette</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Design Circle</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">850 Members</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">chevron_right</span>
          </Link>
          <Link to="/clubs/tech-society" className="flex items-center justify-between p-sm rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant group">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">terminal</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Tech Society</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">1.2K Members</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">chevron_right</span>
          </Link>
        </div>
        <Link to="/clubs" className="w-full block text-center py-sm text-primary font-label-md text-label-md hover:bg-surface-container-high rounded-lg transition-colors border border-outline-variant">
          View All Clubs
        </Link>
      </div>

      {/* Trending Widget */}
      <div className="bg-surface rounded-xl border border-outline-variant p-md flex flex-col gap-md">
        <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Trending in GLA</h3>
        <div className="flex flex-col gap-sm">
          <Link to="/home" className="flex flex-col gap-base cursor-pointer group">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Trending • Academics</span>
            <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">#MidSemPrep</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">420 posts</span>
          </Link>
          <Link to="/home" className="flex flex-col gap-base cursor-pointer group">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Trending • Sports</span>
            <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">#GLAInterHostel</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">215 posts</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
