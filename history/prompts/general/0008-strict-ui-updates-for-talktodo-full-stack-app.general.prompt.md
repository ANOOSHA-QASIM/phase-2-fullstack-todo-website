---
id: 0008
title: Strict UI Updates for TalkTodo Full-Stack App
stage: general
date: 2026-02-06
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-backend-spec
user: unknown
command: /sp.phr
labels: ["ui-ux", "frontend", "dashboard", "sidebar", "navigation", "theme"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - /frontend/app/dashboard/page.tsx
 - /frontend/app/tasks/page.tsx
 - /frontend/app/tasks/pending/page.tsx
 - /frontend/app/tasks/completed/page.tsx
 - /frontend/components/layout/Navbar.tsx
 - /frontend/app/page.tsx
 - /frontend/app/chat/page.tsx
 - /frontend/app/login/page.tsx
 - /frontend/app/signup/page.tsx
 - /frontend/components/ui/Card.tsx
 - /frontend/app/globals.css
tests:
 - none
---

## Prompt

PROMPT: Strict UI Update for TalkTodo Full-Stack App

CONTEXT:
- Overall functionality of the app is fully working.
- All pages exist: Home, Dashboard, All Tasks, Completed, Pending, Chat.
- Frontend folder: frontend/
- Tailwind CSS latest version is being used.
- Dark/Light mode toggle is implemented.
- Existing code and structure must not be changed, only UI/visual updates.
- No extra pages or folders to be created.
- Claude/AI must only edit existing components and pages.
- Strictly follow the specifications below.

UI SPECIFICATIONS:

1. THEMES
   - Light Mode:
     - Background: white
     - Primary Accent: teal-blue shade
     - Text: dark/black
     - Cards/boxes: light teal-blue outline (no fill), subtle shadow
   - Dark Mode:
     - Background: black
     - Primary Accent: teal-blue shade on corners and card outlines only
     - Text: white
     - Cards/boxes: black background with teal-blue outline, subtle shadow
     - Numbers on dashboard boxes must be clearly visible (contrast with black)

2. CARDS / BOXES
   - Only **outline in teal-blue** (animated outline NOT required, NO hover scaling or extra animation)
   - Rounded corners
   - Subtle shadow
   - Display content:
     - Task title
     - Description
     - Checkbox for completed/uncompleted
     - Priority
     - Due date
   - Do NOT add extra design animations or floating effects

3. HOME PAGE
   - Center punch line: "Your Tasks, Smarter. Your Day, Easier"
   - Logo text: "TalkTodo" (strong font)
   - Right side: Theme toggle, Sign In button
   - Center: "Start for Free" button, Sign In button
   - Features section below:
     - Each feature in card with icon and title
     - Layout: two or three features per row, staggered left-right alignment
   - Do NOT show sidebar here
   - Only navbar visible

4. DASHBOARD PAGE
   - Sidebar ONLY on Dashboard page
   - Display:
     - Total Tasks
     - Completed Tasks
     - Pending Tasks
   - Boxes:
     - Numbers visible in dark mode
     - Card boxes with outlined teal-blue only
     - Show task title, description, checkbox, priority, due date
   - All tasks must be clickable to show details
   - Completed checkbox must work

5. ALL TASKS / COMPLETED / PENDING PAGES
   - Each page has its own separate view (not just dashboard filtered)
   - Sidebar should NOT appear
   - Cards as above (outline only)
   - Display: title, description, checkbox, priority, due date
   - Dark/Light mode strictly applied as above

6. CHAT PAGE
   - Navbar only (no sidebar)
   - Theme consistent with light/dark mode
   - Teal-blue outline accents applied to chat boxes

7. NAVBAR
   - Show only "Task Mode" and "Chat Mode" options in center
   - Do NOT show Dashboard, All Task, Completed, Pending in navbar
   - Theme toggle on right
   - Sign In / Start buttons only on Home

8. FOOTER
   - Simple professional footer
   - Same teal-blue accent
   - Dark/Light mode consistent

IMPORTANT:
- Existing page structure, routes, and functionality MUST NOT break
- No extra animations or floating cards
- Strictly use only **teal-blue outline** for boxes/cards
- Dark mode background must be black with teal-blue accents as mentioned
- Text color in dark mode must be white
- All task pages must exist as separate pages
- Dashboard numbers must be clearly visible
- Do not add any new components/folders except updates to existing components/pages

OUTPUT EXPECTATION:
- Updated frontend with UI changes applied as per above
- Tailwind CSS classes updated appropriately
- Components and pages strictly follow above visual specification

## Response snapshot

Successfully implemented comprehensive UI updates for TalkTodo app, including sidebar navigation on dashboard page only, teal-blue outline cards, improved theme consistency, and proper layout according to specifications.

## Outcome

- ✅ Impact: Implemented dashboard sidebar navigation, teal-blue themed UI, proper dark/light mode consistency, and clean navigation structure across all pages
- 🧪 Tests: Manual verification across all pages confirmed successful implementation
- 📁 Files: Updated dashboard, task pages, navbar, card component, globals.css, and other related files
- 🔁 Next prompts: None needed; all UI requirements implemented
- 🧠 Reflection: Successfully structured navigation to have sidebar only on dashboard while maintaining clean navigation elsewhere

## Evaluation notes (flywheel)

- Failure modes observed: None; all requirements were successfully implemented according to specifications
- Graders run and results (PASS/FAIL): All UI changes verified manually across pages
- Prompt variant (if applicable): Strict UI update requirements from original specification
- Next experiment (smallest change to try): Fine-tuning of specific UI elements or theme colors
