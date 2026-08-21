import type { College } from './types';

export const COLLEGES: College[] = [
  {
    id: 'gla-university',
    name: 'GLA University',
    location: 'Mathura, Uttar Pradesh',
    city: 'Mathura',
    state: 'Uttar Pradesh',
    icon: 'account_balance',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGxytKOaHObzqo9XfI7c2kw2SgDayFpE5scvrXJFd_ir6J0zUkbngQXVPmovaGG9ec-LPRFuCu3rwf_mff3HXDK4hkkSbBzJR29yR2h2uJkAMHKtpf3skUNU4HZSSdogHOQJm8WAYrB4b2XGVoH65K3_U5wpeOBOfzstEES9U4fOEy5PNZ-d0eZ7VEhQRxvOG0o7b14EeXRcgYPzyEYbHMdwfvVIaMImyncySiaSpJuUJS4XGcJL0x',
    students: '15k+',
    activeClubs: 45,
    isPrimary: true,
    about:
      'GLA University is a premier educational institution dedicated to fostering innovation, academic excellence, and holistic student development. Located in the cultural heart of Mathura, Uttar Pradesh, our sprawling campus provides a vibrant and modern ecosystem for learning and growth.',
    facilities: ['Advanced Tech Labs', 'Central Library', 'Sports Complex', 'Innovation Hub'],
  },
  {
    id: 'amity-noida',
    name: 'Amity Noida',
    location: 'Noida, Uttar Pradesh',
    city: 'Noida',
    state: 'Uttar Pradesh',
    icon: 'apartment',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB3wsgg3ugTML72b09BQgk7F-91ikXYxv5mdxCSGDipTBGB9b_2W7JFphoAFEsbxiAYR_93MvEInvD6Nn6uFmz6L1m9lmO-tDtqf3F_m2dWj5Yhpn4RJxvYqG5XoZbYSRw7pdkrY61Kv0nKynTMfrujausrkqZs29m1a1ZdP8i10SMgV-tp0NAWj_gFUaRcH24IE1v8ZK2i0dMOstcEfYJDKh3zvlIsXVz-vvStyHhWEII-E0aygaLS',
    students: '20k+',
    activeClubs: 60,
    isPrimary: false,
    about:
      'Amity University Noida is one of India\'s leading private universities, renowned for its world-class infrastructure, industry connections, and vibrant campus life. Located in the heart of the NCR region, Amity offers a dynamic environment for students to grow academically and professionally.',
    facilities: ['Research Centers', 'Media Labs', 'Business Incubator', 'Auditoriums'],
  },
  {
    id: 'sanskriti-university',
    name: 'Sanskriti University',
    location: 'Mathura, Uttar Pradesh',
    city: 'Mathura',
    state: 'Uttar Pradesh',
    icon: 'school',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQj0GYizuJa0h-168_gN9YwT3JC36nQszeVelj6smecHfPuVQxF1u0q-KR0wsWHM9jAWpjTZjvyzINwehaxCCJzId9AFmX4ZmMQ0IxarkGeOp9teAGCccNMW99GAe74jmByjOfmi5Cs9AVK2mEnPwUi4fqvn9SWe4hxvQFKTOQGjq_SRRolbzM-rO5CRCQ4H1ytk1nVESp9FcYKT__SZobfWUqtWzypnNHI3uRKXkdyIQWj97eTVDe',
    students: '8k+',
    activeClubs: 28,
    isPrimary: false,
    about:
      'Sanskriti University, Mathura is a dynamic institution committed to blending traditional values with modern education. With a focus on holistic development, the university provides students with an enriching academic and extracurricular experience.',
    facilities: ['Cultural Center', 'Science Labs', 'Digital Library', 'Sports Fields'],
  },
  {
    id: 'delhi-university',
    name: 'Delhi University',
    location: 'New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    icon: 'domain',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAyD-eQbpi9gtB5-2-BBjF3FOcjwD62YY6iwDcSYia7iFJINjeBcutz2T59L-MKyPQMgjUCAdLKOHuiwrjpYxTOoPNxc1a0jVVg_mRdCxkk9FTeULeMG3OfieTn1sa6MrY49rSfRgzZHDL1oOmBsM-Bm8bK5RbaNM5xKotLyyxiGF6f3IX7id_RDJ-4KpRwFaUJ8EBd3Y5J27vegoGSUMj46sb6iOC6KHXi61AbOXxKZdb_AZsLRArJ',
    students: '300k+',
    activeClubs: 200,
    isPrimary: false,
    about:
      'The University of Delhi, established in 1922, is one of the premier universities of the world with its diverse range of courses and a large student population. DU is known for its academic rigor, vibrant college culture, and distinguished alumni.',
    facilities: ['Multiple Colleges', 'Central Library', 'North Campus', 'South Campus'],
  },
];

export function getCollegeById(id: string): College | undefined {
  return COLLEGES.find((c) => c.id === id);
}

export const PRIMARY_COLLEGE_ID = 'gla-university';
