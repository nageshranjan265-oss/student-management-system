# Student Management System

A full-stack web application developed using the MERN stack to manage student information with authentication, role-based access, REST API integration, and MongoDB database connectivity.

## 🚀 Live Demo

| Component | Link |
|---|---|
| Frontend | https://student-management-system-ten-bay.vercel.app/ |
| Backend | https://student-management-system-kmkr.onrender.com/ |
| Backend Health Check | https://student-management-system-kmkr.onrender.com/health |

## 📌 Project Overview

The Student Management System is a web-based application designed to simplify student information management.

It provides a user-friendly interface connected to a backend REST API and MongoDB database. The application includes authentication, protected routes, dashboard functionality, and student record management.

This project was developed as an academic Full Stack Development project using the MERN technology stack.

## ✨ Features

- User registration and login
- JWT-based authentication
- Protected backend routes
- Role-based access control
- Student record management
- Dashboard interface
- Forgot password and password recovery workflow
- Change password functionality
- Password hashing using bcryptjs
- REST API integration
- MongoDB database connectivity
- Email service integration using Nodemailer

*Note: Verify each feature in the running application before presenting it as fully tested.*

## 🛠️ Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Axios
- Vite

### Backend
- Node.js
- Express.js
- JavaScript
- JWT
- bcryptjs
- Nodemailer

### Database
- MongoDB
- Mongoose

### Development and Deployment Tools
- Visual Studio Code
- Git
- GitHub
- MongoDB Atlas
- Render
- Vercel

## 📂 Project Structure

```text
student-management-system/
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── studentController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Student.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── studentRoutes.js
│   │
│   ├── services/
│   │   └── emailService.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Dashboard.jsx
│   │   ├── StudentManagement.jsx
│   │   ├── StudentList.jsx
│   │   ├── ChangePassword.jsx
│   │   ├── api.js
│   │   ├── App.css
│   │   ├── Dashboard.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## ⚙️ Installation and Setup

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/nageshranjan265-oss/student-management-system.git
```

### 2. Open the Project Folder

```bash
cd student-management-system
```

### 3. Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder and configure the required environment variables.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
EMAIL_FROM=your_sender_email
```

Start the backend server:

```bash
npm start
```

The backend will run at:

```text
http://localhost:5000
```

### 4. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Open the local frontend URL shown in the terminal, usually:

```text
http://localhost:5173
```

## 🔗 API Configuration

The frontend uses the `VITE_API_URL` environment variable to connect to the backend.

In `frontend/src/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

console.log("BACKEND API URL:", API_URL);

export default API_URL;
```

For local development, the fallback URL is used.

For the deployed frontend, configure:

```env
VITE_API_URL=https://student-management-system-kmkr.onrender.com
```

## 🔐 Security

The application uses several security-related mechanisms:

- JWT-based authentication
- Protected API routes
- Role-based authorization middleware
- Password hashing
- Environment variables for private configuration

**Important:** Never upload `.env` files, database passwords, email app passwords, or JWT secrets to GitHub.

## 🧪 Backend Health Check

To check whether the backend is running, open:

```text
https://student-management-system-kmkr.onrender.com/health
```

Expected response:

```json
{
  "success": true,
  "message": "Backend is healthy!"
}
```

## 🌐 Deployment

The application uses the following deployment services:

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Source Code | GitHub |

## 🎯 Learning Outcomes

Through this project, the following concepts were practiced:

- Full-stack web application development
- React component-based architecture
- REST API development and integration
- Node.js and Express.js backend development
- MongoDB database integration
- JWT authentication
- Role-based access control
- Git and GitHub version control
- Frontend and backend deployment

## 🔮 Future Enhancements

Possible future improvements include:

- Student attendance management
- Examination and results management
- Fee management
- Advanced search and filtering
- Student data export
- Reports and analytics
- Improved dashboard statistics

## 👨‍💻 Author

**Developed as an Academic Full Stack Development Project**

GitHub: [nageshranjan265-oss](https://github.com/nageshranjan265-oss)

## 📄 License

This project is developed for educational and academic purposes.
