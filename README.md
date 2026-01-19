# TaskFlow - Real-Time Collaborative Task Manager

A production-ready, full-stack task management application with real-time collaboration, smart notifications, and role-based permissions. Built with modern web technologies and clean architecture principles.

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-20-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248)

## 🚀 Live Demo

**Application**: [https://collaborative-task-manager-indol.vercel.app](https://collaborative-task-manager-indol.vercel.app)

---

## ✨ Key Features

### Task Management
- **Two-Way Consent System** - Task assignments require acceptance from assignees, ensuring mutual agreement
- **Role-Based Permissions** - Creators have full control, assignees can update status only, others have read-only access
- **Smart Status Workflow** - Assignees can mark tasks as "To Do", "In Progress", or "Review"; only creators can mark as "Completed"
- **Auto-Cleanup on Completion** - Completed tasks are automatically archived and removed from database for workspace cleanliness
- **Real-Time Synchronization** - Live updates across all users via Socket.io with optimistic UI updates
- **Pending Invitation Tracking** - Shows correct assignee in forms even before invitation acceptance
- **Task Reassignment** - Creators can reassign tasks; new invitations sent automatically

### Notifications & Collaboration
- **Contextual Notifications** - Smart, professional messages with emojis:
  - 📋 Task invitation sent
  - ✅ Invitation accepted
  - ❌ Invitation declined  
  - 👀 Task submitted for review
  - 📝 Task needs revision
  - ✅ Task completed
- **Separate Invitation Display** - Pending invitations shown separately from notifications
- **Review Workflow** - Assignees submit for review, creators approve or request changes
- **No Duplicate Notifications** - Smart filtering prevents duplicate messages
- **Auto-Cleanup** - Notifications deleted when tasks are completed

### Security & Performance
- **JWT Authentication** - Secure token-based auth with HttpOnly cookies and Authorization header fallback
- **Auto-Logout on User Deletion** - Validates user existence on app mount, clears localStorage if deleted
- **Rate Limiting** - 100 requests per 15 minutes per IP to prevent abuse
- **Optimistic Updates** - Instant UI feedback using React Query with automatic rollback on errors
- **Permission Enforcement** - Backend validates all operations; assignees restricted to status updates only
- **Input Validation** - Strict validation for creation, lenient for updates (Zod schemas)
- **CORS Protection** - Restricts cross-origin requests to authorized domains

### User Experience
- **Professional UI/UX** - Expert-level design with smooth animations and transitions
- **Fully Responsive** - Mobile-first design optimized for phone, tablet, and desktop
- **Visual Task Cards** - Shows "Creator → Assignee" relationship with colored badges
- **Advanced Filtering** - Filter by status, priority, assignee; search by title/description
- **Keyboard Shortcuts** - Quick actions (N: new task, G: toggle view, ?: help, ESC: close)
- **Smart Dropdowns** - Auto-fills assigned users, hides irrelevant options based on context
- **Loading States** - Skeleton loaders and descriptive loading text
- **Toast Notifications** - Professional, single-message feedback system
- **Form Validation** - Real-time validation with clear error messages
- **Animated Backgrounds** - Gradient blobs on auth pages for visual appeal

---

## 🛠 Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Query, Socket.io Client  
**Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose, Socket.io, JWT  
**DevOps**: Docker, Vercel (Frontend), Render (Backend), MongoDB Atlas

---

## 🏗 Architecture

### Clean 3-Layer Architecture
```
Controller → Service → Repository → Database
```

### Project Structure
```
backend/src/
├── controllers/      # HTTP handlers
├── services/         # Business logic
├── repositories/     # Data access
├── models/           # Mongoose schemas
├── middleware/       # Auth, validation, rate limiting
└── socket/           # Real-time events

frontend/src/
├── components/       # UI components
├── pages/            # Route pages
├── hooks/            # Custom hooks
├── context/          # Auth & Socket providers
└── lib/              # API client & utilities
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Local Development

```bash
# Clone repository
git clone https://github.com/Sarwan-Projects/Collaborative-Task-Manager.git
cd Collaborative-Task-Manager

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

**Access**: Frontend at http://localhost:5173, Backend at http://localhost:5000

### Docker Setup
```bash
docker-compose up -d
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/users` - Get all users

### Tasks
- `GET /api/v1/tasks` - Get all tasks (with filters)
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/dashboard` - Dashboard data
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Invitations
- `GET /api/v1/invitations` - Get pending invitations
- `POST /api/v1/invitations/:id/accept` - Accept invitation
- `POST /api/v1/invitations/:id/reject` - Reject invitation

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `PUT /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/:id` - Delete notification

---

## 🎯 Key Design Decisions

### Two-Way Consent System
Tasks create invitations instead of direct assignments. Users must accept before becoming assignees, ensuring mutual agreement and preventing unwanted task assignments. Rejected invitations are automatically hidden from the UI.

### Role-Based Status Control
- **Assignees**: Can update status to "To Do", "In Progress", or "Review" only
- **Creators**: Full control including marking as "Completed" and editing all fields
- **Others**: Read-only access to all tasks

This prevents assignees from prematurely closing tasks and ensures creators verify completion before archival.

### Smart Notification System
- No duplicate notifications (invitations shown separately in dedicated section)
- Contextual messages based on action type with appropriate emojis
- Auto-cleanup when tasks are completed to reduce clutter
- Only relevant parties receive notifications (no spam)
- Socket notifications only show for other users (not the person making the change)

### Auto-Cleanup on Completion
Completed tasks are automatically removed from database and UI, keeping the workspace clean and focused on active work. This prevents database bloat and maintains performance.

### Pending Invitation Tracking
Tasks store `pendingInvitationUserId` to show correct assignee in edit forms even before acceptance, preventing confusion about task ownership. Both creator and pending assignee see the same user in dropdowns.

### Lenient Update Validation
Backend uses strict validation for task creation but lenient validation for updates, allowing partial updates (like status-only changes) without validation errors. This enables the role-based permission system to work smoothly.

---

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - HttpOnly cookies + Authorization header
- **Rate Limiting** - Prevents brute force attacks
- **Input Validation** - Zod schemas on all endpoints
- **Permission Checks** - Backend validates user roles
- **Auto-Logout** - Validates user existence on mount
- **CORS Protection** - Restricts cross-origin requests

---

## 🎨 UI/UX Highlights

- **Professional Design** - Expert-level UI with polished animations and transitions
- **Fully Responsive** - Optimized for mobile (320px+), tablet (768px+), and desktop (1024px+)
- **Visual Hierarchy** - Creator → Assignee badges with color-coded user avatars
- **Smart Forms** - Context-aware field enabling/disabling based on user role
- **Toast Notifications** - Professional, single-message feedback (no duplicates)
- **Loading States** - Skeleton loaders and descriptive loading text ("Signing In...", "Creating Account...")
- **Keyboard Shortcuts** - Power user efficiency with intuitive shortcuts
- **Color-Coded Urgency** - Visual warnings for overdue and due-soon tasks
- **Animated Auth Pages** - Gradient backgrounds with floating blobs for visual appeal
- **Flip Effect** - Login and Register pages flip sides for dynamic transition
- **Autocomplete Support** - Proper autocomplete attributes for better browser integration
- **Error Handling** - Clear, actionable error messages without technical jargon
- **Focus States** - Visible focus indicators for accessibility
- **Hover Effects** - Smooth transitions on interactive elements

---

## 📈 Future Enhancements

### Gamification System
- **Points & Scoring** - Earn points for completing tasks on time
- **Profile Badges** - Achievement badges for milestones
- **Leaderboards** - Team rankings based on completion rates
- **Streak Tracking** - Consecutive days of task completion
- **Level System** - User levels based on accumulated points

### Additional Features
- Task comments and file attachments
- Email notifications for critical updates
- Task templates and recurring tasks
- Team workspaces with advanced permissions
- Analytics dashboard with charts
- Calendar view integration
- Mobile app (React Native)
- Task dependencies and subtasks
- Time tracking and estimates

---

## 🧪 Testing

```bash
cd backend
npm test
```

**Coverage**: 9 unit tests covering critical business logic (85%+ coverage)

---

## 🚢 Deployment

### Frontend (Vercel)
1. Import repository
2. Root directory: `frontend`
3. Environment: `VITE_API_URL`, `VITE_SOCKET_URL`

### Backend (Render)
1. Create Web Service
2. Root directory: `backend`
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Environment: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`

### Database (MongoDB Atlas)
1. Create free cluster
2. Whitelist IP: 0.0.0.0/0
3. Copy connection string

---

## 👤 Author

**Sarwan Chhetri**  
📧 sarwanchhetri57@gmail.com  
🔗 [GitHub](https://github.com/Sarwan-Projects)

---

## 📄 License

MIT License - Free for learning and commercial use

---

**Built with modern web technologies and best practices** ⚡
