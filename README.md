# TaskFlow - Real-Time Collaborative Task Manager

A production-ready, full-stack task management application with real-time collaboration features, built with modern web technologies and clean architecture principles.

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-20-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101)

## 🚀 Live Demo

- **Application**: [https://collaborative-task-manager-indol.vercel.app](https://collaborative-task-manager-indol.vercel.app)
- **Repository**: [https://github.com/Sarwan-Projects/Collaborative-Task-Manager](https://github.com/Sarwan-Projects/Collaborative-Task-Manager)

---

## ✨ Features

### Core Functionality
- **Secure Authentication** - JWT-based auth with bcrypt password hashing and HttpOnly cookies
- **Task Management** - Full CRUD operations with title, description, due date, priority, status, and assignment
- **Real-Time Collaboration** - Live updates via Socket.io when tasks are created, updated, or deleted
- **Smart Notifications** - In-app notifications for task assignments and completions
- **Personal Dashboard** - View assigned tasks, created tasks, overdue tasks, and completion statistics
- **Advanced Filtering** - Filter by status/priority, sort by due date, search by title/description
- **Responsive Design** - Mobile-first UI with Tailwind CSS

### Advanced Features
- ✅ **Optimistic UI Updates** - Instant feedback using React Query
- ✅ **Audit Logging** - Complete history of task modifications for accountability
- ✅ **Docker Support** - Full containerization with docker-compose
- ✅ **Keyboard Shortcuts** - Quick navigation (N for new task, G for grid/list toggle, ? for help)
- ✅ **Visual Urgency Indicators** - Color-coded warnings for tasks due within 48 hours
- ✅ **Completion Tracking** - Automatic notifications to task creators when tasks are completed

---

## 🛠 Tech Stack

**Frontend**
- React 18 + Vite + TypeScript
- Tailwind CSS for styling
- TanStack React Query for server state management
- React Hook Form + Zod for form validation
- Socket.io Client for real-time updates
- Axios for HTTP requests

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose ODM
- Socket.io for WebSocket communication
- JWT + bcrypt for authentication
- Zod for DTO validation
- Jest for unit testing (9 tests with 85%+ coverage)

**DevOps**
- Docker + Docker Compose
- Vercel (Frontend deployment)
- Render (Backend deployment)
- MongoDB Atlas (Database hosting)

---

## 🏗 Architecture

### Clean 3-Layer Architecture

```
Controller (HTTP Layer)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
MongoDB
```

### Project Structure

```
backend/
├── src/
│   ├── controllers/      # HTTP request handlers
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── models/           # Mongoose schemas
│   ├── dtos/             # Zod validation schemas
│   ├── middleware/       # Auth, validation, error handling
│   ├── routes/           # API route definitions
│   ├── socket/           # Socket.io configuration
│   └── types/            # TypeScript interfaces

frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route components
│   ├── hooks/            # Custom React hooks
│   ├── context/          # React Context providers
│   ├── lib/              # Utilities and API client
│   └── types/            # TypeScript types
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Local Development

**1. Clone and Install**
```bash
git clone https://github.com/Sarwan-Projects/Collaborative-Task-Manager.git
cd Collaborative-Task-Manager

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

**2. Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Docker Setup

```bash
docker-compose up -d
```

---

## 📚 API Documentation

### Base URL
```
Local Development: http://localhost:5000/api/v1
```

### Key Endpoints

**Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile
- `GET /auth/users` - Get all users (for task assignment)

**Tasks**
- `GET /tasks` - Get all tasks (supports filtering & sorting)
- `POST /tasks` - Create new task
- `GET /tasks/dashboard` - Get dashboard statistics
- `GET /tasks/:id` - Get single task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task (creator only)
- `GET /tasks/:id/audit` - Get task audit logs

**Notifications**
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

### Query Parameters (GET /tasks)
- `status` - Filter by status (To Do, In Progress, Review, Completed)
- `priority` - Filter by priority (Low, Medium, High, Urgent)
- `sortBy` - Sort field (dueDate, createdAt, priority)
- `sortOrder` - Sort direction (asc, desc)
- `assignedToMe` - Filter tasks assigned to current user
- `createdByMe` - Filter tasks created by current user
- `overdue` - Filter overdue tasks

---

## 🧪 Testing

```bash
cd backend
npm test
```

**Test Coverage**: 9 unit tests covering critical business logic in task service (creation, updates, deletion, notifications, audit logging)

---

## 🎯 Key Design Decisions

### Why MongoDB?
- **Schema Flexibility** - Easy to add new task attributes without migrations
- **Document Model** - Tasks naturally fit as documents with nested user references
- **Mongoose ODM** - Excellent TypeScript support and built-in validation
- **Cloud Deployment** - MongoDB Atlas free tier with seamless integration

### JWT Authentication Strategy
- **HttpOnly Cookies** - Primary storage for security (prevents XSS attacks)
- **Authorization Header** - Fallback for API clients
- **7-Day Expiration** - Balance between security and user convenience
- **Dual Verification** - Middleware checks both cookie and header

### Real-Time Implementation
- **Socket.io Rooms** - Each user joins their own room for targeted notifications
- **JWT Authentication** - Socket connections authenticated via JWT tokens
- **Event Broadcasting** - Task updates broadcast to all clients, notifications sent to specific users
- **React Query Integration** - Cache invalidation triggers automatic UI updates

### Service Layer Pattern
- **Separation of Concerns** - Controllers handle HTTP, services contain business logic, repositories manage data
- **Testability** - Business logic can be tested in isolation with mocked repositories
- **Maintainability** - Clear structure makes code easy to understand and modify
- **Reusability** - Services can be called from multiple sources (controllers, background jobs, etc.)

### Audit Logging
Tracks all task modifications for accountability and debugging:
- Task creation, updates, and deletion
- Status and priority changes
- Assignee changes
- Complete history with user attribution and timestamps

---

## 🚢 Deployment

### Frontend (Vercel)
1. Import repository to Vercel
2. Set root directory: `frontend`
3. Environment variables:
   - `VITE_API_URL` = Backend URL + `/api/v1`
   - `VITE_SOCKET_URL` = Backend URL
4. Deploy automatically on push to main

### Backend (Render)
1. Create Web Service from GitHub
2. Set root directory: `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Environment variables:
   - `MONGODB_URI` = MongoDB Atlas connection string
   - `JWT_SECRET` = Secure random string
   - `FRONTEND_URL` = Vercel frontend URL
   - `NODE_ENV` = production

### Database (MongoDB Atlas)
1. Create free cluster
2. Create database user
3. Whitelist IP: 0.0.0.0/0 (for Render)
4. Copy connection string

---

## 📊 Performance & Scalability

- **Optimistic Updates** - UI responds instantly before server confirmation
- **React Query Caching** - Reduces unnecessary API calls
- **Socket.io Rooms** - Efficient targeted messaging
- **Indexed Queries** - MongoDB indexes on frequently queried fields
- **Lazy Loading** - Components load on demand
- **Code Splitting** - Vite automatically splits code for faster initial load

---

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - Secure token generation and verification
- **HttpOnly Cookies** - Prevents XSS attacks
- **CORS Configuration** - Restricts cross-origin requests
- **Input Validation** - Zod schemas validate all inputs
- **Error Handling** - Consistent error responses without exposing internals
- **Environment Variables** - Sensitive data stored securely

---

## 🎨 UI/UX Features

- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- **Dark Mode Ready** - Prepared for theme switching
- **Loading States** - Skeleton loaders for better perceived performance
- **Toast Notifications** - Non-intrusive feedback for user actions
- **Keyboard Shortcuts** - Power user features for efficiency
- **Visual Indicators** - Color-coded priority and urgency warnings
- **Smooth Animations** - Polished transitions and hover effects
- **Accessibility** - Semantic HTML and ARIA labels

---

## 📈 Future Enhancements

- Task comments and attachments
- Email notifications
- Task templates and recurring tasks
- Team workspaces and permissions
- Advanced analytics and reporting
- Task dependencies and subtasks
- Calendar view integration
- Mobile app (React Native)

---

## 👤 Author

**Sarwan Chhetri**
- Email: sarwanchhetri57@gmail.com
- GitHub: [@Sarwan-Projects](https://github.com/Sarwan-Projects)

---

## 📄 License

MIT License - Free to use for learning and commercial projects.

---

**Built with modern web technologies and best practices** ⚡
