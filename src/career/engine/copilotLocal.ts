import type { CopilotMessage, CopilotResponse, NextBestAction, Priority, StudentSnapshot } from '../types';
import { findRoleByText } from '../data/roles';
import { analyzeSkillGap } from './gap';
import { weeklyPlan } from './roadmap';
import { READINESS_WEIGHTS } from './gap';
import { formatHours, round } from './util';

export const SUGGESTED_QUESTIONS = [
  'What should I learn this week?',
  'What are my biggest weaknesses?',
  'Which project should I build?',
  'Am I ready for an internship?',
  'Which opportunities should I apply for?',
  'Why is my career readiness score what it is?',
  'What should I discuss with my mentor?',
];

function fromAction(a: NextBestAction): Pick<CopilotResponse, 'nextBestAction' | 'reason' | 'priority' | 'skill' | 'estimatedHours'> {
  return {
    nextBestAction: a.title,
    reason: a.reason,
    priority: a.impact,
    skill: a.relatedSkill,
    estimatedHours: a.estimatedHours,
  };
}

/**
 * Intelligent, context-aware local response engine.
 * Understands conversational context, follow-up queries ("what?", "why?", "explain"),
 * objections ("no", "skip"), greetings, technical deep-dives, and student diagnostics.
 * Acts as a warm, articulate senior engineering mentor.
 */
export function answerLocally(
  question: string,
  snap: StudentSnapshot,
  thread?: CopilotMessage[]
): CopilotResponse {
  const q = question.trim().toLowerCase();
  const { analysis, role, nextBestAction: nba, progress, opportunities, student } = snap;
  const firstName = student.name.split(' ')[0] || 'there';

  if (!role || !analysis) {
    return {
      answer: 'Your career profile is incomplete. Add your target career role and skills to unlock personalised recommendations.',
      nextBestAction: nba.title,
      reason: nba.reason,
      priority: 'high',
      estimatedHours: nba.estimatedHours,
    };
  }

  // Find previous context in the thread
  const prevAssistant = (thread ?? []).filter(m => m.role === 'assistant').slice(-1)[0];
  const prevUser = (thread ?? []).filter(m => m.role === 'user').slice(-2, -1)[0];
  const lastTopic = prevAssistant?.response?.skill || prevAssistant?.response?.nextBestAction || nba.relatedSkill || '';

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Follow-up / Clarification ("what?", "what do you mean?", "why?", "how?", "explain")
  // ──────────────────────────────────────────────────────────────────────────
  const isClarification = /^(what\??|what do you mean\??|why\??|why so\??|how\??|how so\??|explain|explain this|elaborate|clarify|can you explain|tell me more|details\??|meaning\??)$/i.test(q)
    || /^(what is (this|that)|what does that mean|i don't understand|i dont understand|elaborate please)/i.test(q);

  if (isClarification) {
    const isNodeContext = /node(\.js)?/i.test(lastTopic) || /node(\.js)?/i.test(prevAssistant?.text ?? '') || /node(\.js)?/i.test(nba.title);

    if (isNodeContext) {
      return {
        answer:
          `In your recent assessment, you scored 6% on Node.js fundamentals, specifically around three core areas:\n\n` +
          `1. **The Event Loop**: Node.js executes JavaScript on a single thread. Understanding the Call Stack, Libuv thread pool, and how Microtasks (Promises) run before Macrotasks (\`setTimeout\`) is tested in virtually every backend interview.\n\n` +
          `2. **Middleware**: In Express or Fastify, middleware functions intercept requests. You need to know how to pass control with \`next()\`, handle authentication tokens, and avoid hanging connections.\n\n` +
          `3. **Async Error Handling**: Unhandled promise rejections can crash your production server. Mastering \`try/catch\` blocks with \`async/await\` and creating a centralized Express error middleware is essential.\n\n` +
          `Would you like to start with a 15-minute quick-read guide on the Event Loop, or would you prefer a hands-on mini coding exercise?`,
        skill: 'Node.js',
        priority: 'high',
        estimatedHours: 2,
        nextBestAction: 'Review Node.js Event Loop & Express Middleware Guide',
        reason: 'Essential backend foundation needed for Full-Stack Developer interviews.',
      };
    }

    if (prevAssistant?.response?.nextBestAction) {
      return {
        answer:
          `I recommended "${prevAssistant.response.nextBestAction}" because:\n\n` +
          `• **Goal Alignment**: It directly targets ${prevAssistant.response.skill ? `your **${prevAssistant.response.skill}** skill gap` : 'your top roadmap milestone'} for the ${role.title} path.\n` +
          `• **Impact**: Completing this will strengthen your verified portfolio and increase your readiness score (${analysis.readiness}%).\n` +
          `• **Time Investment**: It only takes about ${formatHours(prevAssistant.response.estimatedHours || 2)}.\n\n` +
          `Let me know if you would like me to break this down into smaller steps, or if you prefer to work on something else!`,
        skill: prevAssistant.response.skill,
        priority: prevAssistant.response.priority || 'medium',
        nextBestAction: prevAssistant.response.nextBestAction,
        reason: prevAssistant.response.reason,
        estimatedHours: prevAssistant.response.estimatedHours,
      };
    }

    // General clarification
    return {
      answer:
        `Right now, your highest-leverage task is **${nba.title}**.\n\n` +
        `**Why it matters:** ${nba.reason}\n` +
        `**How to approach it:** ${nba.how}\n` +
        `**Estimated time:** ${formatHours(nba.estimatedHours)}.\n\n` +
        `Would you like a link to study materials, or should we break it into smaller 30-minute milestones?`,
      ...fromAction(nba),
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Rejection / Resistance ("no", "nah", "skip", "not now", "don't want", "boring")
  // ──────────────────────────────────────────────────────────────────────────
  const isRejection = /^(no\b|nah\b|nope\b|not now\b|skip\b|dont want|don't want|later\b|something else\b|cancel\b|stop\b|nevermind\b|boring\b|too hard\b|cant\b|can't\b|leave it\b)/i.test(q);

  if (isRejection) {
    const alt = snap.alternatives[0];
    const topOpp = opportunities.find(o => !o.expired && o.score >= 50);

    return {
      answer:
        `Totally fair! You don't have to do that right now. Maintaining momentum and enjoying what you build is far more important.\n\n` +
        `Here are 3 great alternative options you can pick from today:\n\n` +
        `1. **Build a Hands-on Project**: Put your existing React & TypeScript skills into practice by adding a new interactive feature to your portfolio.\n` +
        `2. **Explore Live Opportunities**: ${topOpp ? `Check out "${topOpp.opportunity.title}" at ${topOpp.opportunity.organization} (${topOpp.score}% match).` : 'Browse open hackathons and student internships.'}\n` +
        `3. **Switch to Another Skill**: Focus on Frontend UI, Database Design, or Git workflows instead.\n\n` +
        `Which one of these sounds more appealing to you right now?`,
      priority: 'medium',
      nextBestAction: alt ? alt.title : 'Build an interactive React + TypeScript feature for your portfolio',
      reason: alt ? alt.reason : 'A hands-on, creative alternative to theory review.',
      estimatedHours: alt ? alt.estimatedHours : 2,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Greetings & Casual Chat ("hi", "hello", "hey", "good morning", "who are you")
  // ──────────────────────────────────────────────────────────────────────────
  const isGreeting = /^(hi\b|hello\b|hey\b|yo\b|greetings\b|good morning\b|good afternoon\b|good evening\b|who are you\b|what can you do\b|help\b|help me\b)/i.test(q);

  if (isGreeting) {
    return {
      answer:
        `Hey ${firstName}! 👋 I'm your TRYBE Career Copilot.\n\n` +
        `I keep track of your journey toward becoming a **${role.title}** (you're currently at **${analysis.readiness}% career readiness**).\n\n` +
        `Here are a few things you can ask me anytime:\n` +
        `• *"What should I learn this week?"* — A personalized plan based on your ${student.career.weeklyLearningHours} weekly hours.\n` +
        `• *"What are my biggest weaknesses?"* — Insights into your skill gaps and test scores.\n` +
        `• *"Which project should I build?"* — Portfolio project ideas that impress recruiters.\n` +
        `• *"Am I ready for an internship?"* — Honest feedback and matched openings.\n\n` +
        `What would you like to explore today?`,
      priority: 'low',
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Affirmations & Next Steps ("yes", "sure", "okay", "let's do it", "how to start")
  // ──────────────────────────────────────────────────────────────────────────
  const isAffirmation = /^(yes\b|sure\b|ok\b|okay\b|lets do it\b|let's do it\b|how to start\b|how do i start\b|start\b|done\b|next step\b|ready\b)/i.test(q);

  if (isAffirmation) {
    return {
      answer:
        `Awesome, let's get you set up! Here is your quick 3-step game plan for **${nba.title}**:\n\n` +
        `1. **Focus on the Core Concept**: ${nba.how}\n` +
        `2. **Set a Timer**: Dedicate ${formatHours(nba.estimatedHours)} in one or two focused blocks without distractions.\n` +
        `3. **Build Proof of Work**: Once complete, mark the task done on your roadmap to automatically update your progress.\n\n` +
        `Ready when you are! Let me know if you hit any roadblocks while working through it.`,
      ...fromAction(nba),
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Gratitude & Politeness ("thanks", "thank you", "cool", "awesome", "great")
  // ──────────────────────────────────────────────────────────────────────────
  const isPolite = /^(thanks\b|thank you\b|thx\b|awesome\b|great\b|cool\b|perfect\b|got it\b|understood\b|nice\b|super\b|bye\b|goodbye\b)/i.test(q);

  if (isPolite) {
    return {
      answer:
        `You're very welcome, ${firstName}! Keep up the momentum. You are making real progress toward ${role.title}.\n\n` +
        `Whenever you need guidance, feedback on a project, or advice before applying to an opportunity, I'm right here! 🚀`,
      priority: 'low',
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Technology Deep-Dives
  // ──────────────────────────────────────────────────────────────────────────
  // Node.js / Backend
  if (/\b(node|nodejs|express|backend|event loop|middleware|async|promises|npm)\b/i.test(q)) {
    const nodeGap = analysis.items.find(i => /node/i.test(i.skill));
    return {
      answer:
        `**Node.js Deep Dive for ${role.title}:**\n\n` +
        `• **Current Standing**: ${nodeGap ? `You are at Level ${nodeGap.level} (target: Level ${nodeGap.target}). Closing this gap is worth +${round(READINESS_WEIGHTS.skills * 100 * nodeGap.weight * (1 - nodeGap.coverage))} readiness points!` : 'Node.js is a primary requirement for backend architecture.'}\n\n` +
        `• **Top 3 Interview Pillars**:\n` +
        `  1. *Event Loop & Concurrency*: Single-thread execution, call stack, Libuv thread pool, and non-blocking I/O.\n` +
        `  2. *REST APIs with Express*: Routing, middleware chaining (\`req\`, \`res\`, \`next\`), input validation (Zod/Joi), and status codes.\n` +
        `  3. *Error Handling & Security*: Centralized error handlers, CORS headers, rate limiting, and password hashing with bcrypt.\n\n` +
        `• **Recommended Action**: ${nba.title}.`,
      skill: 'Node.js',
      priority: 'high',
      ...fromAction(nba),
    };
  }

  // React / Frontend
  if (/\b(react|frontend|ui|tailwind|css|hooks|state|redux)\b/i.test(q)) {
    return {
      answer:
        `**React & Frontend Strategy for ${role.title}:**\n\n` +
        `• **Your Strength**: React is one of your standout skills! You have solid foundations in modern functional components.\n\n` +
        `• **To Reach Senior Proficiency**:\n` +
        `  1. *Custom Hooks*: Abstract complex logic (e.g. data fetching, pagination, dark mode) into reusable hooks.\n` +
        `  2. *Performance Optimization*: Learn when (and when not) to use \`useMemo\`, \`useCallback\`, and \`React.memo\` to prevent unnecessary re-renders.\n` +
        `  3. *Full-Stack Integration*: Connect your React UI to a Node.js REST API with typed client responses and optimistic UI updates.\n\n` +
        `Build a full-stack project where your frontend communicates seamlessly with your backend!`,
      skill: 'React',
      priority: 'medium',
      nextBestAction: 'Build a Full-Stack Feature Connecting React to Node.js',
      reason: 'Bridges your strong React knowledge with backend data flows.',
      estimatedHours: 3,
    };
  }

  // TypeScript / JavaScript
  if (/\b(typescript|javascript|js|ts|types|interfaces)\b/i.test(q)) {
    return {
      answer:
        `**TypeScript & Modern JavaScript:**\n\n` +
        `TypeScript has become the default industry standard for full-stack engineering.\n\n` +
        `• **Key Topics to Master**:\n` +
        `  1. *Generics & Utility Types*: Learn \`Partial<T>\`, \`Pick<T, K>\`, \`Omit<T, K>\`, and \`Record<K, T>\`.\n` +
        `  2. *Type Narrowing & Guards*: Use discriminated unions and \`typeof\` / \`instanceof\` guards for foolproof data parsing.\n` +
        `  3. *End-to-End Type Safety*: Share database types across frontend and backend for compile-time safety.\n\n` +
        `You are already using TypeScript across TRYBE — keep strict type checking enabled in your personal projects!`,
      skill: 'TypeScript',
      priority: 'medium',
      nextBestAction: 'Practice TypeScript Utility Types & Generics',
      reason: 'Crucial for writing production-grade, bug-free applications.',
      estimatedHours: 2,
    };
  }

  // Databases / SQL
  if (/\b(sql|database|postgres|postgresql|mongodb|prisma|query|tables)\b/i.test(q)) {
    return {
      answer:
        `**Database & Data Modeling Guide:**\n\n` +
        `Every Full-Stack Engineer needs solid relational database design skills.\n\n` +
        `• **What Recruiters Look For**:\n` +
        `  1. *Schema Normalization*: 1NF, 2NF, 3NF to avoid redundancy while keeping queries efficient.\n` +
        `  2. *Indexing*: B-tree indexes on foreign keys and frequently filtered columns to avoid slow full-table scans.\n` +
        `  3. *Transactions (ACID)*: Ensuring money transfers, bookings, or multi-table updates either complete fully or roll back cleanly.\n\n` +
        `A great exercise is designing the schema for an e-commerce order system or social media feed in PostgreSQL!`,
      skill: 'PostgreSQL',
      priority: 'medium',
      nextBestAction: 'Design & Query an E-Commerce PostgreSQL Schema',
      reason: 'Proves database architecture and SQL query optimization skills.',
      estimatedHours: 3,
    };
  }

  // DSA / LeetCode / Coding Interviews
  if (/\b(dsa|leetcode|algorithm|data structures|coding test|problem solving)\b/i.test(q)) {
    return {
      answer:
        `**DSA & Problem Solving Strategy:**\n\n` +
        `For product companies and tech placements, don't try to solve 500 random problems. Focus on **Patterns**:\n\n` +
        `1. *Two Pointers & Sliding Window* (Arrays, Strings)\n` +
        `2. *Hash Maps & Frequency Counting* (O(1) lookups)\n` +
        `3. *Trees & BFS / DFS* (DOM manipulation is essentially a tree traversal!)\n` +
        `4. *Dynamic Programming Foundations* (Memoization & subproblems)\n\n` +
        `Spend 45 minutes a day solving 1-2 medium-level problems on LeetCode or NeetCode 150 rather than cramming on weekends.`,
      priority: 'medium',
      nextBestAction: 'Solve 2 Medium Array & Sliding Window Problems',
      reason: 'Builds intuition for campus placement technical screening tests.',
      estimatedHours: 1.5,
    };
  }

  // Resume / Placements / Job Hunting
  if (/\b(resume|placement|interview|hire|cv|faang|apply|salary|package)\b/i.test(q)) {
    return {
      answer:
        `**Placement & Interview Readiness for ${role.title}:**\n\n` +
        `• **Your Readiness**: ${analysis.readiness}% (${analysis.readiness >= 60 ? 'Competitive for internships!' : analysis.readiness >= 40 ? 'Borderline — start applying to startup fellowships while closing gaps.' : 'Focus on closing your primary skill gaps first.'})\n\n` +
        `• **Resume Tips**:\n` +
        `  1. Use the **XYZ Formula**: "Accomplished [X], as measured by [Y], by doing [Z]."\n` +
        `  2. Include live deployed links and GitHub repositories for all listed projects.\n` +
        `  3. Highlight your verified skills (React, TypeScript) prominently at the top.\n\n` +
        `Would you like to review which active TRYBE opportunities match your profile right now?`,
      priority: 'high',
      ...fromAction(nba),
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Core Diagnostic Inquiries (Score, Roadmap, Projects, Weaknesses)
  // ──────────────────────────────────────────────────────────────────────────
  // Why is my score low / 6% / score breakdown
  if (/(why|explain).*(score|readiness|6%)|score.*(low|why)|readiness.*(low|why)|why.*(low|6)/i.test(q)) {
    const b = analysis.breakdown;
    const top = analysis.items.find(i => i.gap > 0);
    const gain = top ? round(READINESS_WEIGHTS.skills * 100 * top.weight * (1 - top.coverage)) : 0;
    return {
      answer:
        `Your readiness score for **${role.title}** is **${analysis.readiness}%**. Here is exactly how it is calculated:\n\n` +
        `• **Skill Coverage** (${b[0].scorePct}%, 70% weight): Your verified proficiency against the role's required skills.\n` +
        `• **Proof of Work** (${b[1].scorePct}%, 20% weight): Concrete projects demonstrating hands-on implementation.\n` +
        `• **Roadmap Consistency** (${b[2].scorePct}%, 10% weight): Active task completion.\n\n` +
        (top
          ? `Your biggest opportunity for growth is **${top.skill}** (currently ${top.level}/${top.target}). Reaching the target in this skill alone will add **+${gain} points** to your overall score!`
          : 'You are at target across all primary required skills. Focus on project evidence and active applications.'),
      ...fromAction(nba),
    };
  }

  // Weekly plan
  if (/week|schedule|this month|today|hours/i.test(q)) {
    const plan = weeklyPlan(snap.student.roadmap, student.career.weeklyLearningHours, snap.now);
    if (plan.items.length === 0) {
      return {
        answer: `Your roadmap has no pending tasks for this week! Great job. This is the perfect time to build a portfolio project or apply to an open opportunity.`,
        ...fromAction(nba),
      };
    }
    const list = plan.items.map(i => `• **${i.task.title}** (${formatHours(i.task.estimatedHours)})`).join('\n');
    return {
      answer:
        `With **${student.career.weeklyLearningHours} learning hours** available this week, here is your prioritized plan (~${plan.hours} hrs total):\n\n` +
        `${list}\n\n` +
        (progress.overdueTasks.length ? `⚠️ You have ${progress.overdueTasks.length} overdue item(s)—start with those to keep your roadmap on schedule.` : 'Start with the first item today!'),
      nextBestAction: plan.items[0].task.title,
      reason: `First priority on your ${role.title} roadmap for this week.`,
      priority: progress.overdueTasks.length ? 'high' : 'medium',
      skill: plan.items[0].task.skill || undefined,
      estimatedHours: plan.items[0].task.estimatedHours,
    };
  }

  // Weaknesses / gaps
  if (/weak|gap|priorit|lack|missing|struggl/i.test(q)) {
    const list = analysis.critical.length ? analysis.critical : analysis.needsImprovement;
    const text = list.slice(0, 3).map(g => `• **${g.skill}**: Level ${g.level}/${g.target} (${g.whyItMatters})`).join('\n');
    return {
      answer:
        `Here are your primary growth areas for **${role.title}**:\n\n` +
        `${text || '• You are currently on target across all core skills!'}\n\n` +
        `Tackling the first item gives you the highest score bump and interview readiness.`,
      ...fromAction(nba),
    };
  }

  // Project recommendations
  if (/project|build|portfolio/i.test(q)) {
    const gap = analysis.items.find(i => i.gap > 0);
    return {
      answer:
        `**Recommended Project for ${role.title}:**\n\n` +
        `Build a **Full-Stack SaaS Platform with Real-Time Data**:\n` +
        `• **Frontend**: React + TypeScript + Tailwind (showcases your existing strength)\n` +
        `• **Backend**: Node.js + Express REST API with JWT Authentication (closes your Node.js gap!)\n` +
        `• **Database**: PostgreSQL with structured schema and indexes\n\n` +
        `Adding this single project will significantly boost your Proof of Work score (currently ${analysis.breakdown[1].scorePct}%) and give you great talking points during interviews.`,
      nextBestAction: gap ? gap.action.title : 'Build a Full-Stack React + Node.js Web Application',
      reason: 'Provides concrete portfolio proof for both frontend and backend skills.',
      priority: 'high',
      skill: gap?.skill || 'Node.js',
      estimatedHours: 6,
    };
  }

  // Opportunities / internships
  if (/opportunit|hackathon|internship|job|apply|placement/i.test(q)) {
    const top = opportunities.filter(o => !o.expired && student.opportunityStatus[o.opportunity.id] !== 'dismissed').slice(0, 3);
    if (top.length === 0) {
      return {
        answer: 'There are currently no active opportunities matching your filters. Check back soon or refine your preferences in your Career Profile.',
        ...fromAction(nba),
      };
    }
    const list = top.map(o => `• **${o.opportunity.title}** at *${o.opportunity.organization}* (${o.score}% match${o.missing.length ? `, missing ${o.missing.slice(0, 2).join(' & ')}` : ''})`).join('\n');
    return {
      answer:
        `Here are your top matched opportunities on TRYBE right now:\n\n` +
        `${list}\n\n` +
        `You can review details and apply directly under the Opportunities tab!`,
      nextBestAction: `Review ${top[0].opportunity.title}`,
      reason: top[0].reasons[0] ?? `${top[0].score}% match with your profile.`,
      priority: top[0].score >= 70 ? 'high' : 'medium',
      estimatedHours: 1,
      opportunityIds: top.map(o => o.opportunity.id),
    };
  }

  // Mentor topics
  if (/mentor|session|discuss|agenda/i.test(q)) {
    return {
      answer:
        `**Suggested Mentor Session Agenda:**\n\n` +
        `1. **Skill Gap Strategy**: How to quickly bridge your ${analysis.critical[0]?.skill || 'Node.js'} gap.\n` +
        `2. **Project Architecture Review**: Getting feedback on your portfolio code and database design.\n` +
        `3. **Interview Preparation**: Practice behavioral questions and technical screening tips for ${role.title}.\n\n` +
        `You can open the Mentor Desk to schedule a session and auto-generate detailed meeting notes.`,
      nextBestAction: 'Open the Mentor Desk and create a session plan',
      reason: 'A structured agenda makes mentor sessions 3x more productive.',
      priority: 'medium',
      estimatedHours: 1,
    };
  }

  // Another role comparison
  const other = findRoleByText(q);
  if (other && other.id !== role.id) {
    const a = analyzeSkillGap(other, snap.skills, student, progress);
    return {
      answer:
        `**Role Comparison: ${other.title} vs ${role.title}**\n\n` +
        `• Your readiness for **${other.title}** would be **${a.readiness}%** (compared to ${analysis.readiness}% for ${role.title}).\n` +
        `• Main gaps for this role: ${a.items.filter(i => i.gap > 0).slice(0, 3).map(i => `${i.skill} (${i.level}/${i.target})`).join(', ') || 'None—you meet all targets!'}.\n\n` +
        `You can switch target roles in Career Readiness anytime to automatically re-balance your roadmap.`,
      nextBestAction: a.items.find(i => i.gap > 0)?.action.title ?? nba.title,
      reason: `Key milestone for ${other.title}.`,
      priority: 'medium',
      skill: a.items.find(i => i.gap > 0)?.skill,
      estimatedHours: a.items.find(i => i.gap > 0)?.action.estimatedHours,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Natural Conversational Fallback (Never a robotic repetitive line)
  // ──────────────────────────────────────────────────────────────────────────
  return {
    answer:
      `Regarding that, here is my best advice for your ${role.title} journey:\n\n` +
      `Your current focus should be on **${nba.title}**.\n\n` +
      `• **Why it's important:** ${nba.reason}\n` +
      `• **How to tackle it:** ${nba.how}\n` +
      `• **Expected time:** ~${formatHours(nba.estimatedHours)}.\n\n` +
      `Feel free to ask me for specific code examples, explanation of any concepts, or if you'd like to switch to a different topic!`,
    ...fromAction(nba),
  };
}
