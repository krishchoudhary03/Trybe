import type { CareerProfile, StudentProject } from '../types';

export interface MenteeSeed {
  id: string;
  name: string;
  college: string;
  location: string;
  skills: string[];
  interests: string[];
  projects: StudentProject[];
  career: Partial<CareerProfile> & Pick<CareerProfile, 'targetRoles'>;
  assessments: { skill: string; score: number; daysAgo: number }[];
  /** Roadmap hours already completed (tasks are completed in order until this is reached). */
  completedHours: number;
  /** How long ago the roadmap was generated — older plans have more overdue work. */
  generatedDaysAgo: number;
  applied: string[];
  sessions: { daysAgo: number; notes: string; actionItems: { title: string; done: boolean }[] }[];
}

/** Demo mentees for the Mentor Desk. They run through exactly the same engine as the signed-in student. */
export const MENTEE_SEEDS: MenteeSeed[] = [
  {
    id: 'mentee-rahul',
    name: 'Rahul Sharma',
    college: 'GLA University',
    location: 'Mathura, India',
    skills: ['Python', 'Machine Learning', 'Git', 'SQL'],
    interests: ['AI', 'Open Source'],
    projects: [
      { id: 'rs-1', title: 'Sentiment Analyzer', technologies: ['Python', 'scikit-learn'], skills: ['Machine Learning'] },
      { id: 'rs-2', title: 'Movie Recommender', technologies: ['Python', 'pandas'], skills: ['Machine Learning', 'Data Analysis'] },
    ],
    career: {
      targetRoles: ['ai-engineer'],
      targetIndustries: ['AI / ML'],
      experienceLevel: 'Intermediate',
      skillLevels: { Python: 82, 'Machine Learning': 70, Git: 68, SQL: 55 },
      weeklyLearningHours: 8,
      careerInterests: ['AI'],
    },
    assessments: [
      { skill: 'Python', score: 91, daysAgo: 24 },
      { skill: 'Machine Learning', score: 78, daysAgo: 12 },
    ],
    completedHours: 30,
    generatedDaysAgo: 30,
    applied: [],
    sessions: [
      {
        daysAgo: 21,
        notes: 'Reviewed the sentiment project. Needs a cleaner evaluation section.\n- Add a confusion matrix to the README\n- Start the deep learning module',
        actionItems: [
          { title: 'Add a confusion matrix to the README', done: true },
          { title: 'Start the deep learning module', done: false },
        ],
      },
    ],
  },
  {
    id: 'mentee-ananya',
    name: 'Ananya Verma',
    college: 'GLA University',
    location: 'Mathura, India',
    skills: ['HTML/CSS', 'JavaScript', 'React', 'Git', 'TypeScript', 'Figma'],
    interests: ['Design', 'Startups'],
    projects: [
      { id: 'av-1', title: 'Portfolio Site', technologies: ['React', 'TypeScript', 'Tailwind'], skills: ['Frontend'] },
      { id: 'av-2', title: 'Habit Tracker', technologies: ['React', 'JavaScript'], skills: ['UI/UX'] },
      { id: 'av-3', title: 'Campus Events UI', technologies: ['React', 'Figma'], skills: ['UI/UX'] },
    ],
    career: {
      targetRoles: ['frontend-developer'],
      targetIndustries: ['SaaS'],
      experienceLevel: 'Intermediate',
      skillLevels: { 'HTML/CSS': 85, JavaScript: 80, React: 82, Git: 72, TypeScript: 60, 'UI/UX Design': 70 },
      weeklyLearningHours: 10,
      careerInterests: ['Design'],
      certifications: [{ id: 'c-av-1', name: 'Frontend Foundations Certificate', skills: ['HTML/CSS', 'JavaScript'] }],
    },
    assessments: [
      { skill: 'React', score: 88, daysAgo: 15 },
      { skill: 'JavaScript', score: 84, daysAgo: 20 },
    ],
    completedHours: 18,
    generatedDaysAgo: 35,
    applied: ['opp-pixelcraft-frontend-intern', 'opp-bfb-fullstack-hack'],
    sessions: [
      {
        daysAgo: 9,
        notes: 'Great portfolio progress. Next: testing and a first internship application.\n- Add component tests to the portfolio\n- Apply to the Pixelcraft internship',
        actionItems: [
          { title: 'Add component tests to the portfolio', done: false },
          { title: 'Apply to the Pixelcraft internship', done: true },
        ],
      },
    ],
  },
  {
    id: 'mentee-dev',
    name: 'Dev Malhotra',
    college: 'Sanskriti University',
    location: 'Mathura, India',
    skills: ['Python', 'SQL'],
    interests: ['Data', 'Analytics'],
    projects: [],
    career: {
      targetRoles: ['data-scientist'],
      targetIndustries: ['Analytics'],
      experienceLevel: 'Beginner',
      skillLevels: { Python: 55, SQL: 45 },
      weeklyLearningHours: 5,
      careerInterests: ['Data'],
    },
    assessments: [
      { skill: 'Statistics', score: 41, daysAgo: 6 },
      { skill: 'Python', score: 72, daysAgo: 14 },
    ],
    completedHours: 6,
    generatedDaysAgo: 42,
    applied: [],
    sessions: [],
  },
];
