import type { CareerProfile } from '../types';

/**
 * Seed career profile for the demo user (used until they edit it). Skills, interests and
 * projects are NOT repeated here — they come from the existing TRYBE profile and Work data.
 */
export const DEFAULT_CAREER_PROFILE: CareerProfile = {
  targetRoles: ['full-stack-developer'],
  targetIndustries: ['Startups', 'SaaS'],
  experienceLevel: 'Beginner',
  skillLevels: { React: 72, TypeScript: 62, 'UI/UX Design': 68 },
  careerInterests: ['AI', 'Design', 'Open Source'],
  careerGoals: [{ id: 'goal-1', title: 'Land a full-stack internship this year' }],
  learningPreferences: { style: 'projects', pace: 'steady' },
  weeklyLearningHours: 8,
  opportunityPreferences: { workMode: 'any' },
  certifications: [],
};
