import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { userProfile, updateUserProfile, showToast } = useApp();
  const [selected, setSelected] = useState<string[]>(userProfile.interests || []);
  const [customInterest, setCustomInterest] = useState('');

  const toggleSelection = (topic: string) => {
    setSelected(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInterest.trim();
    if (trimmed && !selected.includes(trimmed)) {
      setSelected(prev => [...prev, trimmed]);
      setCustomInterest('');
    }
  };

  const handleFinish = () => {
    if (selected.length > 0) {
      updateUserProfile({ interests: selected });
    }
    showToast('Preferences saved! Welcome to your Home feed.');
    navigate('/home');
  };

  const topics = [
    { id: 'Software Engineering', label: 'Software Engineering', icon: 'code' },
    { id: 'AI & Machine Learning', label: 'AI & Machine Learning', icon: 'smart_toy' },
    { id: 'Data Science', label: 'Data Science', icon: 'data_object' },
    { id: 'UI/UX Design', label: 'UI/UX Design', icon: 'draw' },
    { id: 'Graphic Design', label: 'Graphic Design', icon: 'palette' },
    { id: 'Startups', label: 'Startups', icon: 'rocket_launch' },
    { id: 'Gaming', label: 'Gaming', icon: 'sports_esports' },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <div className="w-full h-1 bg-surface-container-high fixed top-0 left-0 z-50">
        <div className="h-full bg-primary w-2/3 shadow-[0_0_10px_#ffb2b9]"></div>
      </div>
      <main className="flex-1 flex flex-col items-center justify-center p-margin-desktop md:py-24">
        <div className="w-full max-w-[800px] flex flex-col gap-xl">
          <div className="flex flex-col gap-sm text-center">
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">Step 2 of 3</span>
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Which topics interest you?</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[512px] mx-auto">
              Select a few areas to personalize your Discover feed. The more you pick, the better your connections.
            </p>
          </div>

          <div className="flex flex-wrap gap-md justify-center mt-lg">
            {topics.map(topic => {
              const isSelected = selected.includes(topic.id);
              return (
                <button 
                  key={topic.id}
                  onClick={() => toggleSelection(topic.id)}
                  className={`px-6 py-3 rounded-full border border-outline-variant font-label-md transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-primary-container/20 border-primary text-primary shadow-[0_0_20px_rgba(125,64,71,0.4)] transform -translate-y-[2px]' 
                      : 'bg-surface text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined align-middle mr-2 text-[18px]" style={{ fontVariationSettings: `"FILL" ${isSelected ? 1 : 0}` }}>{topic.icon}</span>
                  {topic.label}
                </button>
              );
            })}
          </div>

          {/* Optional Other / Custom Category Input */}
          <form onSubmit={handleAddCustomInterest} className="flex gap-sm justify-center max-w-md mx-auto w-full mt-sm">
            <input
              type="text"
              value={customInterest}
              onChange={e => setCustomInterest(e.target.value)}
              placeholder="Add custom interest (e.g. Robotics, Music)..."
              className="flex-1 bg-surface-container-low border border-outline-variant rounded-full px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!customInterest.trim()}
              className="px-lg py-sm rounded-full bg-surface-container-high border border-outline-variant text-on-surface font-label-sm hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </form>

          {/* Selected chips display */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-xs justify-center max-w-lg mx-auto">
              {selected.map(s => (
                <span key={s} className="px-sm py-xs rounded-full bg-primary-container/20 border border-primary/40 text-primary text-[12px] flex items-center gap-xs">
                  {s}
                  <button onClick={() => toggleSelection(s)} className="hover:text-error">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="mt-xl flex items-center justify-between border-t border-outline-variant pt-lg">
            <button 
              onClick={() => {
                showToast('Onboarding skipped. You can update your interests anytime on your Profile.', 'info');
                navigate('/home');
              }} 
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2 cursor-pointer"
            >
              Skip for now
            </button>
            <div className="flex items-center gap-sm">
              <span className="font-body-sm text-body-sm text-on-surface-variant mr-4 hidden md:inline-block">{selected.length} selected</span>
              <button 
                onClick={handleFinish}
                disabled={selected.length === 0}
                className={`font-label-md text-label-md px-8 py-4 rounded-full transition-all duration-300 flex items-center group cursor-pointer ${
                  selected.length > 0 
                    ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(255,178,185,0.2)] hover:bg-primary-fixed'
                    : 'bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed'
                }`}
              >
                Next Step
                <span className="material-symbols-outlined ml-2 transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
