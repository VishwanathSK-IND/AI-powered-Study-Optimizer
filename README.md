# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


⚡ StudyOS — AI-Powered Study Optimizer
A full-stack React application that helps students plan, track, and optimize their study habits using AI-generated insights.

🎯 Problem Statement
Who is the user? College/university students who study multiple subjects and struggle to manage their time effectively.
What problem does it solve? Most students don't know where their study time actually goes, which subjects they're neglecting, or how to improve their routine. StudyOS tracks real sessions, sets goals, and uses AI to surface personalized insights — so students can make smarter decisions about how they spend their time.
Why does it matter? Better study habits directly impact academic performance, reduce exam stress, and build long-term learning skills.

✨ Features
FeatureDescription🔐 AuthenticationEmail/password login and signup via Firebase Auth📚 Subject ManagementAdd, edit, delete subjects with color tags and weekly hour targets⏱ Focus TimerPomodoro-style timer (25/5/15 min modes + custom) with session logging🎯 Goal TrackerSet, prioritize, deadline, and complete study goals🤖 AI InsightsClaude-powered analysis of your study patterns + chat coach📊 DashboardLive stats: total hours, subjects, goals, weekly sessions💾 Persistent StorageAll data synced to Firestore in real time

🛠 Tech Stack

React 18 — functional components, hooks, lazy loading
React Router v6 — client-side routing with protected routes
Firebase — Auth (email/password) + Firestore (database)
Claude API — AI study insights and chat coach
Custom CSS — no component library, hand-crafted dark theme


⚛️ React Concepts Used
Core

Functional components throughout
Props and component composition (StatCard, Navbar, ProtectedRoute)
useState — form state, timer state, UI toggles
useEffect — data loading, timer intervals, auth listener
Conditional rendering — loading states, empty states, error banners
Lists and keys — subjects, sessions, goals

Intermediate

Lifting state up — StudyContext lifts data shared across pages
Controlled components — all forms use controlled inputs
React Router — 6 routes, protected routes, useNavigate, useLocation
Context API — AuthContext and StudyContext for global state

Advanced

useMemo — dashboard stats recalculation
useCallback — stable function references in contexts
useRef — timer interval ref, previous-state tracking
useReducer — StudyContext uses reducer for predictable state updates
React.lazy + Suspense — all pages are lazy-loaded
Custom hooks — useTimer, useLocalStorage


🚀 Setup Instructions
1. Clone the repo
bashgit clone https://github.com/your-username/ai-study-optimizer.git
cd ai-study-optimizer
2. Install dependencies
bashnpm install
3. Set up Firebase

Go to Firebase Console
Create a new project
Enable Email/Password authentication
Create a Firestore database (start in test mode)
Copy your config into src/services/firebase.js

4. Set up Firestore security rules
In Firebase Console → Firestore → Rules:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{docId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
5. Add your Anthropic API key
In src/pages/Insights.jsx, the fetch call to https://api.anthropic.com/v1/messages requires your API key to be handled by a backend proxy. For development, you can temporarily add it as a header (never commit this to production):
jsheaders: {
  "Content-Type": "application/json",
  "x-api-key": "YOUR_ANTHROPIC_KEY",  // dev only
  "anthropic-version": "2023-06-01"
}
For production, route the request through a simple backend (Node/Express or Firebase Function).
6. Run the app
bashnpm start

📁 Folder Structure
src/
├── components/
│   ├── Navbar.jsx          # Top navigation bar
│   └── ProtectedRoute.jsx  # Auth guard for protected pages
├── context/
│   ├── AuthContext.jsx     # Global auth state
│   └── StudyContext.jsx    # Global study data (useReducer)
├── hooks/
│   ├── useTimer.js         # Pomodoro timer logic
│   └── useLocalStorage.js  # Persistent local state
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── Subjects.jsx
│   ├── Timer.jsx
│   ├── Goals.jsx
│   └── Insights.jsx
├── services/
│   ├── firebase.js         # Firebase init
│   └── studyService.js     # All Firestore CRUD operations
├── App.jsx                 # Routes + providers
├── index.js                # React entry point
└── styles.css              # Global styles

🌐 Deployment
Deploy to Vercel:
bashnpm run build
# then drag the build/ folder into vercel.com or use the CLI
Or Netlify:
bashnpm run build
# connect your GitHub repo in netlify.com and set build command to: npm run build

📋 Firestore Collections
CollectionFieldssubjectsuserId, name, description, color, targetHours, createdAtsessionsuserId, subjectId, subjectName, duration, notes, mode, createdAtgoalsuserId, title, description, deadline, priority, completed, createdAt

🧪 Edge Cases Handled

Unauthenticated access redirects to /login
Empty states for all lists
Firebase error codes mapped to readable messages
Timer prevents saving sessions under 1 minute
Overdue goals are visually flagged
Goal completion persists across refreshes
Subject deletion does not remove linked sessions