# 🎓 CampusConnect — College Social & Community Platform

> A modern, full-featured social platform for college communities — clubs, events, discussions, feeds, and messaging, all in one place.

[![CI/CD](https://github.com/krishchoudhary03/Trybe/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/ci-cd.yml)
[![Deployed on GitHub Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)
[![Made with React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](#tech-stack)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](#tech-stack)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite)](#tech-stack)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Architecture](#-architecture)
  - [High-Level System Design](#high-level-system-design)
  - [Application Layer Breakdown](#application-layer-breakdown)
  - [State & Data Orchestration](#state--data-orchestration)
  - [Component Architecture](#component-architecture)
  - [Data Model](#data-model)
- [Folder Structure](#-folder-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deployment](#-deployment)
- [Environment & Configuration](#-environment--configuration)
- [Contributing](#-contributing)
- [Security](#-security)
- [License](#-license)

---

## 🌟 Overview

**CampusConnect** is a single-page application (SPA) built for college students to discover, join, and engage with their campus community. It brings together **club management**, **event discovery**, **social feeds**, **discussions**, **direct messaging**, and **notifications** into one cohesive, mobile-first experience — inspired by modern social product design principles (see `apple-design.md` for the design philosophy this project follows).

The application is architected around a **context-driven, component-orchestrated React frontend**, with a clean separation between:

- **Presentation layer** (pages & components)
- **Domain/data layer** (typed data models)
- **Global orchestration layer** (React Context + routing)

---

## ✨ Core Features

| Module | Description |
|---|---|
| 🏫 **College Explore** | Discover colleges, browse their public profile (About, Feed, Clubs, Events, Discussions tabs) |
| 🎭 **Clubs** | Browse, join, and manage clubs; dedicated **Club Dashboard** for club admins |
| 📅 **Events** | Campus-wide and club-specific event listings with RSVP flows |
| 📰 **Home Feed** | Personalized, algorithmic-style social feed of campus activity |
| 💬 **Discussions** | Threaded, forum-style discussions scoped to a college/club |
| ✉️ **Messages** | Real-time-style direct messaging between users |
| 🔔 **Notifications** | Centralized notification center for social & platform events |
| 👤 **Profile & My College** | User profile management and personalized college dashboard |
| 🔍 **Discover** | Cross-platform discovery surface (people, colleges, clubs, projects) |
| 🧭 **Onboarding & Auth** | Guided onboarding, Signup/Login flows, Welcome screen |
| ⚙️ **Settings, Help, Legal, Contact** | Standard account & support surfaces |

---

## 🏗️ Architecture

### High-Level System Design

The application follows a **layered SPA architecture** with a central **orchestrator (`App.tsx`)** that owns routing, and a **global context (`AppContext.tsx`)** that owns shared application state — acting as the single source of truth consumed across all pages and components.

```
┌──────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                         │
│                                                                    │
│   ┌────────────────────────────────────────────────────────┐     │
│   │                     index.html (Entry)                  │     │
│   └───────────────────────────┬──────────────────────────────┘     │
│                                │                                    │
│   ┌───────────────────────────▼──────────────────────────────┐     │
│   │                    src/main.tsx (Bootstrap)               │     │
│   │   - Mounts React root                                     │     │
│   │   - Wraps app in Providers (Context, Router)               │     │
│   └───────────────────────────┬──────────────────────────────┘     │
│                                │                                    │
│   ┌───────────────────────────▼──────────────────────────────┐     │
│   │              src/App.tsx  ── ORCHESTRATOR ──               │     │
│   │   - Route table / navigation orchestration                 │     │
│   │   - Layout composition (src/components/Layout.tsx)         │     │
│   │   - Wraps pages with AppContext.Provider                   │     │
│   └───────┬───────────────────────────────────────┬───────────┘     │
│           │                                        │                 │
│   ┌───────▼────────────┐                 ┌─────────▼──────────┐     │
│   │   AppContext.tsx    │◄───────────────►│      Pages Layer    │     │
│   │  (Global Store)      │   read/write    │  (src/pages/*.tsx)  │     │
│   │  - user session       │   state         │  Home, Discover,   │     │
│   │  - active college     │                 │  Clubs, Messages,  │     │
│   │  - notifications      │                 │  Profile, etc.     │     │
│   │  - UI/global flags    │                 └─────────┬───────────┘     │
│   └───────────────────────┘                           │                 │
│                                                        │                 │
│                                     ┌──────────────────▼──────────────┐  │
│                                     │      Feature Components          │  │
│                                     │  (src/components/college/*)      │  │
│                                     │  FeedTab, ClubsTab, EventsTab,   │  │
│                                     │  DiscussionsTab, AboutTab,       │  │
│                                     │  RightSidebar, Modal              │  │
│                                     └──────────────────┬──────────────┘  │
│                                                        │                 │
│                                     ┌──────────────────▼──────────────┐  │
│                                     │        Data / Domain Layer       │  │
│                                     │        (src/data/*.ts)           │  │
│                                     │  colleges, clubs, events,        │  │
│                                     │  people, projects, types.ts      │  │
│                                     │  (typed models — single source   │  │
│                                     │   of truth for shape of data)    │  │
│                                     └───────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Application Layer Breakdown

| Layer | Responsibility | Key Files |
|---|---|---|
| **Bootstrap** | Mounts the React tree, sets up global providers | `src/main.tsx` |
| **Orchestrator** | Owns routing, global layout, page composition | `src/App.tsx`, `src/components/Layout.tsx` |
| **Global State** | Cross-cutting app state, shared across every page | `src/context/AppContext.tsx` |
| **Pages** | Route-level screens, one per URL/view | `src/pages/*.tsx` |
| **Feature Components** | Reusable, composable UI blocks scoped to a domain (e.g., a College) | `src/components/college/*.tsx`, `src/components/Modal.tsx` |
| **Data/Domain** | Static/typed data models representing core entities | `src/data/*.ts` |
| **Styling** | Global design tokens & utility styles | `src/index.css`, `apple-design.md` |

### State & Data Orchestration

The **`AppContext.tsx`** acts as the app's lightweight orchestrator/state machine using React's Context + Hooks pattern (no external state library required at this scale):

```
                     ┌────────────────────────────┐
                     │      AppContext Provider     │
                     │ ─────────────────────────── │
                     │  • currentUser                │
                     │  • activeCollege              │
                     │  • notifications[]             │
                     │  • messages[]                  │
                     │  • ui state (modals, tabs)      │
                     └───────────┬───────────────────┘
                                 │ useContext(AppContext)
        ┌────────────────────────┼────────────────────────┐
        │                        │                         │
 ┌──────▼──────┐        ┌────────▼────────┐       ┌────────▼────────┐
 │  HomeFeed    │        │  CollegeExplore   │       │    Messages      │
 │  Discover    │        │  ├─ AboutTab       │       │    Notifications │
 │  Clubs       │        │  ├─ FeedTab        │       │    Profile       │
 │  Work        │        │  ├─ ClubsTab       │       └──────────────────┘
 └──────────────┘        │  ├─ EventsTab      │
                          │  └─ DiscussionsTab  │
                          └──────────────────────┘
```

**Data flow principle:** Pages/components **read** from context via `useContext`/custom hooks and **dispatch** updates through context-exposed action functions — keeping mutation logic centralized and predictable, similar to a mini Flux pattern without the Redux boilerplate.

### Component Architecture

- **Container/Tab pattern**: `CollegeExplore.tsx` acts as a container page that renders tab-based feature components (`AboutTab`, `FeedTab`, `ClubsTab`, `EventsTab`, `DiscussionsTab`) — each tab is independently responsible for its own slice of UI, but reads shared state from context.
- **Composable primitives**: `Modal.tsx` and `RightSidebar.tsx` are reusable UI primitives shared across multiple pages.
- **Dashboard pattern**: `ClubDashboard.tsx` is a role-scoped page (club admins) separate from the public `Clubs.tsx` listing page — enforcing a clear separation between public and management views.

### Data Model

All domain entities are strongly typed via `src/data/types.ts`, with static/mock data seeded in dedicated files:

```
types.ts        →  Shared TypeScript interfaces (College, Club, Event, Person, Project, ...)
colleges.ts      →  College entity data
clubs.ts          →  Club entity data
events.ts          →  Event entity data
people.ts           →  User/People entity data
projects.ts           →  Project/portfolio entity data
```

This keeps the **domain model decoupled from UI**, so swapping mock data for a real API/backend later only requires changing the data layer — pages and components remain untouched.

---

## 📁 Folder Structure

```
.
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # CI/CD pipeline (lint, build, deploy)
├── dist/                       # Production build output (generated)
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
│   ├── context/
│   │   └── AppContext.tsx      # Global state orchestrator
│   ├── data/
│   │   ├── clubs.ts
│   │   ├── colleges.ts
│   │   ├── events.ts
│   │   ├── people.ts
│   │   ├── projects.ts
│   │   └── types.ts
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
│   ├── App.tsx                  # Route orchestrator
│   ├── main.tsx                 # App bootstrap/entry
│   └── index.css                # Global styles
├── apple-design.md              # Design system philosophy
├── index.html                   # HTML entry point
├── metadata.json
├── SECURITY.md
└── README.md
```

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 18 |
| **Language** | TypeScript |
| **Build Tool** | Vite |
| **Styling** | CSS (custom design system — see `apple-design.md`) |
| **State Management** | React Context API + Hooks |
| **Routing** | React Router (via `App.tsx` orchestration) |
| **CI/CD** | GitHub Actions |
| **Hosting** | GitHub Pages |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or `yarn` / `pnpm`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/USERNAME/REPO.git
cd REPO

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173` (Vite default).

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the local development server with hot-reload |
| `npm run build` | Type-checks and builds the app for production into `dist/` |
| `npm run preview` | Serves the production build locally for a final check |
| `npm run lint` | Runs static analysis / linting across the codebase |

---

## 🔄 CI/CD Pipeline

This project ships with a **GitHub Actions** workflow (`.github/workflows/ci-cd.yml`) that automates quality checks and deployment on every push.

### Pipeline Stages

```
 push / PR to main
        │
        ▼
┌───────────────────┐
│   1. Checkout       │  actions/checkout
└─────────┬───────────┘
          ▼
┌───────────────────┐
│  2. Setup Node       │  actions/setup-node + npm cache
└─────────┬───────────┘
          ▼
┌───────────────────┐
│  3. Install deps     │  npm ci
└─────────┬───────────┘
          ▼
┌───────────────────┐
│  4. Lint (optional)  │  npm run lint
└─────────┬───────────┘
          ▼
┌───────────────────┐
│  5. Build            │  npm run build → dist/
└─────────┬───────────┘
          ▼
   ┌──────┴───────┐
   │  on: main only │
   ▼
┌───────────────────┐
│  6. Deploy           │  Upload dist/ → GitHub Pages
└───────────────────┘
```

- **On every push/PR** → install, lint, and build are run to catch errors early (fast feedback loop).
- **On push to `main` only** → the build artifact (`dist/`) is deployed automatically to **GitHub Pages**.
- Uses **caching** for `node_modules`/npm to keep pipeline runs fast.
- Uses the official `actions/deploy-pages` action — no manual `gh-pages` branch management needed.

> See the full workflow file at [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

---

## 🌐 Deployment

This project auto-deploys to **GitHub Pages** via the CI/CD pipeline above.

**One-time repo setup required:**
1. Go to your repo → **Settings → Pages**
2. Under **Build and deployment → Source**, select **GitHub Actions**
3. Push to `main` — the pipeline will build and deploy automatically
4. Your app will be live at: `https://<username>.github.io/<repo-name>/`

> ⚠️ If deploying to a subpath (project pages, not a custom domain), make sure `vite.config.ts` has the correct `base` path set, e.g. `base: '/REPO-NAME/'`.

---

## ⚙️ Environment & Configuration

If/when this project connects to real backend services, environment variables should be defined in a `.env` file (never committed) and referenced via `import.meta.env.VITE_*`. A `.env.example` should be maintained for onboarding new contributors.

```
VITE_API_BASE_URL=
VITE_APP_NAME=CampusConnect
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure `npm run build` and `npm run lint` pass before opening a PR — the CI pipeline will verify this automatically.

---

## 🔒 Security

Please see [`SECURITY.md`](SECURITY.md) for our security policy and how to report vulnerabilities responsibly.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute with attribution.

---

<p align="center">Built with ❤️ for campus communities.</p>
