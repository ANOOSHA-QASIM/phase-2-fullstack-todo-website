# Quickstart Guide: Todo Web Application – Frontend UI

## Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Git

## Setup Instructions

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the project root with:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_APP_NAME="Todo App"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the application

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues

## Project Structure Overview

```
app/                    # Next.js App Router pages
├── layout.tsx         # Root layout
├── page.tsx           # Home page
├── login/page.tsx     # Login page
├── signup/page.tsx    # Signup page
└── dashboard/page.tsx # Dashboard page

components/            # Reusable React components
├── layout/            # Navigation and structural components
├── ui/                # Base UI components
└── todo/              # Todo-specific components

lib/                   # Utility functions and API clients
├── api.ts             # API client implementation
└── auth.ts            # Authentication utilities

types/                 # TypeScript type definitions
├── todo.ts            # Todo-related types
└── user.ts            # User-related types
```

## Key Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessibility**: WCAG 2.1 AA compliant
- **Animations**: Smooth transitions using Framer Motion
- **Theming**: Purple-based Antigravity design system

## Next Steps

1. Explore the UI components in `components/`
2. Review the API integration in `lib/api.ts`
3. Customize the theme in `app/globals.css`
4. Add your own functionality following the established patterns