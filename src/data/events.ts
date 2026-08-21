import type { Event } from './types';

export const EVENTS: Event[] = [
  // ── GLA University ───────────────────────────────────────────
  {
    id: 'gla-ai-showcase',
    title: 'AI & Machine Learning Hub: Fall Showcase',
    description:
      'Join us for our annual fall showcase where students present their AI projects, research papers, and demos. Featuring guest speakers from top tech companies.',
    date: 'Today',
    time: '7:00 PM',
    location: 'Main Auditorium, GLA University',
    collegeId: 'gla-university',
    clubId: 'ai-ml-hub',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
    isFeatured: true,
    hostName: 'AI & ML Hub',
  },
  {
    id: 'gla-python-workshop',
    title: 'Pythonistas Data Science & Scripts Workshop',
    description:
      'Hands-on workshop covering pandas, numpy, and matplotlib. Bring your laptop and work through real-world data science problems.',
    date: 'Tomorrow',
    time: '5:00 PM',
    location: 'Computer Lab 4, Block A',
    collegeId: 'gla-university',
    clubId: 'pythonistas',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCYroVOs_L8-OFHEcT0YTfRTsVXesHXiQImGZAae9rMbERbiiM_RLwi0frvb2kOghvrLnDq439oF56_R7KHphVwD2PBtixKbMjVZZ0J-4-NeDG_ZaT_DIbuuSGXa2LM4f4QgZMf7larpWPrbSdZHcMGZgQMrKbNmLnl9Jjt1A2t-gdUf2wyqnvuKdrhzHAqaUrmHQT-09xQKLTHHW2q8slGXDF9eHwi9eagwDtT9a7cfd747tuK_7MT',
    isFeatured: false,
    hostName: 'Sarah Chen',
    hostAvatar:
      'https://lh3.googleusercontent.com/aida/AP1WRLsqe0P27_ZN0NGElJkl4B0ZIv-WAk7WGAyvi7A3R4IMk4LVuLhV7nQVmSGCTwyqqkXzMauJjN1L5jhFyqQDAogLl6tzRsFXD75rwOyot6ttAcqBPAMTPnbmFpX-oB8LFpbwajspy5Io93EfwrPOHeXAVWuDojxzDFoZSUf-lWemoEmMW9nEmxwEtwU9wOKYcIGSTjSOiZOhfZpFMDglZtX8pe8UgEcoWzeE83Y21BUXL-rp59fJJfrHSjs',
  },
  {
    id: 'gla-hackathon-info',
    title: 'Upcoming Hackathon Info Session',
    description:
      'Get all the details about our 36-hour campus hackathon. Learn about themes, judging criteria, prizes, and team formation.',
    date: 'Friday',
    time: '3:00 PM',
    location: 'Seminar Hall, Block B',
    collegeId: 'gla-university',
    clubId: 'startup-founders',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDXBEY3_VBZ5EI7ofKjLxW0QHpUwT9dG_L5ryGUqn32TV25x_wVw7cWAeJ5VvdRyXWt5wlIbZ942B6UM1WE2F6QnoVixt3C9irFn9ndRvUvR0srobO4fRqOijclVRs1bw8LACxGLx6VvFNZh-W28CcXH03ad1hPPjlxvDweQlDQRbgGnDvxGjKSTTceZcu4L9DYa43uw-Pg9C0XNjN8D2OSTVTUMP1YyGIlrk_YMbVr4xqwzjPUP_DO',
    isFeatured: false,
    hostName: 'Mike Ross',
    hostAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC2nQwR4CvaLVEqrjqSgKzb5ZbIcojs8UmpKw3XA5Iz3zdNSx7zF_J6ZPA0k26KVFug6VcAW9pXIkAtmDhVImm2PUkAlRldtQI-KDck6kgXYGFu6V3Bsds7QH2mqzeUZO8BmpdEN0cCBpb4dBwVPgT-wWKMtvd5SlCKiBR2JAbBt3qKo_iMKlFslNwABURC-o0x2K7lybCdOtxwALTMcsTC02I5jsd5s0Hf5H-PQWlPghmSx8ow9rKN',
  },
  {
    id: 'gla-design-jam',
    title: 'Design Circle: Weekly UI/UX Teardown',
    description:
      'Bring your latest designs for community critique. This week\'s theme: onboarding flows. All skill levels welcome.',
    date: 'Saturday',
    time: '4:00 PM',
    location: 'Design Studio, Arts Block',
    collegeId: 'gla-university',
    clubId: 'design-circle',
    isFeatured: false,
    hostName: 'Marcus Thorne',
  },

  // ── Amity Noida ──────────────────────────────────────────────
  {
    id: 'amity-robotics-comp',
    title: 'Robo Wars: Inter-College Robotics Competition',
    description:
      'Amity\'s annual robotics competition. Register your team and compete in line following, maze solving, and combat categories.',
    date: 'Next Week',
    time: '10:00 AM',
    location: 'Amity Robotics Arena',
    collegeId: 'amity-noida',
    clubId: 'amity-robotics',
    isFeatured: true,
    hostName: 'Robotics Club',
  },
  {
    id: 'amity-media-workshop',
    title: 'Media Production Masterclass',
    description:
      'Learn professional video editing and storytelling techniques from industry experts at this full-day workshop.',
    date: 'Next Saturday',
    time: '9:00 AM',
    location: 'Amity Media Center',
    collegeId: 'amity-noida',
    clubId: 'amity-media-house',
    isFeatured: false,
    hostName: 'Nisha Gupta',
  },

  // ── Sanskriti University ──────────────────────────────────────
  {
    id: 'sanskriti-cultural-fest',
    title: 'Rang Utsav: Annual Cultural Festival',
    description:
      'Sanskriti\'s flagship cultural festival featuring dance, music, drama, and art competitions from colleges across UP.',
    date: 'Next Month',
    time: '11:00 AM',
    location: 'Main Campus Grounds',
    collegeId: 'sanskriti-university',
    isFeatured: true,
    hostName: 'Student Council',
  },

  // ── Delhi University ──────────────────────────────────────────
  {
    id: 'du-mun-conference',
    title: 'DU National MUN Conference 2026',
    description:
      'One of Delhi\'s largest Model United Nations conferences. Register as a delegate or join as an observer. Debate global policy challenges.',
    date: 'Next Month',
    time: '9:00 AM',
    location: 'Convention Center, North Campus',
    collegeId: 'delhi-university',
    clubId: 'du-debate',
    isFeatured: true,
    hostName: 'DU Debate Society',
  },
];

export function getEventById(id: string): Event | undefined {
  return EVENTS.find((e) => e.id === id);
}

export function getEventsByCollege(collegeId: string): Event[] {
  return EVENTS.filter((e) => e.collegeId === collegeId);
}

export function getEventsByClub(clubId: string): Event[] {
  return EVENTS.filter((e) => e.clubId === clubId);
}
