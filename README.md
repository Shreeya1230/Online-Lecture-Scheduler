# Online Lecture Scheduler

A full-stack web application for managing instructors, courses, and lectures. The application provides separate login portals for administrators and instructors.

## Features

### Admin
- Admin login
- Add instructors
- Add courses
- Upload course images

### Instructor
- Instructor login
- Change password

### Course Management
- Create courses

### Lecture Management
- Create lectures

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

## Project Structure

```
Online-Lecture-Scheduler
│
├── frontend
│
└── backend
```

## Installation

### Clone the repository

```bash
git clone https://github.com/Shreeya1230/Online-Lecture-Scheduler.git
cd Online-Lecture-Scheduler
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

Start the backend:

```bash
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```
http://localhost:3000
```

The backend runs on:

```
http://localhost:5000
```

## API Endpoints

### Authentication

- POST `/api/auth/login`
- PUT `/api/auth/change-password/:id`

### Instructors

- GET `/api/instructors`
- POST `/api/instructors`

### Courses

- GET `/api/courses`
- POST `/api/courses`


### Lectures

- GET `/api/lectures`
- POST `/api/lectures`

## Author

**Shreeya Ghegad**

GitHub: https://github.com/Shreeya1230
