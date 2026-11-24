# 🎓TryBe

> **A modern college social & community platform — built to bring campus life into one place.**

Discover colleges, join clubs, explore events, share updates, discuss ideas, connect with people, and manage your campus presence — all from a single, focused experience.

<br />

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge\&logo=githubactions\&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)

</div>

<br />

---

## ✦ Overview

**TryBe** is a single-page application designed around the everyday needs of college students.

Instead of scattering campus life across WhatsApp groups, Instagram pages, college websites, and separate communities,TryBe brings the experience together through a unified platform.

### The platform combines

* 🏫 College discovery
* 🎭 Clubs & communities
* 📅 Events & RSVPs
* 📰 Campus social feed
* 💬 Discussions
* ✉️ Direct messaging
* 🔔 Notifications
* 👤 Profiles
* 🔍 People, projects & college discovery
* ⚙️ Account & support tools

The frontend follows a **context-driven, component-oriented React architecture** with a clear separation between presentation, application state, and domain data.

---

## ✨ Core Features

| Feature                   | What it does                                        |
| :------------------------ | :-------------------------------------------------- |
| 🏫 **College Explore**    | Discover colleges and explore their public profiles |
| 🎭 **Clubs**              | Browse, join, and manage college clubs              |
| 📅 **Events**             | Discover campus and club events with RSVP flows     |
| 📰 **Home Feed**          | View a personalized stream of campus activity       |
| 💬 **Discussions**        | Participate in college and club discussions         |
| ✉️ **Messages**           | Direct messaging between users                      |
| 🔔 **Notifications**      | Centralized social and platform notifications       |
| 👤 **Profile**            | Manage your identity and college presence           |
| 🔍 **Discover**           | Find people, colleges, clubs, and projects          |
| 🧭 **Onboarding**         | Guided signup, login, and onboarding experience     |
| ⚙️ **Settings & Support** | Settings, help, legal, and contact surfaces         |

---

# 🏗️ Architecture

TryBe uses a **layered SPA architecture**.

At the center is `App.tsx`, which orchestrates routing and page composition, while `AppContext.tsx` provides shared application state.

```text
                         ┌─────────────────────┐
                         │      Browser        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     index.html      │
                         │       Entry         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     main.tsx        │
                         │      Bootstrap      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │            App.tsx            │
                    │         Orchestrator          │
                    │                               │
                    │  • Routing                    │
                    │  • Layout                     │
                    │  • Page composition            │
                    └───────────────┬───────────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 │                                     │
                 ▼                                     ▼
       ┌─────────────────────┐              ┌─────────────────────┐
       │   AppContext.tsx    │              │     Pages Layer     │
       │    Global State     │              │   src/pages/*.tsx   │
       │                     │              │                     │
       │ • currentUser       │              │ • Home              │
       │ • activeCollege     │              │ • Discover          │
       │ • notifications     │              │ • Clubs             │
       │ • messages          │              │ • Messages          │
       │ • UI state          │              │ • Profile           │
       └──────────┬──────────┘              └──────────┬──────────┘
                  │                                    │
                  └────────────────┬───────────────────┘
                                   │
                                   ▼
                     ┌──────────────────────────┐
                     │   Feature Components     │
                     │                          │
                     │ • FeedTab                │
                     │ • ClubsTab               │
                     │ • EventsTab              │
                     │ • DiscussionsTab         │
                     │ • AboutTab               │
                     │ • RightSidebar           │
                     │ • Modal                  │
                     └────────────┬─────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │      Domain / Data       │
                     │      src/data/*.ts       │
                     │                          │
                     │ • colleges               │
                     │ • clubs                  │
                     │ • events                 │
                     │ • people                 │
                     │ • projects               │
                     │ • shared types           │
                     └──────────────────────────┘
```

---

## 🧩 Application Layers

| Layer             | Responsibility                    | Main files                   |
| :---------------- | :-------------------------------- | :--------------------------- |
| **Bootstrap**     | Initializes the React application | `src/main.tsx`               |
| **Orchestrator**  | Routing, layout, page composition | `src/App.tsx`                |
| **Global State**  | Shared application state          | `src/context/AppContext.tsx` |
| **Pages**         | Route-level screens               | `src/pages/*.tsx`            |
| **Components**    | Reusable feature UI               | `src/components/`            |
| **Domain / Data** | Typed application entities        | `src/data/*.ts`              |
| **Styling**       | Global styles & design system     | `src/index.css`              |

---

## 🔄 State & Data Flow

`AppContext.tsx` acts as the application's lightweight state orchestrator using **React Context + Hooks**.

```text
                    AppContext Provider
                           │
                           │ useContext()
                           ▼
        ┌──────────────────────────────────────┐
        │                                      │
        ▼                                      ▼
   Home / Discover                       College Explore
   Clubs / Work                         ├── About
                                        ├── Feed
                                        ├── Clubs
                                        ├── Events
                                        └── Discussions
        │                                      │
        └──────────────────┬───────────────────┘
                           │
                           ▼
                     Shared Actions
                           │
                           ▼
                  Centralized State
```

### Design principle

Pages and components **read state from context** and trigger updates through context-provided actions.

This keeps mutation logic centralized and provides a predictable data flow without introducing a heavier state-management library.

---

# 🧱 Component Architecture

TryBe follows a few simple architectural patterns.

### Container + Tabs

`CollegeExplore.tsx` works as the container while individual tabs own their respective UI responsibilities:

```text
CollegeExplore
├── AboutTab
├── FeedTab
├── ClubsTab
├── EventsTab
└── DiscussionsTab
```

### Reusable Components

Common UI elements are extracted into reusable components:

```text
components/
├── Layout.tsx
├── Modal.tsx
└── college/
    ├── AboutTab.tsx
    ├── ClubsTab.tsx
    ├── DiscussionsTab.tsx
    ├── EventsTab.tsx
    ├── FeedTab.tsx
    └── RightSidebar.tsx
```

### Role-Based Dashboard

The public club discovery experience and club management experience are separated:

```text
Clubs.tsx
    │
    └── Public club discovery

ClubDashboard.tsx
    │
    └── Club administration
```

---

# 🗂️ Data Model

The domain layer keeps the application's entities strongly typed.

```text
src/data/

types.ts
   │
   ├── College
   ├── Club
   ├── Event
   ├── Person
   └── Project

colleges.ts
clubs.ts
events.ts
people.ts
projects.ts
```

This keeps domain data independent from the UI.

As a result, mock/static data can later be replaced with a real API or backend without requiring major changes to pages and components.

---

# 📁 Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── src/
│   ├── components/
│   │   ├── college/
│   │   │   ├── AboutTab.tsx
│   │   │   ├── ClubsTab.tsx
│   │   │   ├── DiscussionsTab.tsx
│   │   │   ├── EventsTab.tsx
│   │   │   ├── FeedTab.tsx
│   │   │   └── RightSidebar.tsx
│   │   ├── Layout.tsx
│   │   └── Modal.tsx
│   │
│   ├── context/
│   │   └── AppContext.tsx
│   │
│   ├── data/
│   │   ├── clubs.ts
│   │   ├── colleges.ts
│   │   ├── events.ts
│   │   ├── people.ts
│   │   ├── projects.ts
│   │   └── types.ts
│   │
│   ├── pages/
│   │   ├── ClubDashboard.tsx
│   │   ├── Clubs.tsx
│   │   ├── CollegeExplore.tsx
│   │   ├── Contact.tsx
│   │   ├── Discover.tsx
│   │   ├── Help.tsx
│   │   ├── HomeFeed.tsx
│   │   ├── LegalPage.tsx
│   │   ├── Login.tsx
│   │   ├── Messages.tsx
│   │   ├── MyCollege.tsx
│   │   ├── Notifications.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Profile.tsx
│   │   ├── Settings.tsx
│   │   ├── Signup.tsx
│   │   ├── Welcome.tsx
│   │   └── Work.tsx
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── apple-design.md
├── index.html
├── metadata.json
├── SECURITY.md
└── README.md
```

---

# 🛠️ Tech Stack

<div align="center">

| Layer          | Technology               |
| :------------- | :----------------------- |
| **Frontend**   | React 18                 |
| **Language**   | TypeScript               |
| **Build Tool** | Vite                     |
| **Styling**    | Custom CSS Design System |
| **State**      | React Context + Hooks    |
| **Routing**    | React Router             |
| **CI/CD**      | GitHub Actions           |
| **Hosting**    | GitHub Pages             |

</div>

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* **Node.js** `18.x` or higher
* **npm** `9.x` or higher

You can also use `yarn` or `pnpm`.

---

## Installation

```bash
# Clone the repository
git clone https://github.com/USERNAME/REPO.git

# Enter the project
cd REPO

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will be available at:

```text
http://localhost:5173
```

---

# ✦ AI Career Intelligence Layer

TRYBE includes five connected career features that share one student profile:

| Feature | Route | What it does |
| :-- | :-- | :-- |
| **Career Copilot** | `/career` | Next best action (what / why / how / time), this week's plan, top matches, structured Q&A |
| **Career Readiness** | `/career/readiness` | Target role → skill gaps → explainable readiness score → actions that can be added to the roadmap |
| **My Roadmap** | `/career/roadmap` | Phased plan that adapts to assessments, completed work and missed tasks |
| **Opportunities** | `/career/opportunities` and the **Work → Opportunities for You** tab | Personalised match % with matched / missing skills, filters and sorting |
| **Mentor Desk** | `/career/mentor` | One-glance student briefing, suggested agenda, session notes and AI summary |

### How it is built

```text
UserProfile (+ career) ─┐
Work projects ──────────┼─► StudentRecord ─► buildSnapshot() ─► Copilot · Readiness · Roadmap · Opportunities · Mentor
Assessments / roadmap ──┘        (src/career/engine — pure, deterministic, unit-verified)
                                                    │
                                                    └─► src/ai — explains / words the result, never decides it
```

* **Numbers are never produced by an LLM.** Skill levels, readiness, roadmap structure, match % and the next-best-action are computed by `src/career/engine`. AI only writes explanations, coaching notes and mentor briefings.
* **Every AI answer is validated** (`src/ai/validators.ts`): JSON-shape checked, length-limited, URLs stripped, unknown opportunity ids / skills / phase ids dropped. Invalid output falls back to the rules-based text and shows a friendly retry notice.
* **No hallucinated opportunities.** Opportunities come only from `src/career/data/opportunities.ts` (clearly-labelled sample data) and existing TRYBE Work projects. The model receives real ids only and may reference nothing else.
* **Works with zero configuration.** Without an AI key every feature still works using the built-in engine; results are labelled *TRYBE Insight* vs *AI Insight*.
* **Existing data is reused.** Skills, interests and projects come from the existing profile / Work data; only career-specific fields live on `UserProfile.career`. Everything persists in the same `trybee_*` localStorage keys. No database was added.

### Enabling AI explanations (optional)

```bash
cp .env.example .env.local
# set GEMINI_API_KEY=...   (server-side only, no VITE_ prefix)
npm run dev
```

The key is read by a small proxy (`server/aiProxy.ts`, a Vite plugin that reuses the existing `@google/genai` dependency) and is never bundled into browser code. The proxy validates input, caps request size, rate-limits per IP and returns only generic errors.

> **Static hosting (GitHub Pages):** the production site has no server, so AI is reported as unavailable and the rules-based engine is used. To enable AI in production, host the proxy (or an equivalent endpoint with the same `GET /status` and `POST /` contract) elsewhere and set `VITE_AI_ENDPOINT` at build time. Do **not** put a secret in any `VITE_` variable.

### Extending

* Add a role: append to `src/career/data/roles.ts` (skills, targets, weights, phases).
* Add a skill: append a playbook to `src/career/data/skills.ts` (tasks, review topics, aliases).
* Sample opportunities and demo mentees: `src/career/data/`.
* Skill checks are manual score entries (TRYBE has no assessment engine yet); the roadmap adapts to them.

---

# 📜 Available Scripts

| Command           | Purpose                                |
| :---------------- | :------------------------------------- |
| `npm run dev`     | Start the development server           |
| `npm run build`   | Type-check and create production build |
| `npm run preview` | Preview the production build           |
| `npm run lint`    | Run static analysis                    |
| `npm run verify:career` | Verify the career engine and AI output guards |

---

# 🔄 CI/CD

TryBe uses **GitHub Actions** to automate quality checks and deployment.

```text
              Push / Pull Request
                       │
                       ▼
              ┌─────────────────┐
              │     Checkout    │
              └────────┬────────┘
                       ▼
              ┌─────────────────┐
              │   Setup Node    │
              └────────┬────────┘
                       ▼
              ┌─────────────────┐
              │  Install deps   │
              │     npm ci       │
              └────────┬────────┘
                       ▼
              ┌─────────────────┐
              │      Lint       │
              └────────┬────────┘
                       ▼
              ┌─────────────────┐
              │      Build      │
              │   npm run build │
              └────────┬────────┘
                       │
                 main branch
                       │
                       ▼
              ┌─────────────────┐
              │  GitHub Pages   │
              │    Deployment   │
              └─────────────────┘
```

### Pipeline behavior

* Every push/PR runs dependency installation, linting, and build checks.
* Pushes to `main` trigger production deployment.
* npm caching keeps CI execution efficient.
* Deployment is handled through GitHub Actions.

Workflow:

```text
.github/workflows/ci-cd.yml
```

---

# 🌐 Deployment

The project is configured for **GitHub Pages** deployment through the CI/CD workflow.

### One-time setup

1. Open the repository.
2. Go to **Settings → Pages**.
3. Select **GitHub Actions** as the deployment source.
4. Push to `main`.
5. GitHub Actions builds and deploys the application.

The application will be available at:

```text
https://<username>.github.io/<repo-name>/
```

### Vite base path

For project-based GitHub Pages deployments, configure the correct base path:

```ts
export default defineConfig({
  base: "/REPO-NAME/",
});
```

---

# ⚙️ Environment Configuration

When connecting the application to a backend or external services, environment variables should be stored in `.env`.

**Never commit secrets to Git.**

Example:

```env
VITE_API_BASE_URL=
VITE_APP_NAME=TryBe

# AI career layer (optional, server-side only — see "AI Career Intelligence Layer")
GEMINI_API_KEY=
```

A `.env.example` file should be maintained so contributors know which variables are required.

---

# 🤝 Contributing

Contributions are welcome.

### Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature

# Make your changes
git add .

# Commit
git commit -m "feat: add your feature"

# Push
git push origin feature/your-feature
```

Then open a Pull Request.

### Before submitting

Make sure:

```bash
npm run lint
npm run build
```

both pass successfully.

---

# 🔒 Security

For security-related issues and responsible vulnerability disclosure, see:

```text
SECURITY.md
```

Please avoid publicly disclosing security vulnerabilities before they have been responsibly reported.

---

# 📄 License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute the project with appropriate attribution.

---

<div align="center">

### Built for campus communities. 🎓

**TryBe**

*Connect · Discover · Participate*

</div>
