# Project Tasklist 📋

A modern project and task management application built with Next.js 15, TypeScript, MongoDB, and TailwindCSS.

## ✨ Features

- ✅ **CRUD Projects** - Create, read, update, and delete projects
- ✅ **CRUD Tasks** - Full task management with status tracking
- ✅ **Auto Progress Calculation** - Automatic progress calculation based on task weights
- ✅ **Auto Status Updates** - Projects automatically update status based on task completion
- ✅ **Single Page Application** - Smooth, fast user experience
- ✅ **Real-time Data Manipulation** - Instant updates when managing projects and tasks
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Styling**: TailwindCSS 4
- **UI**: Custom components with modern design

## 📊 Data Models

### Project
- `name` - Project name
- `status` - Project status (draft, in_progress, done)
- `description_progress` - Progress percentage (0-100)
- Auto-calculated based on task completion

### Task
- `name` - Task name
- `status` - Task status (draft, in_progress, done)
- `weight` - Task weight for progress calculation
- `project_id` - Reference to parent project

## 🔧 Installation

1. Clone the repository
```bash
git clone <repository-url>
cd tasklist
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── projects/        # Project CRUD API routes
│   │   └── tasks/           # Task CRUD API routes
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main SPA page
├── components/
│   ├── ProjectCard.tsx      # Project display card
│   ├── ProjectModal.tsx     # Project create/edit modal
│   ├── TaskList.tsx         # Task list display
│   └── TaskModal.tsx        # Task create/edit modal
├── models/
│   ├── Project.ts           # Project Mongoose model
│   └── Task.ts              # Task Mongoose model
├── types/
│   └── index.ts             # TypeScript type definitions
└── lib/
    └── mongodb.ts           # MongoDB connection utility
```

## 🎯 How It Works

### Progress Calculation Logic
The progress is calculated based on the weight of completed tasks:

```typescript
totalWeight = sum of all task weights
completedWeight = sum of weights where status = 'done'
progress = (completedWeight / totalWeight) * 100
// Result is rounded down to 1 decimal place
```

### Status Update Logic
Project status is automatically updated based on tasks:

- **Draft**: No tasks or all tasks are draft
- **In Progress**: At least one task has status 'in_progress'
- **Done**: All tasks have status 'done'

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get single project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (cascades to tasks)

### Tasks
- `GET /api/tasks?project_id=:id` - Get tasks by project
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 📝 License

MIT License

## 👨‍💻 Author

Built with ❤️ using Next.js and MongoDB
