import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Welcome() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col relative grid-bg">
      {/* Top Navigation */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/60 backdrop-blur-xl saturate-200 border-b border-outline-variant/50 px-margin-mobile md:px-margin-desktop flex justify-between items-center w-full shadow-[0_1px_10px_rgba(0,0,0,0.2)]"
      >
        <Link to="/" className="flex items-center gap-2">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZtp3WhxVzm5QPMZeaPXnBbw5s57BgM5w3JR8trCozkSa12_pOnJCyET8PlnMEoaluGRMP4Hy0MRL3wTujfl7OqWMzfx9MGcQuGtlD2dXo432WC6MEAXK-la1L88VZomwRvR1qDfozQM1WIRa4Qb5gTC7ChuZftgokgdb49tKitX5A0ETGaIO-IrteX2OZ87P5ixYsm9w4I8RhbRXOgTM2HUnBx3kyedu5Gok-Toc7kj0RM0nveqT1yX3IonwNnpMmiQ" alt="TRYBE Logo" className="h-8 w-auto object-contain" />
        </Link>
        <nav className="hidden md:flex items-center gap-lg">
          <button 
            onClick={() => scrollToSection('communities')} 
            className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-0 p-0"
          >
            Communities
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')} 
            className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-0 p-0"
          >
            How it works
          </button>
        </nav>
        <div className="flex items-center gap-md">
          <Link className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors hidden md:block" to="/login">Log in</Link>
          <Link to="/signup">
            <motion.div 
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="h-10 px-6 rounded-full bg-[#ffb2b9] text-[#541f26] font-label-md text-label-md flex items-center justify-center hover:opacity-90 transition-colors"
            >
              Get Started
            </motion.div>
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto w-full flex flex-col justify-center min-h-[calc(100vh-64px)] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl lg:gap-[80px] items-center">
          
          {/* Left Column: Copy & CTAs */}
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-lg z-20"
          >
            <h1 className="font-headline-xl text-[48px] leading-[1.1] md:text-[64px] lg:text-[72px] font-bold tracking-tighter text-on-surface">
              Find your <span className="text-primary">people.</span><br />
              Build your <span className="text-primary">future.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[512px] mt-xs mb-md leading-relaxed tracking-normal">
              Vibrant communities. Meaningful connections. Limitless opportunities. Discover clubs, events, and people who share your vibe on campus.
            </p>
            <div className="flex flex-col sm:flex-row gap-sm md:gap-md">
              <Link to="/signup">
                <motion.div 
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                  className="h-12 px-8 rounded-full bg-[#C85C68] text-background font-label-md text-label-md flex items-center justify-center glow-effect hover:bg-primary-container transition-colors"
                >
                  Get Started
                </motion.div>
              </Link>
              <button 
                onClick={() => scrollToSection('communities')}
                className="cursor-pointer"
              >
                <motion.div 
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                  className="h-12 px-8 rounded-full border border-outline-variant bg-transparent text-on-surface font-label-md text-label-md flex items-center justify-center hover:bg-surface-container-high transition-colors"
                >
                  Explore TRYBE
                </motion.div>
              </button>
            </div>
            
            {/* Trust Indicator */}
            <div className="mt-lg pt-md border-t border-outline-variant max-w-[448px] flex items-center gap-md">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-background object-cover" alt="Student 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK2lgwack0_r0JsxvDp8nlsA94J35fjqHylL7h_lF2hwcRScH_u8IYEFX1qUkP4fgbM0bN27d3J_0-eDXGUXgRE6gQn97vGHwefR2OF_9wNraq0mpwj_R43NW0OkKC6dZuKDt_rc0l7c48HfjUPXT4v61yrs1dpjJQtMmYQt_5n2hh8M4qjvHOUro5EBZmq3ve3_wLenK74Xtr1j6UY13VactT02Iy8ZNKHQAr0y0eaZxQP-xGoQpT" />
                <img className="w-10 h-10 rounded-full border-2 border-background object-cover" alt="Student 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQgk9klWSbs-AZjZ-7cbvtgmwB9KCrzU4jVxS85pCHC75piO_JOTfM551NUPdumZ7VHN5ZpdFmj8dTkl602EHVqDgOV5JP_0eL2xXdW67g2_qz3_e1Xrv6Z0cQf6ObH_6rWi8J2PT6DCG2I4xkPX6HMAj3qASstdE9_EDPw5MkZxGpDJqBtx6GCTAFvOIWokh9vQIeU2WxaMf2QgHE0_rQ2p3UqQQLvs-09HJo-igcKpodS-EQWTqy" />
                <img className="w-10 h-10 rounded-full border-2 border-background object-cover" alt="Student 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDneMw8EcVGKE_esn-lalCXN1KEFDcTp1NRy8PxSPp84_yqvSQUefwxF-lNFXTjKqK2xnMD_wdfZMe0PuqgyJx9IrUonu6NpMC9Ey2yP2tsB8CQ6efBTiy0zVf-1BU7MAO4tAeqTJyoMWBqdOfoHbLClBzD8W0MmuQ2Az73IhGfaNW3eN02zKc1elc3fPjFjIvkMoH4ThCm8sNRPumv3u39XLuDoBk3kECWdevIONeIW9s18FPQpuc" />
                <div className="w-10 h-10 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center text-xs font-bold text-on-surface">5k+</div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                Join 5,000+ students already<br />discovering their campus.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Visual Showcase */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.8, delay: 0.2 }}
            className="relative w-full h-[500px] lg:h-[600px] mt-xl lg:mt-0 perspective-1000"
          >
            {/* Abstract Glow Background */}
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full transform -translate-y-1/4 translate-x-1/4"></div>
            
            {/* Main Mockup Image */}
            <div className="absolute inset-0 z-20 flex items-center justify-center transform rotate-y-[-10deg] rotate-x-[5deg] scale-105 transition-transform duration-500 hover:rotate-0 hover:scale-110">
              <div className="w-full h-full max-w-[600px] rounded-xl border border-outline-variant bg-surface-container shadow-2xl overflow-hidden relative">
                {/* Mock Header */}
                <div className="h-10 border-b border-outline-variant bg-surface-container-lowest flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                  <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                  <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                </div>
                {/* Mock Content */}
                <div className="p-6 h-[calc(100%-40px)] flex flex-col gap-4 relative">
                  <div className="h-12 w-full bg-surface-container-high rounded-lg flex items-center px-4 justify-between">
                    <div className="w-1/3 h-4 bg-surface-variant rounded"></div>
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-1gp_XIaI8xasa4_VHGCqLqxZaKmZklpMF5eI28MEK9o6CmdTdtU8wiIT9QBP6vyE2pV__sGtPxnh80L1m3LhkQ9lzNg_2-PcsTuu29bwO4enhQkCiN5kpkpmvqarYNPkO5cTkPgMu6LY7PetHEc31WiePiG1nFVMgO4PCxyf-lXCIjOWaf5pQdwKE5CdJGpLXRLcvGvvH9DAyfr0Nwuv_UMk-AOE38AYitxWG6l_GFdkKPqJe9CudAMW5NJYMoQo0Q" alt="TRYBE Logo" className="w-8 h-8 rounded-full object-contain bg-surface-variant" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 h-full pb-4">
                    <div className="col-span-1 border-r border-outline-variant pr-4 flex flex-col gap-3">
                      <div className="h-8 w-3/4 bg-surface-variant rounded"></div>
                      <div className="h-8 w-full bg-primary/20 rounded border-l-2 border-primary"></div>
                      <div className="h-8 w-2/3 bg-surface-variant rounded"></div>
                      <div className="h-8 w-5/6 bg-surface-variant rounded"></div>
                    </div>
                    <div className="col-span-2 flex flex-col gap-4">
                      <div className="h-32 w-full bg-surface-container-high rounded-xl border border-outline-variant relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                      </div>
                      <div className="h-24 w-full bg-surface-container-high rounded-xl border border-outline-variant"></div>
                      <div className="h-24 w-full bg-surface-container-high rounded-xl border border-outline-variant"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-10 -left-10 z-30 w-48 p-4 rounded-xl border border-outline-variant/40 bg-surface-container/60 backdrop-blur-2xl saturate-150 shadow-2xl transform -rotate-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary">group</span>
                <span className="font-label-md text-label-md text-on-surface tracking-tight">Design Club</span>
              </div>
              <div className="text-xs text-on-surface-variant">Meeting today at 5PM</div>
            </motion.div>

            <motion.div 
              animate={{ y: [5, -5, 5] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
              className="absolute bottom-20 -right-5 z-30 w-56 p-4 rounded-xl border border-outline-variant/40 bg-surface-container/60 backdrop-blur-2xl saturate-150 shadow-2xl transform rotate-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">campaign</span>
                </div>
                <div>
                  <div className="font-label-md text-label-md text-on-surface tracking-tight">Tech Symposium</div>
                  <div className="text-xs text-primary mt-1">RSVP Open</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Row */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg pt-xl border-t border-outline-variant">
          <div className="flex flex-col gap-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant">
              <span className="material-symbols-outlined text-primary">hub</span>
            </div>
            <h3 className="font-label-md text-label-md text-on-surface uppercase">Connect</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Find people who share your exact interests and academic goals.</p>
          </div>
          <div className="flex flex-col gap-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant">
              <span className="material-symbols-outlined text-primary">forum</span>
            </div>
            <h3 className="font-label-md text-label-md text-on-surface uppercase">Collaborate</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Work together on projects, study sessions, and build amazing things.</p>
          </div>
          <div className="flex flex-col gap-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant">
              <span className="material-symbols-outlined text-primary">school</span>
            </div>
            <h3 className="font-label-md text-label-md text-on-surface uppercase">Learn</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Share knowledge, discover resources, and grow together.</p>
          </div>
          <div className="flex flex-col gap-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant">
              <span className="material-symbols-outlined text-primary">rocket_launch</span>
            </div>
            <h3 className="font-label-md text-label-md text-on-surface uppercase">Grow</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Level up your skills and find hidden campus opportunities.</p>
          </div>
        </div>
      </main>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto w-full border-t border-outline-variant/50 relative z-10">
        <div className="text-center max-w-[800px] mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-label-md uppercase tracking-wider block mb-2"
          >
            Welcome to TRYBE
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-headline-lg text-3xl md:text-5xl font-bold tracking-tight text-on-surface mb-6"
          >
            Connecting Campus Life Effortlessly
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-body-lg text-on-surface-variant leading-relaxed"
          >
            TRYBE brings together everything happening at your university. Say goodbye to scattered group chats, missed announcements, and disjointed events.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {[
            {
              step: "01",
              title: "Discover Your Vibe",
              desc: "Browse a curated collection of interest groups, campus clubs, and projects. Whether you are into deep learning, design thinking, or athletics, there's a space for you.",
              icon: "explore"
            },
            {
              step: "02",
              title: "Engage & Participate",
              desc: "Get real-time updates on discussions, study circles, and upcoming campus events. RSVP with one click and never miss an important opportunity.",
              icon: "forum"
            },
            {
              step: "03",
              title: "Grow & Build Together",
              desc: "Form teams for hackathons, share essential resources, showcase your work, and level up your leadership skills in student-run communities.",
              icon: "emoji_events"
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              whileHover={{ y: -8 }}
              className="bg-surface-container-low border border-outline-variant p-lg rounded-2xl flex flex-col gap-md transition-all duration-300 hover:border-[#ffb2b9]/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group"
            >
              <div className="flex justify-between items-center">
                <span className="text-body-sm font-bold text-primary">{item.step}</span>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-2xl">{item.icon}</span>
              </div>
              <h3 className="font-headline-sm text-xl font-semibold text-on-surface mt-sm">{item.title}</h3>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Communities Showcase Section */}
      <section id="communities" className="py-24 px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto w-full border-t border-outline-variant/50 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-md">
          <div>
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-primary font-label-md uppercase tracking-wider block mb-2"
            >
              Campus Clubs & Hubs
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-headline-lg text-3xl md:text-5xl font-bold tracking-tight text-on-surface"
            >
              Popular Communities
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/signup" className="px-md py-sm bg-surface-container-high border border-outline-variant rounded-full text-on-surface font-label-md hover:bg-[#C85C68] hover:text-background transition-all duration-300 inline-flex items-center gap-xs">
              Join TRYBE to Join <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {[
            {
              name: "Design Circle",
              category: "Arts & UI/UX",
              members: "8.1K members",
              desc: "Where pixels meet purpose. UI/UX designers, graphic artists, and product thinkers collaborating on design jams.",
              icon: "design_services",
              color: "from-purple-500/20 to-pink-500/20"
            },
            {
              name: "AI & Machine Learning Hub",
              category: "Tech & coding",
              members: "4.5K members",
              desc: "Building the future. Weekly workshops, kaggle competitions, and collaborative research projects on generative AI.",
              icon: "neurology",
              color: "from-blue-500/20 to-cyan-500/20"
            },
            {
              name: "Startup Incubator",
              category: "Entrepreneurship",
              members: "2.3K members",
              desc: "Turn your ideas into companies. Peer mentoring, pitch prep, and networking events with local venture capitalists.",
              icon: "rocket",
              color: "from-amber-500/20 to-orange-500/20"
            },
            {
              name: "Women in Tech (WIT)",
              category: "Diversity & Tech",
              members: "1.9K members",
              desc: "Empowering women in engineering and product. Mentorship groups, company visits, and career building sessions.",
              icon: "diversity_1",
              color: "from-rose-500/20 to-red-500/20"
            },
            {
              name: "Creative Writers Guild",
              category: "Literature",
              members: "980 members",
              desc: "A haven for wordsmiths. Weekly open mics, peer workshops, and publishing opportunities for students.",
              icon: "menu_book",
              color: "from-teal-500/20 to-emerald-500/20"
            },
            {
              name: "Athletics & Fitness Club",
              category: "Sports",
              members: "3.2K members",
              desc: "Run club, yoga circles, and outdoor adventures. Stay active, meet friends, and find training partners easily.",
              icon: "sports_gymnastics",
              color: "from-green-500/20 to-yellow-500/20"
            }
          ].map((club, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="bg-surface border border-outline-variant rounded-2xl overflow-hidden flex flex-col justify-between h-[250px] shadow-sm hover:border-[#ffb2b9]/40 hover:shadow-xl transition-all duration-300 relative group"
            >
              <div className={`h-2 bg-gradient-to-r ${club.color}`}></div>
              <div className="p-lg flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-xs">
                    <span className="text-body-xs font-bold text-primary uppercase tracking-wider">{club.category}</span>
                    <span className="text-body-xs text-on-surface-variant font-medium">{club.members}</span>
                  </div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-xs">
                    {club.name}
                    <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                  </h3>
                  <p className="text-body-sm text-on-surface-variant mt-sm line-clamp-3 leading-relaxed">{club.desc}</p>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/40 pt-md mt-md">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-lg">{club.icon}</span>
                    <span className="text-label-sm font-semibold uppercase tracking-wider">Public Club</span>
                  </div>
                  <Link to="/signup">
                    <span className="text-primary font-label-md text-label-md flex items-center gap-xs hover:gap-sm transition-all duration-300 cursor-pointer">
                      Explore Vibe <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant py-lg px-margin-mobile md:px-margin-desktop w-full relative z-10">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="flex items-center gap-2">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZtp3WhxVzm5QPMZeaPXnBbw5s57BgM5w3JR8trCozkSa12_pOnJCyET8PlnMEoaluGRMP4Hy0MRL3wTujfl7OqWMzfx9MGcQuGtlD2dXo432WC6MEAXK-la1L88VZomwRvR1qDfozQM1WIRa4Qb5gTC7ChuZftgokgdb49tKitX5A0ETGaIO-IrteX2OZ87P5ixYsm9w4I8RhbRXOgTM2HUnBx3kyedu5Gok-Toc7kj0RM0nveqT1yX3IonwNnpMmiQ" alt="TRYBE Logo" className="h-6 w-auto object-contain opacity-70" />
            <span className="text-body-sm text-on-surface-variant">© 2026 TRYBE. All rights reserved.</span>
          </div>
          <div className="flex gap-lg">
            <Link to="/privacy" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/contact" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
