# OneTop Frontend - Remix.js

Modern recruitment platform frontend built with Remix.js, React, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Remix.js 2.13+ (React 18)
- **Language**: TypeScript 5.6+
- **Styling**: Tailwind CSS 3.4+
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **WebSocket**: Socket.io-client
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Date**: date-fns

## 📦 Features

### ✅ Implemented
- Modern landing page with stats
- Responsive design (mobile-first)
- API client with auto token refresh
- WebSocket service for real-time features
- Type-safe API calls
- Utility functions (date, currency, file handling)

### 🎯 Core Features (To Implement)
- [ ] Authentication (Login/Register/Logout)
- [ ] Job Search with Elasticsearch
- [ ] Job Details & Application
- [ ] Resume Builder & Upload
- [ ] Real-time Chat (Recruiter ↔ Candidate)
- [ ] Notifications System
- [ ] User Dashboard (Candidate)
- [ ] Recruiter Dashboard (Job Management)
- [ ] Application Tracking
- [ ] Protected File Downloads

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
app/
├── routes/              # Remix routes (pages)
│   ├── _index.tsx      # Landing page
│   ├── login.tsx       # Login page
│   ├── register.tsx    # Register page
│   ├── jobs/           # Job listings & details
│   ├── dashboard/      # User dashboards
│   └── chat/           # Real-time chat
├── lib/
│   ├── api.ts          # API client & services
│   ├── websocket.ts    # WebSocket service
│   ├── types.ts        # TypeScript types
│   └── utils.ts        # Utility functions
├── components/         # Reusable components
│   ├── ui/            # Base UI components
│   ├── jobs/          # Job-related components
│   ├── chat/          # Chat components
│   └── layout/        # Layout components
├── hooks/             # Custom React hooks
├── styles/            # Global styles
└── root.tsx           # App root
```

## 🔗 Backend Integration

The frontend connects to Django backend via:

### REST API (`http://localhost:8000/api/v1/`)
- Authentication: JWT tokens (access + refresh)
- Jobs, Applications, Resumes, Companies
- Protected file downloads

### WebSocket (`ws://localhost:8000/ws/`)
- Real-time chat
- Notifications
- Typing indicators

### Proxy Configuration (Development)
```typescript
// vite.config.ts
server: {
  port: 3000,
  proxy: {
    '/api': 'http://localhost:8000',
    '/ws': 'ws://localhost:8000',
  },
}
```

## 🎨 Design System

### Colors
- Primary: Blue (`#3b82f6`)
- Success: Green
- Warning: Yellow
- Error: Red

### Typography
- Font: Inter (Google Fonts)
- Sizes: Tailwind defaults

### Components
- Buttons: Primary, Secondary, Ghost
- Forms: Input, Select, Textarea, File Upload
- Cards: Job Card, Application Card
- Modals: Confirmation, Form
- Toast: Notifications

## 🔐 Authentication Flow

```typescript
1. User submits login form
2. POST /api/v1/auth/login/ → { access, refresh }
3. Store tokens in localStorage
4. Add Bearer token to all API requests
5. Auto-refresh on 401 error
6. Redirect to /dashboard
```

## 📱 Pages to Create

### Public Pages
- `/` - Landing page ✅
- `/login` - Login form
- `/register` - Registration form
- `/jobs` - Job listings with search
- `/jobs/:id` - Job details
- `/companies` - Company directory
- `/companies/:id` - Company profile

### Authenticated Pages (Candidate)
- `/dashboard` - Applications overview
- `/resumes` - Resume management
- `/resumes/new` - Resume builder
- `/applications` - Application history
- `/chat` - Real-time chat with recruiters
- `/profile` - User profile settings

### Authenticated Pages (Recruiter)
- `/recruiter/dashboard` - Jobs overview
- `/recruiter/jobs` - Job management
- `/recruiter/jobs/new` - Post new job
- `/recruiter/jobs/:id/edit` - Edit job
- `/recruiter/applications` - Application tracking
- `/recruiter/chat` - Chat with candidates

## 🚀 Next Steps

1. **Authentication Pages**
   ```bash
   # Create login & register routes
   app/routes/login.tsx
   app/routes/register.tsx
   ```

2. **Job Search**
   ```bash
   # Job listings with Elasticsearch
   app/routes/jobs._index.tsx
   app/routes/jobs.$id.tsx
   ```

3. **Dashboard**
   ```bash
   # User dashboard with applications
   app/routes/dashboard._index.tsx
   ```

4. **Real-time Chat**
   ```bash
   # WebSocket-powered chat
   app/routes/chat._index.tsx
   app/routes/chat.$conversationId.tsx
   ```

## 🧪 Testing

```bash
# Run tests (setup required)
npm test

# E2E tests with Playwright
npm run test:e2e
```

## 📝 Environment Variables

Create `.env` file:

```env
# API URLs
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Features
VITE_ENABLE_ANALYTICS=false
```

## 🔧 Development Tips

- Use `loader` functions for server-side data fetching
- Use `action` functions for form submissions
- Leverage Remix's automatic revalidation
- Use TanStack Query for client-side caching
- Keep components small and focused
- Use TypeScript strictly

## 📚 Resources

- [Remix Docs](https://remix.run/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com)

---

**Status**: 🟡 Initial setup complete, ready for feature development
