-- ============================================================================
-- 019_seed.sql
-- Production Seed Reference Data for TRYBE (Colleges, Clubs, Skills, Roles, Opportunities)
-- Safe & Idempotent (ON CONFLICT DO NOTHING / UPDATE)
-- Uses 100% Valid Hexadecimal UUIDs (0-9, a-f)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. COLLEGES SEED DATA (Prefix: c000...)
-- ----------------------------------------------------------------------------
INSERT INTO public.colleges (id, name, short_name, university, location_city, location_state, location_country, description, website, established_year, is_verified)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Indian Institute of Technology Bombay', 'IIT Bombay', 'Autonomous', 'Mumbai', 'Maharashtra', 'India', 'Premier engineering and research institute in Powai, Mumbai.', 'https://www.iitb.ac.in', 1958, true),
  ('c0000000-0000-0000-0000-000000000002', 'Indian Institute of Technology Delhi', 'IIT Delhi', 'Autonomous', 'New Delhi', 'Delhi', 'India', 'Leading technical university located in Hauz Khas, Delhi.', 'https://home.iitd.ac.in', 1961, true),
  ('c0000000-0000-0000-0000-000000000003', 'Birla Institute of Technology and Science, Pilani', 'BITS Pilani', 'Deemed University', 'Pilani', 'Rajasthan', 'India', 'Pioneering private higher education and research institute.', 'https://www.bits-pilani.ac.in', 1964, true),
  ('c0000000-0000-0000-0000-000000000004', 'National Institute of Technology Tiruchirappalli', 'NIT Trichy', 'Autonomous', 'Tiruchirappalli', 'Tamil Nadu', 'India', 'Top ranked NIT known for engineering and technological innovations.', 'https://www.nitt.edu', 1964, true),
  ('c0000000-0000-0000-0000-000000000005', 'RV College of Engineering', 'RVCE', 'VTU Autonomous', 'Bengaluru', 'Karnataka', 'India', 'Prominent engineering college in the silicon valley of India.', 'https://www.rvce.edu.in', 1963, true)
ON CONFLICT (name) DO UPDATE
SET
  short_name = EXCLUDED.short_name,
  location_city = EXCLUDED.location_city,
  location_state = EXCLUDED.location_state,
  website = EXCLUDED.website;


-- ----------------------------------------------------------------------------
-- 2. CANONICAL SKILLS SEED DATA (Prefix: a000...)
-- ----------------------------------------------------------------------------
INSERT INTO public.skills (id, name, category, description, is_canonical)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'TypeScript', 'Programming Language', 'Typed superset of JavaScript providing static type definitions.', true),
  ('a0000000-0000-0000-0000-000000000002', 'React', 'Frontend Framework', 'Declarative UI library for building component-driven web applications.', true),
  ('a0000000-0000-0000-0000-000000000003', 'Node.js', 'Backend Runtime', 'JavaScript runtime built on Chrome''s V8 engine for server-side logic.', true),
  ('a0000000-0000-0000-0000-000000000004', 'PostgreSQL', 'Database', 'Powerful, open-source object-relational database system.', true),
  ('a0000000-0000-0000-0000-000000000005', 'Python', 'Programming Language', 'Versatile programming language widely used for AI/ML, backend, and scripts.', true),
  ('a0000000-0000-0000-0000-000000000006', 'Docker', 'DevOps & Tooling', 'Containerization platform to package software into standardized units.', true),
  ('a0000000-0000-0000-0000-000000000007', 'Machine Learning', 'AI & Data Science', 'Algorithms and statistical models that systems use to perform tasks without explicit instructions.', true),
  ('a0000000-0000-0000-0000-000000000008', 'System Design', 'Architecture', 'Designing high-scale, fault-tolerant distributed software architectures.', true),
  ('a0000000-0000-0000-0000-000000000009', 'Git', 'DevOps & Tooling', 'Distributed version control system tracking changes in source code.', true),
  ('a0000000-0000-0000-0000-000000000010', 'Tailwind CSS', 'Frontend Framework', 'Utility-first CSS framework for rapid UI development.', true),
  ('a0000000-0000-0000-0000-000000000011', 'PyTorch', 'AI & Data Science', 'Deep learning framework facilitating transition from research prototyping to deployment.', true),
  ('a0000000-0000-0000-0000-000000000012', 'AWS', 'Cloud Infrastructure', 'Comprehensive cloud computing platform providing compute, storage, and database services.', true)
ON CONFLICT (name) DO NOTHING;

-- Skill Aliases
INSERT INTO public.skill_aliases (skill_id, alias)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'TS'),
  ('a0000000-0000-0000-0000-000000000002', 'React.js'),
  ('a0000000-0000-0000-0000-000000000002', 'ReactJS'),
  ('a0000000-0000-0000-0000-000000000004', 'Postgres'),
  ('a0000000-0000-0000-0000-000000000005', 'Python3'),
  ('a0000000-0000-0000-0000-000000000007', 'ML')
ON CONFLICT (alias) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 3. CAREER ROLES SEED DATA (Prefix: d000...)
-- ----------------------------------------------------------------------------
INSERT INTO public.career_roles (id, title, slug, summary, description, industries, experience_level, growth_outlook)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'Full-Stack Developer',
    'full-stack-developer',
    'Designs and builds responsive client-side web apps and high-throughput backend services.',
    'Full-Stack Developers manage end-to-end web workflows including frontend interfaces, backend APIs, relational databases, and cloud deployments.',
    ARRAY['SaaS', 'FinTech', 'E-Commerce', 'EdTech'],
    'intermediate',
    'High Demand'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'AI / Machine Learning Engineer',
    'ai-ml-engineer',
    'Builds predictive models, neural architectures, and integrates generative AI into scalable pipelines.',
    'Focuses on feature engineering, model training, evaluation, quantization, and LLM inference optimization.',
    ARRAY['Artificial Intelligence', 'HealthTech', 'Autonomous Systems', 'FinTech'],
    'intermediate',
    'Exponential Growth'
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'Cloud / DevOps Engineer',
    'cloud-devops-engineer',
    'Architects cloud infrastructure, CI/CD pipelines, container orchestration, and security reliability.',
    'Specializes in containerization, observability, infrastructure-as-code, and resilient automated deployment.',
    ARRAY['Cloud Infrastructure', 'Enterprise Software', 'Cybersecurity'],
    'intermediate',
    'Very High Demand'
  )
ON CONFLICT (title) DO NOTHING;

-- Map Required Skills to Career Roles
INSERT INTO public.career_role_skills (role_id, skill_id, is_required, proficiency_required)
VALUES
  -- Full-Stack Developer
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', true, 80), -- TypeScript
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', true, 85), -- React
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', true, 75), -- Node.js
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', true, 70), -- PostgreSQL
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000009', true, 80), -- Git
  
  -- AI/ML Engineer
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', true, 90), -- Python
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007', true, 85), -- Machine Learning
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000011', true, 80), -- PyTorch
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', false, 60),-- Docker

  -- Cloud/DevOps
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', true, 90), -- Docker
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000012', true, 85), -- AWS
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000008', true, 75)  -- System Design
ON CONFLICT (role_id, skill_id) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 4. CAMPUS CLUBS SEED DATA (Prefix: b000...)
-- ----------------------------------------------------------------------------
INSERT INTO public.clubs (id, name, slug, description, short_description, category, college_id, join_policy, is_active)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Open Source & Coding Club',
    'iitb-coding-club',
    'Fostering open-source contributions, competitive programming contests, and software development hackathons.',
    'Premier competitive programming and developer community.',
    'Technology',
    'c0000000-0000-0000-0000-000000000001',
    'open',
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'AI & Robotics Society',
    'iitd-robotics-society',
    'Building autonomous robots, quadcopters, and researching computer vision and embedded systems.',
    'Hands-on robotics, computer vision, and autonomous drone hardware.',
    'Robotics & AI',
    'c0000000-0000-0000-0000-000000000002',
    'approval',
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Entrepreneurship Cell (E-Cell)',
    'bits-ecell',
    'Empowering student founders with pitch competitions, mentorship from alumni founders, and seed grant funding.',
    'Incubating student startups and founder journeys.',
    'Entrepreneurship',
    'c0000000-0000-0000-0000-000000000003',
    'open',
    true
  )
ON CONFLICT (slug) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 5. CANONICAL OPPORTUNITIES SEED DATA (Prefix: e000...)
-- ----------------------------------------------------------------------------
INSERT INTO public.opportunities (
  id,
  title,
  organization,
  description,
  opportunity_type,
  experience_level,
  location,
  is_remote,
  deadline,
  is_active,
  is_featured,
  tags,
  roles
)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'Full-Stack Engineering Summer Fellowship',
    'HyperScale Labs',
    'Work alongside senior staff engineers building distributed real-time collaborative web systems using React, TypeScript, and Supabase.',
    'internship',
    'intermediate',
    'Bengaluru, Karnataka',
    true,
    now() + INTERVAL '45 days',
    true,
    true,
    ARRAY['React', 'TypeScript', 'PostgreSQL', 'Paid'],
    ARRAY['Full-Stack Developer']
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'National Generative AI Student Hackathon 2026',
    'TRYBE AI Foundation',
    '48-hour virtual national hackathon solving campus intelligence, agentic learning roadmaps, and student productivity.',
    'hackathon',
    'beginner',
    'Online / Pan-India',
    true,
    now() + INTERVAL '21 days',
    true,
    true,
    ARRAY['AI', 'Hackathon', 'Cash Prize', 'Mentorship'],
    ARRAY['AI / Machine Learning Engineer', 'Full-Stack Developer']
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'Cloud Systems & Security Research Assistantship',
    'Center for Network Security',
    'Undergraduate research exploring eBPF observability, micro-segmentation, and zero-trust container networking.',
    'research',
    'advanced',
    'New Delhi, Delhi',
    false,
    now() + INTERVAL '60 days',
    true,
    false,
    ARRAY['Docker', 'Linux', 'Networking', 'Research Publication'],
    ARRAY['Cloud / DevOps Engineer']
  )
ON CONFLICT (id) DO NOTHING;
