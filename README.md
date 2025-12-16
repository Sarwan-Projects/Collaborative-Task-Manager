# TaskFlow - Real-Time Collaborative Task Manager

A modern, full-stack task management application with real-time collaboration features. Built to explore WebSocket patterns, clean architecture, and modern web development best practices.

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-20-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101)

## 🚀 Live Demo

- **Frontend**: [https://collaborative-task-manager-indol.vercel.app](https://collaborative-task-manager-indol.vercel.app)
- **Backend API**: [https://taskflow-api-441h.onrender.com](https://taskflow-api-441h.onrender.com)

---

## 📋 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Design Decisions](#design-decisions)
5. [Setup Instructions](#setup-instructions)
6. [API Documentation](#api-documentation)
7. [Real-Time Implementation](#real-time-implementation)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Trade-offs & Assumptions](#trade-offs--assumptions)

---

## ✨ Features

### Core Features
- **Secure Authentication** - User registration/login with bcrypt password hashing and JWT tokens stored in HttpOnly cookies
- **Task Management** - Full CRUD with title (max 100 chars), description, due date, priority (Low/Medium/High/Urgent), status (To Do/In Progress/Review/Completed), creator, and assignee
- **Real-Time Collaboration** - Live updates via Socket.io when any user modifies tasks
- **Instant Notifications** - In-app notifications when tasks are assigned to you
- **Personal Dashboard** - View tasks assigned to you, created by you, and overdue tasks
- **Filtering & Sorting** - Filter by status/priority, sort by due date/created date

### Bonus Features
- ✅ **Optimistic UI Updates** - Tasks update instantly before server confirmation using React Query
- ✅ **Audit Logging** - Track who changed what and when for every task modification
- ✅ **Docker Support** - Full docker-compose setup for local development

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite | UI Framework & Build Tool |
| | TypeScript | Type Safety |
| | Tailwind CSS | Styling |
| | TanStack React Query | Server State & Caching |
| | React Hook Form + Zod | Form Management & Validation |
| | Socket.io Client | Real-Time Communication |
| **Backend** | Node.js + Express | Server Framework |
| | TypeScript | Type Safety |
| | MongoDB | Database |
| | Mongoose | ODM |
| | Socket.io | WebSocket Server |
| | JWT + bcrypt | Authentication |
| | Zod | DTO Validation |
| | Jest | Testing |

---

## 🏗 Architecture Overview

### Backend Structure

```
backend/
├── src/
│   ├── config/           # Configuration & database connection
│   │   ├── index.ts      # Environment variables
│   │   └── database.ts   # MongoDB connection
│   │
│   ├── controllers/      # HTTP request handlers (thin layer)
│   │   ├── auth.controller.ts
│   │   ├── task.controller.ts
│   │   └── notification.controller.ts
│   │
│   ├── dtos/             # Data Transfer Objects (Zod schemas)
│   │   ├── auth.dto.ts   # RegisterDto, LoginDto, UpdateProfileDto
│   │   └── task.dto.ts   # CreateTaskDto, UpdateTaskDto, TaskFilterDto
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── validate.middleware.ts  # Zod validation
│   │   └── error.middleware.ts     # Global error handler
│   │
│   ├── models/           # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Task.ts
│   │   ├── Notification.ts
│   │   └── AuditLog.ts
│   │
│   ├── repositories/     # Data access layer
│   │   ├── user.repository.ts
│   │   ├── task.repository.ts
│   │   ├── notification.repository.ts
│   │   └── auditLog.repository.ts
│   │
│   ├── services/         # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── task.service.ts
│   │   └── notification.service.ts
│   │
│   ├── routes/           # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── task.routes.ts
│   │   └── notification.routes.ts
│   │
│   ├── socket/           # Socket.io setup
│   │   └── index.ts
│   │
│   └── types/            # TypeScript interfaces
│       └── index.ts
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── layout/       # Navbar, Layout
│   │   └── tasks/        # Task-specific components
│   │
│   ├── context/          # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── SocketContext.tsx
│   │
│   ├── hooks/            # Custom React hooks
│   │   ├── useTasks.ts   # Task CRUD with React Query
│   │   ├── useUsers.ts
│   │   └── useNotifications.ts
│   │
│   ├── lib/              # Utilities
│   │   ├── api.ts        # Axios instance
│   │   └── validations.ts # Zod schemas
│   │
│   ├── pages/            # Route components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Tasks.tsx
│   │   └── Profile.tsx
│   │
│   └── types/            # TypeScript types
│       └── index.ts
```

### Request Flow

```
Client Request
     ↓
Route (defines endpoint)
     ↓
Middleware (auth, validation)
     ↓
Controller (handles HTTP, calls service)
     ↓
Service (business logic, calls repository)
     ↓
Repository (database operations)
     ↓
MongoDB
```

---

## 🎯 Design Decisions

### Why MongoDB?

I chose MongoDB over PostgreSQL for several reasons:

1. **Flexible Schema** - Task attributes can evolve without migrations
2. **Document Model** - Tasks naturally fit as documents with nested user references
3. **Mongoose ODM** - Excellent TypeScript support and built-in validation
4. **Scalability** - Horizontal scaling for growing task data
5. **Atlas Integration** - Easy cloud deployment with MongoDB Atlas

### JWT Implementation

```typescript
// Token generation (auth.service.ts)
private generateToken(user: IUserDocument): string {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

// Token storage - HttpOnly cookie for security
res.cookie('token', token, {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

- Tokens are stored in HttpOnly cookies (prevents XSS attacks)
- Also sent in response for clients that need Authorization header
- 7-day expiration with automatic refresh on login

### Service Layer Pattern

The service layer contains all business logic, keeping controllers thin:

```typescript
// task.service.ts - Example of business logic
async createTask(data: CreateTaskInput, creatorId: string): Promise<ITaskDocument> {
  // 1. Validate assignee exists
  if (data.assignedToId) {
    const assignee = await userRepository.findById(data.assignedToId);
    if (!assignee) throw new ApiError('Assigned user not found', 404);
  }

  // 2. Create task via repository
  const task = await taskRepository.create({ ...data, creatorId });
  
  // 3. Create notification if assigned to someone else
  if (data.assignedToId && data.assignedToId !== creatorId) {
    await notificationRepository.create({
      userId: data.assignedToId,
      message: `You have been assigned a new task: "${task.title}"`,
      taskId: task._id.toString()
    });
  }

  // 4. Log the action for audit trail
  await auditLogRepository.create({
    taskId: task._id.toString(),
    userId: creatorId,
    action: 'CREATED',
    newValue: task.title
  });

  return task;
}
```

### DTO Validation with Zod

All API inputs are validated using Zod schemas:

```typescript
// task.dto.ts
export const CreateTaskDto = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val))),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  status: z.nativeEnum(Status).default(Status.TODO),
  assignedToId: z.string().optional().nullable()
});

// Used in middleware
router.post('/', validate(CreateTaskDto), taskController.createTask);
```

---

## 🔌 Real-Time Implementation

### Socket.io Architecture

```typescript
// backend/src/socket/index.ts
export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: config.frontendUrl,
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Join user-specific room for targeted notifications
    socket.join(`user:${socket.data.userId}`);
  });

  return io;
};
```

### Event Flow

1. **Task Created/Updated/Deleted** → Broadcast to all connected clients
2. **Task Assigned** → Send notification to specific user's room

```typescript
// In task.controller.ts
async updateTask(req, res) {
  const { task, changes } = await taskService.updateTask(id, data, userId);

  // Broadcast to all clients
  getIO().emit('task:updated', { task, changes });

  // Targeted notification to assignee
  if (changes.includes('assignee') && task.assignedToId) {
    getIO().to(`user:${task.assignedToId}`).emit('notification:new', {
      message: `You have been assigned to task: "${task.title}"`,
      taskId: task._id
    });
  }
}
```

### Frontend Integration

```typescript
// frontend/src/context/SocketContext.tsx
useEffect(() => {
  const socket = io(SOCKET_URL, { auth: { token } });

  socket.on('task:updated', ({ task, changes }) => {
    // Invalidate React Query cache to refetch
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    toast.success(`Task "${task.title}" has been updated`);
  });

  socket.on('notification:new', (notification) => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    toast(notification.message, { icon: '🔔' });
  });
}, [token]);
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas account)
- npm or yarn

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/Sarwan-Projects/Collaborative-Task-Manager.git
cd Collaborative-Task-Manager
```

**2. Backend Setup**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values:
# MONGODB_URI=mongodb://localhost:27017/taskmanager
# JWT_SECRET=your-secret-key
# FRONTEND_URL=http://localhost:5173

npm run dev
```

**3. Frontend Setup** (new terminal)
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Edit .env:
# VITE_API_URL=http://localhost:5000/api/v1
# VITE_SOCKET_URL=http://localhost:5000

npm run dev
```

**4. Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Docker Setup

```bash
# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📚 API Documentation

### Base URL
```
Production: https://taskflow-api-441h.onrender.com/api/v1
Local: http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register new user | No |
| `POST` | `/auth/login` | Login user | No |
| `POST` | `/auth/logout` | Logout user | Yes |
| `GET` | `/auth/me` | Get current user profile | Yes |
| `PUT` | `/auth/profile` | Update user profile | Yes |
| `GET` | `/auth/users` | Get all users (for assignment) | Yes |

### Task Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/tasks` | Get all tasks (with filters) | Yes |
| `POST` | `/tasks` | Create new task | Yes |
| `GET` | `/tasks/dashboard` | Get dashboard data | Yes |
| `GET` | `/tasks/:id` | Get single task | Yes |
| `PUT` | `/tasks/:id` | Update task | Yes |
| `DELETE` | `/tasks/:id` | Delete task (creator only) | Yes |
| `GET` | `/tasks/:id/audit` | Get task audit logs | Yes |

### Notification Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/notifications` | Get user notifications | Yes |
| `PUT` | `/notifications/:id/read` | Mark as read | Yes |
| `PUT` | `/notifications/read-all` | Mark all as read | Yes |

### Query Parameters for GET /tasks

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (To Do, In Progress, Review, Completed) |
| `priority` | string | Filter by priority (Low, Medium, High, Urgent) |
| `sortBy` | string | Sort field (dueDate, createdAt, priority) |
| `sortOrder` | string | Sort direction (asc, desc) |
| `assignedToMe` | boolean | Filter tasks assigned to current user |
| `createdByMe` | boolean | Filter tasks created by current user |
| `overdue` | boolean | Filter overdue tasks |

### Example Requests

**Register User**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Create Task**
```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive README",
    "dueDate": "2024-12-31",
    "priority": "High",
    "status": "To Do",
    "assignedToId": "user_id_here"
  }'
```

**Response**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Complete project documentation",
    "description": "Write comprehensive README",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "priority": "High",
    "status": "To Do",
    "creatorId": { "_id": "...", "name": "John", "email": "john@example.com" },
    "assignedToId": { "_id": "...", "name": "Jane", "email": "jane@example.com" },
    "createdAt": "2024-12-13T...",
    "updatedAt": "2024-12-13T..."
  },
  "message": "Task created successfully"
}
```

### Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Validation error (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not allowed to perform action) |
| 404 | Resource not found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal server error |

---

## 🧪 Testing

```bash
cd backend
npm test
```

### Test Coverage

The test suite covers critical business logic in `task.service.ts`:

1. **Task Creation**
   - ✅ Creates task successfully
   - ✅ Throws error if assigned user doesn't exist
   - ✅ Creates notification when assigned to another user
   - ✅ Doesn't create notification when self-assigning

2. **Task Update**
   - ✅ Updates task and logs status change
   - ✅ Throws error if task not found
   - ✅ Notifies new assignee when assignment changes

3. **Task Deletion**
   - ✅ Allows creator to delete task
   - ✅ Throws error when non-creator tries to delete

---

## 🚢 Deployment

### Frontend (Vercel)

1. Import repository to Vercel
2. Set root directory to `frontend`
3. Add environment variables:
   - `VITE_API_URL` = Your backend URL + `/api/v1`
   - `VITE_SOCKET_URL` = Your backend URL
4. Deploy

### Backend (Render)

1. Create new Web Service
2. Connect GitHub repository
3. Set root directory to `backend`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = A secure random string
   - `FRONTEND_URL` = Your Vercel frontend URL
   - `NODE_ENV` = production

### Database (MongoDB Atlas)

1. Create free cluster at mongodb.com
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for Render)
4. Get connection string

---

## ⚖️ Trade-offs & Assumptions

### Trade-offs Made

1. **JWT Storage**
   - Used both HttpOnly cookies AND localStorage token
   - Cookies for security, localStorage as fallback for easier development
   - Trade-off: Slightly more complex auth flow

2. **Real-time vs Polling**
   - Chose Socket.io for true real-time updates
   - Trade-off: More complexity, but better UX

3. **MongoDB vs PostgreSQL**
   - Chose MongoDB for schema flexibility
   - Trade-off: No relational integrity, but faster iteration

4. **Optimistic Updates**
   - Implemented for create/update/delete operations
   - Trade-off: More complex error handling, but snappier UI

5. **No Pagination**
   - Task lists load all items
   - Trade-off: Simpler implementation, but won't scale to thousands of tasks

### Assumptions

1. **User Base** - Small to medium teams (< 100 users)
2. **Task Volume** - Hundreds of tasks per user, not thousands
3. **Browser Support** - Modern browsers with WebSocket support
4. **Single Tenant** - No organization/team separation needed
5. **Email Uniqueness** - Email is the unique identifier for users

### Future Improvements

- [ ] Add pagination for large task lists
- [ ] Implement task comments and attachments
- [ ] Add email notifications
- [ ] Create task templates
- [ ] Add recurring tasks
- [ ] Implement team workspaces
- [ ] Add task dependencies

---

---

## ❓ Q&A - Design Decisions Explained

### Q: Why did you choose MongoDB over PostgreSQL?

**A:** I chose MongoDB for this project for several practical reasons:

1. **Schema Flexibility** - Tasks can have varying attributes, and MongoDB's document model allows me to add new fields without migrations. For example, if I want to add tags or attachments later, I just update the schema.

2. **Natural Data Structure** - A task is naturally a document with nested data (creator info, assignee info). MongoDB handles this elegantly with population/references, while SQL would require multiple JOINs.

3. **Developer Experience** - Mongoose provides excellent TypeScript support with built-in validation. I can define my schema once and get type safety throughout the application.

4. **Scalability Path** - While this app is small now, MongoDB's horizontal scaling would handle growth better if this became a larger product.

5. **Cloud Deployment** - MongoDB Atlas offers a generous free tier and seamless deployment, which is perfect for a project like this.

**Trade-off acknowledged:** I lose relational integrity guarantees that PostgreSQL provides. For a task manager where data relationships are simple, this trade-off is acceptable.

---

### Q: How did you handle JWT authentication?

**A:** I implemented a dual-storage approach for maximum compatibility and security:

```typescript
// 1. Generate token with user payload
const token = jwt.sign(
  { id: user._id, email: user.email },
  config.jwtSecret,
  { expiresIn: '7d' }
);

// 2. Store in HttpOnly cookie (secure, prevents XSS)
res.cookie('token', token, {
  httpOnly: true,           // JavaScript can't access it
  secure: isProduction,     // HTTPS only in production
  sameSite: 'lax',          // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});

// 3. Also return in response body (for clients that need Authorization header)
res.json({ success: true, data: { user, token } });
```

**Why this approach?**

- **HttpOnly cookies** prevent XSS attacks - malicious scripts can't steal the token
- **Returning token in body** allows flexibility for different client implementations
- **7-day expiration** balances security with user convenience
- **Middleware checks both** - cookie first, then Authorization header as fallback

**Verification flow:**
```typescript
// auth.middleware.ts
let token = req.cookies?.token;
if (!token) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
}
const decoded = jwt.verify(token, config.jwtSecret);
req.user = { id: decoded.id, email: decoded.email };
```

---

### Q: How did you implement the service layer pattern?

**A:** I followed a clean 3-layer architecture to separate concerns:

```
Controller (HTTP) → Service (Business Logic) → Repository (Data Access)
```

**Why this pattern?**

1. **Controllers are thin** - They only handle HTTP concerns (request/response)
2. **Services contain logic** - All business rules live here
3. **Repositories abstract data** - Easy to swap databases if needed

**Example - Creating a Task:**

```typescript
// Controller - handles HTTP only
async createTask(req, res) {
  const task = await taskService.createTask(req.body, req.user.id);
  getIO().emit('task:created', task);  // Real-time broadcast
  res.status(201).json({ success: true, data: task });
}

// Service - contains business logic
async createTask(data, creatorId) {
  // Validation logic
  if (data.assignedToId) {
    const assignee = await userRepository.findById(data.assignedToId);
    if (!assignee) throw new ApiError('User not found', 404);
  }
  
  // Create via repository
  const task = await taskRepository.create({ ...data, creatorId });
  
  // Side effects (notifications, audit logs)
  if (data.assignedToId !== creatorId) {
    await notificationRepository.create({
      userId: data.assignedToId,
      message: `Assigned: ${task.title}`
    });
  }
  
  await auditLogRepository.create({
    taskId: task._id,
    action: 'CREATED'
  });
  
  return task;
}

// Repository - pure data access
async create(data) {
  const task = new Task(data);
  return task.save();
}
```

**Benefits I gained:**

- **Testability** - I can mock repositories and test service logic in isolation (see my 9 unit tests)
- **Maintainability** - Business rules are in one place, easy to find and modify
- **Reusability** - Services can be called from controllers, background jobs, or other services
- **Clarity** - Each layer has a single responsibility

---

### Q: How does the real-time Socket.io integration work?

**A:** Socket.io is integrated at three levels:

**1. Server Setup (backend/src/socket/index.ts)**
```typescript
io.use((socket, next) => {
  // Authenticate socket connections with JWT
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, config.jwtSecret);
  socket.data.userId = decoded.id;
  next();
});

io.on('connection', (socket) => {
  // Each user joins their own room for targeted notifications
  socket.join(`user:${socket.data.userId}`);
});
```

**2. Emitting Events (in controllers after DB operations)**
```typescript
// Broadcast to everyone
getIO().emit('task:updated', { task, changes });

// Send to specific user only
getIO().to(`user:${assigneeId}`).emit('notification:new', { message });
```

**3. Client Listening (frontend/src/context/SocketContext.tsx)**
```typescript
socket.on('task:updated', () => {
  // Invalidate React Query cache → triggers refetch
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
});

socket.on('notification:new', (notif) => {
  toast(notif.message, { icon: '🔔' });
});
```

**The flow:**
1. User A updates a task
2. Controller saves to DB, then emits `task:updated`
3. All connected clients receive the event
4. React Query cache invalidates → UI refreshes automatically
5. If assignee changed, targeted notification goes to that user's room only

---

## 👤 Author

**Sarwan Chhetri**

- Email: sarwanchhetri57@gmail.com
- GitHub: [@Sarwan-Projects](https://github.com/Sarwan-Projects)

---

## 📄 License

MIT License - feel free to use this project for learning or as a starting point.

---

Built with ☕ and curiosity by Sarwan Chhetri
