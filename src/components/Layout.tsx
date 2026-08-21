import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function Layout() {
  const location = useLocation();

  const {
    userProfile,
    toast,
    notifications,
    isAuthenticated,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNavClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);

    if (isActive) {
      return 'flex items-center gap-md px-md py-sm rounded-lg text-primary font-bold border-r-4 border-primary bg-secondary-container/10 hover:bg-surface-container-high transition-colors duration-200';
    }

    return 'flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors duration-200';
  };

  const getIconFill = (path: string) => {
    return location.pathname.startsWith(path) ? '1' : '0';
  };

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex selection:bg-primary-container selection:text-on-primary-container relative">

      {/* =========================================================
          TOAST
      ========================================================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="fixed top-5 right-5 z-[100] max-w-sm"
          >
            <div
              className={`px-md py-sm rounded-xl border shadow-2xl backdrop-blur-md flex items-center gap-sm text-body-sm font-label-md ${toast.type === 'error'
                  ? 'bg-error-container/90 border-error/50 text-on-error-container'
                  : toast.type === 'info'
                    ? 'bg-surface-container-high/90 border-outline/50 text-on-surface'
                    : 'bg-primary-container/90 border-primary/50 text-on-primary-container'
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {toast.type === 'error'
                  ? 'error'
                  : toast.type === 'info'
                    ? 'info'
                    : 'check_circle'}
              </span>

              <span>{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* =========================================================
          DESKTOP SIDEBAR
      ========================================================= */}
      <nav className="fixed left-0 top-0 h-screen w-64 border-r border-outline-variant bg-surface-container-lowest hidden md:flex flex-col py-lg px-md z-50">

        {/* Logo */}
        <Link to="/home" className="px-md mb-xl flex items-center gap-xs">
          <img src="/logo.png" alt="TRYBE" className="h-10 w-auto object-contain" />
        </Link>


        {/* Main Navigation */}
        <div className="flex-1 flex flex-col gap-sm overflow-y-auto scrollbar-hide">

          <Link className={getNavClass('/home')} to="/home">
            <span
              className="material-symbols-outlined text-xl"
              style={{
                fontVariationSettings: `"FILL" ${getIconFill('/home')}`,
              }}
            >
              grid_view
            </span>

            <span className="font-label-md text-label-md">
              Home
            </span>
          </Link>


          <Link className={getNavClass('/discover')} to="/discover">
            <span
              className="material-symbols-outlined text-xl"
              style={{
                fontVariationSettings: `"FILL" ${getIconFill('/discover')}`,
              }}
            >
              search
            </span>

            <span className="font-label-md text-label-md">
              Discover
            </span>
          </Link>


          <Link className={getNavClass('/college')} to="/college">
            <span
              className="material-symbols-outlined text-xl"
              style={{
                fontVariationSettings: `"FILL" ${getIconFill('/college')}`,
              }}
            >
              apartment
            </span>

            <span className="font-label-md text-label-md">
              My College
            </span>
          </Link>


          <Link className={getNavClass('/clubs')} to="/clubs">
            <span
              className="material-symbols-outlined text-xl"
              style={{
                fontVariationSettings: `"FILL" ${getIconFill('/clubs')}`,
              }}
            >
              hub
            </span>

            <span className="font-label-md text-label-md">
              Clubs
            </span>
          </Link>


          <Link className={getNavClass('/work')} to="/work">
            <span
              className="material-symbols-outlined text-xl"
              style={{
                fontVariationSettings: `"FILL" ${getIconFill('/work')}`,
              }}
            >
              work
            </span>

            <span className="font-label-md text-label-md">
              Work
            </span>
          </Link>

        </div>


        {/* =====================================================
            DESKTOP COMMUNICATION
        ===================================================== */}
        <div className="mt-lg px-xs flex flex-col gap-xs">

          {/* Notifications */}
          <Link
            to="/notifications"
            className={`${getNavClass('/notifications')} relative`}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{
                fontVariationSettings: `"FILL" ${getIconFill('/notifications')}`,
              }}
            >
              notifications
            </span>

            <span className="font-label-md text-label-md flex-1">
              Notifications
            </span>

            {unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>


          {/* Messages */}
          <Link
            to="/messages"
            className={getNavClass('/messages')}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{
                fontVariationSettings: `"FILL" ${getIconFill('/messages')}`,
              }}
            >
              chat_bubble
            </span>

            <span className="font-label-md text-label-md">
              Messages
            </span>
          </Link>

        </div>


        {/* =====================================================
            CREATE POST
        ===================================================== */}
        <div className="mt-md px-xs">
          <Link
            to="/home#create-post"
            className="w-full py-sm rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-secondary-container transition-colors shadow-[0_0_20px_rgba(125,64,71,0.4)] flex justify-center items-center"
          >
            Create Post
          </Link>
        </div>


        {/* =====================================================
            DESKTOP PROFILE / SETTINGS / HELP
        ===================================================== */}
        <div className="mt-lg flex flex-col gap-xs border-t border-outline-variant pt-sm">

          {/* Profile */}
          <Link
            className={getNavClass('/profile')}
            to="/profile"
          >
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-6 h-6 rounded-full object-cover border border-outline-variant"
            />

            <span className="font-label-md text-label-md truncate">
              {userProfile.name}
            </span>
          </Link>


          {/* Settings */}
          <Link
            className={getNavClass('/settings')}
            to="/settings"
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{
                fontVariationSettings: `"FILL" ${getIconFill('/settings')}`,
              }}
            >
              settings
            </span>

            <span className="font-label-md text-label-md">
              Settings
            </span>
          </Link>


          {/* Help */}
          <Link
            className={getNavClass('/help')}
            to="/help"
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{
                fontVariationSettings: `"FILL" ${getIconFill('/help')}`,
              }}
            >
              help_outline
            </span>

            <span className="font-label-md text-label-md">
              Help
            </span>
          </Link>

        </div>

      </nav>


      {/* =========================================================
          MOBILE TOP HEADER
      ========================================================= */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center h-16 px-margin-mobile">

        {/* Logo */}
        <Link
          to="/home"
          className="flex items-center gap-xs"
        >
          <img src="/logo.png" alt="TRYBE" className="h-8 w-auto object-contain" />
        </Link>


        {/* Right Actions */}
        <div className="flex items-center gap-xs">

          {/* Notification */}
          <Link
            to="/notifications"
            className="relative w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[24px]">
              notifications
            </span>

            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 bg-primary text-on-primary font-bold text-[9px] rounded-full flex items-center justify-center border-2 border-surface">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>


          {/* Chat */}
          <Link
            to="/messages"
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
            aria-label="Messages"
          >
            <span className="material-symbols-outlined text-[24px]">
              chat_bubble
            </span>
          </Link>


          {/* Profile */}
          <Link
            to="/profile"
            className="flex items-center justify-center rounded-full"
            aria-label="Profile"
          >
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-9 h-9 rounded-full border border-outline-variant object-cover"
            />
          </Link>

        </div>

      </header>


      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen bg-background relative overflow-hidden flex flex-col">

        <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-primary-container/5 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10 w-full h-full flex flex-col flex-1">
          <Outlet />
        </div>

      </main>


      {/* =========================================================
          MOBILE BOTTOM NAV
          PROFILE REMOVED
      ========================================================= */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface/90 backdrop-blur-xl border-t border-outline-variant z-50 px-margin-mobile py-xs flex justify-around items-center">

        {/* Home */}
        <Link
          className="flex flex-col items-center gap-base text-on-surface-variant hover:text-primary transition-colors p-xs"
          to="/home"
          aria-label="Home"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: `"FILL" ${getIconFill('/home')}`,
            }}
          >
            home
          </span>
        </Link>


        {/* Discover */}
        <Link
          className="flex flex-col items-center gap-base text-on-surface-variant hover:text-primary transition-colors p-xs"
          to="/discover"
          aria-label="Discover"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: `"FILL" ${getIconFill('/discover')}`,
            }}
          >
            explore
          </span>
        </Link>


        {/* College */}
        <Link
          className="flex flex-col items-center gap-base text-on-surface-variant hover:text-primary transition-colors p-xs"
          to="/college"
          aria-label="College"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: `"FILL" ${getIconFill('/college')}`,
            }}
          >
            school
          </span>
        </Link>


        {/* Clubs */}
        <Link
          className="flex flex-col items-center gap-base text-on-surface-variant hover:text-primary transition-colors p-xs"
          to="/clubs"
          aria-label="Clubs"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: `"FILL" ${getIconFill('/clubs')}`,
            }}
          >
            groups
          </span>
        </Link>


        {/* Work */}
        <Link
          className="flex flex-col items-center gap-base text-on-surface-variant hover:text-primary transition-colors p-xs"
          to="/work"
          aria-label="Work"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: `"FILL" ${getIconFill('/work')}`,
            }}
          >
            work
          </span>
        </Link>


        {/* Settings */}
        <Link
          className="flex flex-col items-center gap-base text-on-surface-variant hover:text-primary transition-colors p-xs"
          to="/settings"
          aria-label="Settings"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{
              fontVariationSettings: `"FILL" ${getIconFill('/settings')}`,
            }}
          >
            settings
          </span>
        </Link>

      </nav>

    </div>
  );
}