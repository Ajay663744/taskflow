# 🚀 TaskFlow — Smart Task Management

A full-stack, production-ready task management web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Features a stunning dark-themed UI with glassmorphism design, smooth animations, and complete CRUD functionality.

---

## ✨ Features

### 🔐 Authentication
- User registration with validation
- Login with JWT-based authentication
- Protected routes with automatic token verification
- Persistent sessions with localStorage

### 📋 Task Management
- **Create** tasks with title and optional description
- **Edit** existing tasks inline via modal
- **Delete** tasks with confirmation dialog
- **Toggle** task status between Pending and Completed
- Real-time stats dashboard with progress tracking

### 🔍 Search & Filter
- Search tasks by title with debounced input
- Filter by status: All / Pending / Completed
- Server-side pagination (5 tasks per page)

### 🎨 Premium UI/UX
- Dark theme with deep navy palette and vivid accents
- Glassmorphism cards with frosted blur effects
- Smooth CSS animations on all interactions
- Gradient backgrounds with layered depth
- Google Fonts (Inter + Space Grotesk)
- Fully responsive — mobile, tablet, and desktop
- Premium task cards with hover effects, status badges, and shadows
- Visual progress bar showing completed vs pending
- Loading spinners and error states on all API calls

---

## 🛠 Tech Stack

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| Frontend   | React 18, Vite, React Router v6, Axios         |
| Backend    | Node.js, Express.js, express-validator          |
| Database   | MongoDB with Mongoose ODM                       |
| Auth       | JWT (jsonwebtoken), bcryptjs                    |
| Styling    | Vanilla CSS with custom properties              |
| Fonts      | Google Fonts (Inter, Space Grotesk)             |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── models/
│   │   ├── User.js              # User schema with password hashing
│   │   └── Task.js              # Task schema with indexes
│   ├── routes/
│   │   ├── auth.js              # Register, Login, Profile endpoints
│   │   └── tasks.js             # Full CRUD + search/filter/pagination
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification middleware
│   ├── server.js                # Express app entry point
│   ├── .env.example             # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page with validation
│   │   │   ├── Register.jsx     # Registration page with validation
│   │   │   └── Dashboard.jsx    # Main dashboard with all features
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Navigation bar with user info
│   │   │   ├── TaskCard.jsx     # Individual task display card
│   │   │   └── TaskModal.jsx    # Create/Edit task modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global authentication state
│   │   ├── utils/
│   │   │   └── api.js           # Axios instance with interceptors
│   │   ├── App.jsx              # Root component with routing
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Complete design system
│   ├── index.html               # HTML template with Google Fonts
│   ├── vite.config.js           # Vite configuration with API proxy
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **MongoDB** (local installation or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd taskflow
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your values (see Environment Variables section below)

# Start the backend server
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

| Variable      | Description                              | Default                              |
|---------------|------------------------------------------|--------------------------------------|
| `MONGO_URI`   | MongoDB connection string                | `mongodb://localhost:27017/taskflow`  |
| `JWT_SECRET`  | Secret key for JWT token signing         | *(required — use a strong random string)* |
| `PORT`        | Port for the Express server              | `5000`                               |
| `CLIENT_URL`  | Frontend URL for CORS configuration      | `http://localhost:5173`              |

### Generating a JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Using MongoDB Atlas (Cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist your IP address (or use `0.0.0.0/0` for development)
4. Get the connection string and replace `MONGO_URI` in `.env`

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint          | Description          | Auth Required |
|--------|-------------------|----------------------|---------------|
| POST   | `/api/auth/register` | Register new user | No            |
| POST   | `/api/auth/login`    | Login user         | No            |
| GET    | `/api/auth/me`       | Get user profile   | Yes           |

### Tasks

| Method | Endpoint                | Description          | Auth Required |
|--------|-------------------------|----------------------|---------------|
| GET    | `/api/tasks`            | Get all tasks (with search, filter, pagination) | Yes |
| POST   | `/api/tasks`            | Create a new task    | Yes           |
| PUT    | `/api/tasks/:id`        | Update a task        | Yes           |
| PATCH  | `/api/tasks/:id/toggle` | Toggle task status   | Yes           |
| DELETE | `/api/tasks/:id`        | Delete a task        | Yes           |

### Query Parameters for GET `/api/tasks`

| Param    | Type   | Default | Description                        |
|----------|--------|---------|------------------------------------|
| `page`   | number | 1       | Page number for pagination         |
| `limit`  | number | 5       | Tasks per page (max 50)            |
| `status` | string | "all"   | Filter: "all", "pending", or "completed" |
| `search` | string | ""      | Search tasks by title              |

---

## 📸 Screenshots

> Screenshots section — add your screenshots here after running the application.

### Login Page
*Premium SaaS-style login with glassmorphism card and gradient background*

### Register Page
*Clean registration form with real-time validation*

### Dashboard
*Full dashboard with stats strip, progress bar, search, filters, and task list*

### Task Modal
*Slide-in modal for creating and editing tasks*

### Mobile View
*Fully responsive layout optimized for mobile devices*

---

## 🧪 Testing the Application

1. **Register** a new account at `/register`
2. **Login** with your credentials at `/login`
3. **Create** some tasks using the "Add Task" button
4. **Edit** a task by clicking the pencil icon
5. **Toggle** completion by clicking the checkbox
6. **Search** for tasks using the search bar
7. **Filter** tasks by status (All / Pending / Completed)
8. **Delete** tasks using the X icon
9. **Paginate** through tasks with the navigation buttons

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using the MERN Stack
