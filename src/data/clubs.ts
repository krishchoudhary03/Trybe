import type { Club } from './types';

export const CLUBS: Club[] = [
  // ── GLA University ───────────────────────────────────────────
  {
    id: 'ai-ml-hub',
    title: 'AI & ML Hub',
    description:
      'A community for AI enthusiasts to learn, share, and build the future together. Weekly workshops on RAG, LLMs, and computer vision.',
    category: 'Technology',
    collegeId: 'gla-university',
    college: 'GLA University',
    members: 1500,
    icon: 'hub',
    tags: ['AI', 'Python', 'Machine Learning'],
    isTrending: true,
    president: 'Ananya Sharma',
    about:
      'The AI & ML Hub at GLA University is the go-to community for students passionate about artificial intelligence and machine learning. We host weekly workshops, hackathons, and guest lectures from industry professionals.',
  },
  {
    id: 'design-circle',
    title: 'Design Circle',
    description:
      'Where pixels meet purpose. Join UI/UX designers, graphic artists, and product thinkers to critique work and build portfolios.',
    category: 'Arts & Design',
    collegeId: 'gla-university',
    college: 'GLA University',
    members: 850,
    icon: 'design_services',
    tags: ['UX', 'Figma', 'Design Systems'],
    president: 'Marcus Thorne',
    about:
      'Design Circle is a creative community at GLA University for UI/UX designers, illustrators, and product thinkers. We host weekly design jams, critique sessions, and build portfolios together.',
  },
  {
    id: 'startup-founders',
    title: 'Startup Founders',
    description:
      'For builders and hustlers. Pitch ideas, find co-founders, and navigate the journey of building a company from zero to one.',
    category: 'Business',
    collegeId: 'gla-university',
    college: 'GLA University',
    members: 420,
    icon: 'rocket_launch',
    tags: ['Business', 'Pitching', 'Entrepreneurship'],
    president: 'Mike Ross',
    about:
      'Startup Founders club connects aspiring entrepreneurs at GLA University with resources, mentors, and co-founders to build the next big thing.',
  },
  {
    id: 'pythonistas',
    title: 'Pythonistas',
    description:
      'From basic scripts to complex backend architecture. Share code snippets, debug together, and explore Django and FastAPI.',
    category: 'Technology',
    collegeId: 'gla-university',
    college: 'GLA University',
    members: 680,
    icon: 'code',
    tags: ['Python', 'Backend', 'Data Science'],
    president: 'Sarah Chen',
    about:
      'Pythonistas is GLA\'s dedicated Python programming club. We cover everything from automation to advanced data science and web development with Django and FastAPI.',
  },
  {
    id: 'electronic-music',
    title: 'Electronic Music Prod',
    description:
      'Ableton, FL Studio, and Logic users unite. Share WIP tracks, discuss mixing techniques, and collaborate on synthwave projects.',
    category: 'Arts & Design',
    collegeId: 'gla-university',
    college: 'GLA University',
    members: 280,
    icon: 'album',
    tags: ['Audio', 'Music', 'Production'],
    president: 'Raj Verma',
    about: 'A creative community for music producers at GLA University. We collaborate on tracks and explore electronic music production.',
  },
  {
    id: 'sci-fi-literature',
    title: 'Sci-Fi Literature',
    description:
      'Exploring dystopian futures, cyberpunk realities, and space operas. Monthly book discussions and collaborative world-building sessions.',
    category: 'Social Impact',
    collegeId: 'gla-university',
    college: 'GLA University',
    members: 320,
    icon: 'menu_book',
    tags: ['Reading', 'Fiction', 'Writing'],
    president: 'Priya Mehta',
    about: 'The Sci-Fi Literature club at GLA explores speculative fiction through monthly discussions, writing workshops, and world-building sessions.',
  },

  // ── Amity Noida ──────────────────────────────────────────────
  {
    id: 'amity-robotics',
    title: 'Robotics Club',
    description: 'Building the future with hardware and code. Participate in national robotics competitions and IoT workshops.',
    category: 'Technology',
    collegeId: 'amity-noida',
    college: 'Amity Noida',
    members: 540,
    icon: 'precision_manufacturing',
    tags: ['Robotics', 'IoT', 'Hardware'],
    president: 'Rahul Singh',
    about: 'The Amity Robotics Club builds competitive robots and participates in national competitions. We work with Arduino, Raspberry Pi, and ROS.',
  },
  {
    id: 'amity-media-house',
    title: 'Media House',
    description: 'Campus journalism, photography, and video production. Tell stories that matter at Amity.',
    category: 'Arts & Design',
    collegeId: 'amity-noida',
    college: 'Amity Noida',
    members: 410,
    icon: 'camera',
    tags: ['Photography', 'Video', 'Journalism'],
    president: 'Nisha Gupta',
    about: 'Media House is Amity\'s student-run media organization covering campus events, producing video content, and running the college newsletter.',
  },

  // ── Sanskriti University ──────────────────────────────────────
  {
    id: 'sanskriti-dance',
    title: 'Dance Society',
    description: 'Classical and contemporary dance forms. Performances at inter-college fests and national competitions.',
    category: 'Sports',
    collegeId: 'sanskriti-university',
    college: 'Sanskriti University',
    members: 230,
    icon: 'music_note',
    tags: ['Dance', 'Classical', 'Contemporary'],
    president: 'Pooja Sharma',
    about: 'The Dance Society at Sanskriti University celebrates both classical Indian dance forms and contemporary styles through regular performances and workshops.',
  },
  {
    id: 'sanskriti-coding',
    title: 'Code Warriors',
    description: 'Competitive programming, hackathons, and open source contributions at Sanskriti University.',
    category: 'Technology',
    collegeId: 'sanskriti-university',
    college: 'Sanskriti University',
    members: 180,
    icon: 'terminal',
    tags: ['Competitive Programming', 'C++', 'Algorithms'],
    president: 'Arjun Mehta',
    about: 'Code Warriors trains students for competitive programming contests like ICPC and Codeforces. We focus on algorithms, data structures, and problem solving.',
  },

  // ── Delhi University ──────────────────────────────────────────
  {
    id: 'du-debate',
    title: 'DU Debate Society',
    description: 'Sharpen your arguments and public speaking. National MUN participation and parliamentary debates.',
    category: 'Social Impact',
    collegeId: 'delhi-university',
    college: 'Delhi University',
    members: 890,
    icon: 'forum',
    tags: ['Debate', 'MUN', 'Public Speaking'],
    president: 'Kavita Nair',
    about: 'Delhi University\'s premier debate society participates in MUNs and parliamentary debates at the national level, training students in argumentation and diplomacy.',
  },
  {
    id: 'du-entrepreneurship',
    title: 'DU Entrepreneurship Cell',
    description: 'The oldest E-Cell in DU. Annual startup conclave, mentorship programs, and seed funding support.',
    category: 'Business',
    collegeId: 'delhi-university',
    college: 'Delhi University',
    members: 1200,
    icon: 'lightbulb',
    tags: ['Startup', 'Business', 'Investment'],
    president: 'Rohan Kapoor',
    about: 'The DU Entrepreneurship Cell has been fostering startup culture since 2005. We connect student entrepreneurs with investors, mentors, and resources.',
  },
];

export function getClubById(id: string): Club | undefined {
  return CLUBS.find((c) => c.id === id);
}

export function getClubsByCollege(collegeId: string): Club[] {
  return CLUBS.filter((c) => c.collegeId === collegeId);
}
