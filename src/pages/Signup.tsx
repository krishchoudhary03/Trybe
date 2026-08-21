import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    signup(name, email);
    navigate('/onboarding');
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex items-center justify-center relative overflow-hidden py-xl">
      {/* Atmospheric Background */}
      <div 
        className="absolute inset-0 z-0 opacity-30 bg-cover bg-center mix-blend-screen" 
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNISUjRUPQeJlZt4x2GQa9ZXj4-cTyVcgwKDCRo3Dw_AcE0poSG52jG94PpcIOv0Ez4S8J2kR6gjAhDLw37rHgkz-BNh6JY8gwQJRQVkK54lqYWKA1PhfcJTWnWD0rYJylCUX5GaX2m0lZJupr1gQfRrpF8Wj6tKZrol2F2yyx0M3onm3Q5bwSQa6CrJ7NFrOPXcN55IBUaw9iElqGwutTr4qLNo2ut2dG0lhGeRvNVD4nZwH4WjDH')" }}
      ></div>
      
      {/* Radial Glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-container/10 via-background to-background pointer-events-none"></div>
      
      {/* Main Signup Card Container */}
      <main className="relative z-10 w-full max-w-[440px] px-margin-mobile md:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          className="bg-surface/70 backdrop-blur-2xl saturate-150 border border-outline-variant/50 rounded-xl p-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden"
        >
          {/* Close button */}
          <Link 
            to="/" 
            className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full w-8 h-8 flex items-center justify-center transition-all z-20"
            aria-label="Close and go back to home"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </Link>

          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-background via-primary-container to-background"></div>
          
          {/* Brand Header */}
          <header className="flex flex-col items-center mb-xl">
            <div className="mb-lg w-32 h-auto flex items-center justify-center">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPwO8jubVyMkgNylR2FO332JvpR1c-mAQIBwvs2-7jgxVQSLtA-by6oVysApIwAjY690ocToDBoy7bxHzPXu9cO7fpA1hHhd04VFgh-kQQHKf5W95a16vKVx6bmovGgTYmZebqDDUI7yiDcsN2nFUj7dlUgMuqjudx5yU1QRk6s2oHmKe75T1qL_6bEGyEb4zLN7_pWfxgu5suquoP5HHJQIaUjRieYsIhnOT-BAqx5U7sqABPekYc652GRi9kU3Kptg" alt="TRYBE Logo" className="w-full h-auto object-contain" />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-base text-center">Create an account</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center">Join your campus network and find your people.</p>
          </header>

          {error && (
            <div className="mb-md p-sm bg-error-container/40 border border-error/50 rounded-lg text-on-error-container font-body-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-md">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-xs" htmlFor="name">Full Name</label>
              <input 
                className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-lg px-md font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-on-surface-variant/50" 
                id="name" 
                name="name" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Morgan" 
                required 
                type="text" 
              />
            </div>

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-xs" htmlFor="email">Email or College ID</label>
              <input 
                className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-lg px-md font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-on-surface-variant/50" 
                id="email" 
                name="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@university.edu" 
                required 
                type="email" 
              />
            </div>

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-xs" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-lg pl-md pr-12 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-on-surface-variant/50" 
                  id="password" 
                  name="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? "text" : "password"} 
                />
                <button 
                  className="absolute right-0 top-0 h-full px-sm flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-xs" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <input 
                  className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-lg pl-md pr-12 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-on-surface-variant/50" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  type={showConfirmPassword ? "text" : "password"} 
                />
                <button 
                  className="absolute right-0 top-0 h-full px-sm flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none" 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="w-full h-12 mt-xs bg-secondary-container hover:bg-[#9b3141] text-on-secondary-container font-label-md text-label-md rounded-lg transition-colors flex items-center justify-center gap-2 relative group overflow-hidden border border-transparent hover:border-on-secondary-container/20 cursor-pointer" 
              type="submit"
            >
              <span className="relative z-10">Sign Up</span>
            </motion.button>

            <div className="flex items-center gap-sm my-xs opacity-70">
              <div className="h-px bg-outline-variant flex-1"></div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">or sign up with</span>
              <div className="h-px bg-outline-variant flex-1"></div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="w-full h-12 bg-surface-container-low border border-outline-variant hover:bg-surface-container hover:border-outline rounded-lg flex items-center justify-center gap-sm transition-colors text-on-surface font-label-md text-label-md group cursor-pointer" 
              type="button" 
              onClick={() => {
                signup('Alex Morgan', 'alex@university.edu');
                navigate('/onboarding');
              }}
            >
              <svg className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Google
            </motion.button>
          </form>

          <footer className="mt-xl text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Already have an account? 
              <Link to="/login" className="text-primary hover:text-primary-fixed transition-colors font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary ml-1">Log in</Link>
            </p>
          </footer>
        </motion.div>
      </main>
    </div>
  );
}
