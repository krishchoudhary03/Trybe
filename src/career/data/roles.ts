import type { CareerRole } from '../types';

export const CAREER_ROLES: CareerRole[] = [
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    summary: 'Build, evaluate and deploy machine-learning and LLM-powered products.',
    industries: ['AI / ML', 'SaaS', 'Research'],
    skills: [
      { skill: 'Python', target: 80, weight: 14, core: true },
      { skill: 'Machine Learning', target: 75, weight: 18, core: true },
      { skill: 'Deep Learning', target: 70, weight: 14 },
      { skill: 'RAG', target: 65, weight: 18, core: true },
      { skill: 'SQL', target: 60, weight: 8 },
      { skill: 'Git', target: 70, weight: 6 },
      { skill: 'Docker', target: 55, weight: 12 },
      { skill: 'Cloud', target: 50, weight: 10 },
    ],
    recommendedSkills: ['MLOps', 'Vector databases', 'Prompt evaluation'],
    phases: [
      { title: 'Python & Data Foundations', description: 'Solid Python, SQL and Git habits.', skills: ['Python', 'SQL', 'Git'] },
      { title: 'Machine Learning', description: 'Core supervised-learning workflow and evaluation.', skills: ['Machine Learning'] },
      { title: 'Deep Learning', description: 'Neural networks, training and fine-tuning.', skills: ['Deep Learning'] },
      { title: 'RAG / LLM Applications', description: 'Retrieval pipelines and LLM-powered apps.', skills: ['RAG'] },
      { title: 'Deployment', description: 'Containers and cloud deployment.', skills: ['Docker', 'Cloud'] },
    ],
  },
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    summary: 'Craft fast, accessible and polished user interfaces for the web.',
    industries: ['SaaS', 'E-commerce', 'Media'],
    skills: [
      { skill: 'HTML/CSS', target: 70, weight: 12, core: true },
      { skill: 'JavaScript', target: 75, weight: 18, core: true },
      { skill: 'TypeScript', target: 65, weight: 12 },
      { skill: 'React', target: 75, weight: 20, core: true },
      { skill: 'UI/UX Design', target: 55, weight: 8 },
      { skill: 'REST APIs', target: 55, weight: 8 },
      { skill: 'Testing', target: 50, weight: 10 },
      { skill: 'Git', target: 65, weight: 12 },
    ],
    recommendedSkills: ['Accessibility', 'Performance profiling', 'Design systems'],
    phases: [
      { title: 'Web Foundations', description: 'HTML, CSS, JavaScript and Git.', skills: ['HTML/CSS', 'JavaScript', 'Git'] },
      { title: 'Modern Frontend', description: 'TypeScript and React.', skills: ['TypeScript', 'React'] },
      { title: 'Design & Integration', description: 'Interfaces that connect to real APIs.', skills: ['UI/UX Design', 'REST APIs'] },
      { title: 'Quality', description: 'Testing for confidence.', skills: ['Testing'] },
    ],
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    summary: 'Design reliable APIs, data models and services.',
    industries: ['SaaS', 'Fintech', 'Infrastructure'],
    skills: [
      { skill: 'Node.js', target: 75, weight: 18, core: true },
      { skill: 'REST APIs', target: 75, weight: 16, core: true },
      { skill: 'SQL', target: 70, weight: 16, core: true },
      { skill: 'Git', target: 65, weight: 8 },
      { skill: 'Docker', target: 55, weight: 10 },
      { skill: 'System Design', target: 55, weight: 12 },
      { skill: 'Cloud', target: 50, weight: 8 },
      { skill: 'Testing', target: 55, weight: 12 },
    ],
    recommendedSkills: ['Caching', 'Message queues', 'Observability'],
    phases: [
      { title: 'Server Foundations', description: 'Node.js runtime and Git.', skills: ['Node.js', 'Git'] },
      { title: 'APIs & Data', description: 'Design APIs and model data.', skills: ['REST APIs', 'SQL'] },
      { title: 'Quality & Delivery', description: 'Tests and containers.', skills: ['Testing', 'Docker'] },
      { title: 'Scale', description: 'System design and cloud.', skills: ['System Design', 'Cloud'] },
    ],
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    summary: 'Turn raw data into models, experiments and decisions.',
    industries: ['Analytics', 'Healthcare', 'Finance'],
    skills: [
      { skill: 'Python', target: 75, weight: 14, core: true },
      { skill: 'Statistics', target: 70, weight: 18, core: true },
      { skill: 'SQL', target: 65, weight: 10 },
      { skill: 'Data Analysis', target: 75, weight: 16, core: true },
      { skill: 'Data Visualization', target: 60, weight: 12 },
      { skill: 'Machine Learning', target: 70, weight: 24, core: true },
      { skill: 'Git', target: 55, weight: 6 },
    ],
    recommendedSkills: ['Experiment design', 'Causal inference', 'Storytelling'],
    phases: [
      { title: 'Programming & Data Access', description: 'Python, SQL and Git.', skills: ['Python', 'SQL', 'Git'] },
      { title: 'Analysis', description: 'Statistics, analysis and visualisation.', skills: ['Statistics', 'Data Analysis', 'Data Visualization'] },
      { title: 'Modelling', description: 'Machine-learning workflow.', skills: ['Machine Learning'] },
    ],
  },
  {
    id: 'full-stack-developer',
    title: 'Full Stack Developer',
    summary: 'Own features end to end — from the UI to the database.',
    industries: ['Startups', 'SaaS', 'Agencies'],
    skills: [
      { skill: 'JavaScript', target: 70, weight: 12 },
      { skill: 'TypeScript', target: 60, weight: 8 },
      { skill: 'React', target: 70, weight: 16, core: true },
      { skill: 'Node.js', target: 70, weight: 16, core: true },
      { skill: 'REST APIs', target: 65, weight: 12, core: true },
      { skill: 'SQL', target: 60, weight: 12 },
      { skill: 'Git', target: 65, weight: 8 },
      { skill: 'Docker', target: 45, weight: 8 },
      { skill: 'Testing', target: 50, weight: 8 },
    ],
    recommendedSkills: ['Authentication', 'CI/CD', 'Caching'],
    phases: [
      { title: 'Core Web', description: 'JavaScript, TypeScript and Git.', skills: ['JavaScript', 'TypeScript', 'Git'] },
      { title: 'Frontend', description: 'Modern React applications.', skills: ['React'] },
      { title: 'Backend & Data', description: 'Servers, APIs and databases.', skills: ['Node.js', 'REST APIs', 'SQL'] },
      { title: 'Ship It', description: 'Containers and tests.', skills: ['Docker', 'Testing'] },
    ],
  },
];

export function getRole(id: string | undefined | null): CareerRole | null {
  if (!id) return null;
  return CAREER_ROLES.find(r => r.id === id) ?? null;
}

export function findRoleByText(text: string): CareerRole | null {
  const q = text.toLowerCase();
  return (
    CAREER_ROLES.find(r => q.includes(r.title.toLowerCase())) ??
    CAREER_ROLES.find(r => q.includes(r.title.toLowerCase().replace(' developer', ''))) ??
    null
  );
}
