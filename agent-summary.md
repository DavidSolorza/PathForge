# PathForge AI — Session Summary

## Goal
Build PathForge AI, a web platform that generates intelligent personalized learning paths for programming/tech, with polished UI/UX following Emil Kowalski design principles, pre-path surveys, real topic content, full test coverage, and a complete AI agent system.

## Constraints & Preferences
- React + TypeScript + Vite + pnpm + TailwindCSS v4 + Zustand + Framer Motion + Lucide React + Axios + React Router DOM
- Vertical Slice Architecture: `core/` → `shared/` → `features/`
- **Tech-only**: no non-programming topics (yoga, music, cooking, etc.)
- **No emojis anywhere** in UI or AI output
- AI system: Gemini API; NO video/YouTube URLs, author names instead ("Busca a midudev")
- Pre-path survey: weekly hours, learning method, current level, project preference
- Topics include real learning content (mini-classes + code snippets), not empty links
- Resources with `url: '#'` are hidden (real URLs only)
- Demo user: `demo@pathforge.ai` / `123456`
- All data in localStorage; backend prepared for MongoDB via DbAdapter pattern

## Progress
### Done
- **Pre-path survey**: generator mode shows form for weekly hours, learning method, current level, project preference before generating a path
- **Topic content**: each topic stores a mini-class description; fallback content generated via `generateFallbackContent()` when AI is offline
- **Resources filtered**: only resources with real URLs displayed in LearningPathPage
- **AiService enhanced**: generatePath accepts PathPreferences; prompt includes content + real doc URLs; `stagesFromDefs` generates fallback content for hardcoded topics
- **Title generation fixed**: regex strips intro phrases (quiero, aprender, dominando, desde cero, para, como) from goals
- **Java topic added**: full 4-stage SPECIFIC_TOPICS entry
- **Dashboard stats fixed**: computed directly from actual path data on mount (PathStorageService.getAll() + recalculate from stages)
- **DbAdapter pattern created** (`DbAdapter.ts`: get/set/update/delete/getAll/getById; `ApiAdapter.ts`: REST + localStorage fallback; `ApiService.ts`: Axios + JWT interceptor)
- **Full Express + MongoDB server** (`server/`) with Mongoose models, REST routes, auth middleware, Socket.io
- **.ai/ directory**: full AI Software Company system with 10 agents, 22 rule files, 7 workflows, 6 prompts, 6 memory files, 5 templates
- **.cursor/rules/**: 9 rule files for Cursor IDE auto-detection (system, architecture, frontend, backend, database, uiux, reviewer, testing, devops)
- **Fixed 47+ async/await bugs**: all callers of async DbAdapter storage services now properly await (AuthService, PathStorageService.test, ProfilePage, SkillsPage, UserStorageService.test, ProjectModal, ProjectsPage, AIAssistantPage, AiService)
- **Chat bugs fixed (6 issues)**:
  - `addMsg()` and `handleClear()` now await storage calls (were fire-and-forget)
  - `saveCurrent()` uses batch `setChatHistory()` instead of O(n) clear+re-add loop
  - Added `setChatHistory()` / `setGeneratorHistory()` to RecommendationStorageService
  - `MessageContent` now renders code blocks (triple backticks) with dark theme `<pre><code>`
  - Unified message ID prefixes to `msg_` (was mixing `chat_` and `msg_`)
  - Removed dead `useChatStore` (was persisting to localStorage but never read)
- **`ApiAdapter.update()` fixed**: now also pushes changes to REST API when online
- **Fallback AI responses improved**: `getSmartFallback()` rewritten with practical answers:
  - Python/JavaScript/React/HTML/CSS/Docker/SQL/Node/Git/TypeScript/Ciberseguridad/IA/Datos: each has real code, mini-exercise, learning roadmap, recommended author
  - New pattern handlers: progress analysis ("analiza mi progreso"), readiness evaluation ("estoy listo?"), next steps ("que sigue?"), project ideas
  - Removed non-tech topics (emprendimiento, productividad, matematicas)
  - Generic fallback no longer has `[tema]` placeholder — dynamically extracts topic from user message
- **UI polish**: custom thin scrollbar (dark mode aware), selection colors, font smoothing + font-feature-settings, shimmer skeleton variant in LoadingState + Skeleton, toast moved to bottom-right with animated progress bar using requestAnimationFrame, card dark mode + hover glow, button dark mode variants, route page transitions via AnimatePresence + location.key in AppLayout, EmptyState with framer-motion entrance (scale-in icon, fade-in content), AnimatedCounter with scroll-triggered (useInView) ease-out cubic animation, sidebar dark mode (neutral-900 bg, hover states), header/outlet dark mode, auth pages dark mode, all shared UI components (Input, Badge, Avatar, Progress, CardHeader, CardFooter) dark mode classes, theme sync from useUIStore to document.documentElement via useEffect

### Blocked
- (none)

## Key Decisions
- **Theme sync**: useUIStore.theme synced to `<html>` classList via useEffect in AppLayout (not in store), allowing Tailwind `dark:` class to work with `class` strategy
- **AnimatedCounter**: uses `useInView` from framer-motion with `once: true`, requestAnimationFrame loop with cubic ease-out (`1 - (1-t)^3`), auto-starts when scrolled into view
- **Toast progress bar**: driven by requestAnimationFrame for smooth 60fps animation, bottom-right position, spring enter/exit transitions
- **Skeleton shimmer**: CSS `@keyframes shimmer` with linear gradient sliding left-to-right over 200% background-size, inherited by Skeleton and LoadingState skeleton variant
- **Pre-path survey**: mandatory before path generation to fully personalize content, pace, and project complexity
- **Topic content over links**: each topic stores a mini-class with explanations + code; links only shown when they have real URLs
- **Clean title extraction**: "Quiero aprender Java" → just "Java" via regex stripping of intro phrases
- **Stats from paths**: Dashboard calculates completedTopics and totalProgress directly from path stages on mount, not from stale store values
- **DbAdapter pattern**: all storage through interface supporting localStorage (current) and REST API (future); services switch adapters transparently
- **Server in same repo**: `server/` at project root with own package.json + tsconfig
- **Chat storage pattern**: messages persisted via `RecommendationStorageService` with batch `setChatHistory()` (not per-message appends) for saveCurrent; removed dead `useChatStore` that duplicated state
- **Message IDs unified**: all messages use `msg_${timestamp}` format (was inconsistently `chat_` for AI responses)
- **Fallback responses as teaching tools**: each topic response includes real runnable code, a specific exercise, and learning roadmap — not generic wiki definitions
- **Progress/readiness patterns**: specific handlers for "analiza mi progreso", "estoy listo?", "que sigue?", "ideas de proyectos" — each gives structured actionable advice

## Next Steps
- Migrate remaining StorageService classes to use DbAdapter pattern
- Deploy MongoDB Atlas cluster and update `server/.env`
- Start server (`cd server && pnpm dev`) and verify health endpoint
- Test full flow: register via API → login → create path → complete topic → verify stats via API
- Add remaining page dark mode support (Skills, Projects, Profile, AI Assistant, Learning Path pages)
- Consider adding focus-visible ring styles for keyboard navigation

## Critical Context
- Gemini API key: set in `.env` as `VITE_GEMINI_API_KEY` — **not tracked by git**
- Dev server: `pnpm dev` → Vite v8.0.13 on `localhost:5173`
- Build: `pnpm build` → 0 errors
- Tests: `pnpm test` → 83/83 passing
- Server: `cd server && pnpm dev` → Express + Socket.io on `localhost:3000`
- DbAdapter allows gradual migration: each service switches from localStorage to API independently
- `PathPreferences` type: `weeklyHours`, `learningMethod`, `currentLevel`, `projectPreference`
- `Topic.content` is optional; old paths without content display `generateFallbackContent()` text
- `message.id` format: `msg_${Date.now()}` (user), `msg_${Date.now()}_ai` (assistant)

## Relevant Files
- `src/index.css`: global styles (scrollbar, selection, keyframes, shimmer, dark overrides)
- `src/shared/components/ui/AnimatedCounter.tsx`: scroll-triggered animated counter with easeOutCubic
- `src/shared/components/ui/LoadingState.tsx`: skeleton variant with shimmer pulses
- `src/shared/components/ui/Skeleton.tsx`: shimmer overlay on pulse animation
- `src/shared/components/ui/Toast.tsx`: requestAnimationFrame progress bar, bottom-right, spring transitions
- `src/shared/components/ui/Card.tsx`: dark mode borders/bg + hover glow
- `src/shared/components/ui/Button.tsx`: dark mode variants for all types
- `src/shared/components/ui/EmptyState.tsx`: framer-motion entrance (scale icon, fade content)
- `src/shared/components/ui/Input.tsx`: dark mode borders/bg/text
- `src/shared/components/ui/Badge.tsx`: dark mode variants
- `src/shared/components/ui/Avatar.tsx`: dark mode bg/text
- `src/shared/components/ui/Progress.tsx`: dark mode track/text
- `src/shared/layouts/AppLayout.tsx`: theme sync to html, dark sidebar/header, page transition AnimatePresence
- `src/shared/layouts/AuthLayout.tsx`: dark mode bg
- `src/features/auth/pages/LoginPage.tsx`: dark mode text/links/divider
- `src/features/auth/pages/RegisterPage.tsx`: dark mode text/links
- `src/features/learning-path/pages/DashboardPage.tsx`: AnimatedCounter, dark mode throughout
