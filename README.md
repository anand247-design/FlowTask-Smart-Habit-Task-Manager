# FlowSmart — Habit & Task Manager

A full-stack web application designed to help users build consistent habits, manage daily tasks, and track their productivity in one place.

FlowSmart combines habit tracking, task management, calendar views, and analytics to make everyday planning easier.

## ✨ Features

- **User Authentication** — Register and log in to your account.
- **Habit Tracking** — Create and manage habits to build consistent routines.
- **Task Management** — Organize daily tasks and manage your workload.
- **Analytics Dashboard** — View productivity-related insights and progress.
- **Calendar View** — Organize and view activities through a calendar interface.
- **Responsive UI** — A React-based interface designed for convenient use across screen sizes.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Tailwind CSS
- JavaScript

**Backend**
- Node.js
- Express.js
- REST API

**Database**
- MongoDB
- Mongoose

**Authentication**
- JWT-based authentication
- Password hashing with bcrypt (if implemented in the current version)

## 📁 Project Structure

```text
FlowSmart-Habit-Task-Manager/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

Follow these steps to run FlowSmart locally.

### Prerequisites

- Node.js and npm
- MongoDB database
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/anand247-design/FlowSmart-Habit-Task-Manager.git
cd FlowSmart-Habit-Task-Manager
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory using the variables documented in `.env.example`. Add your own local configuration values.

For example, the backend may require:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret
```

Use the actual variable names required by the application. Never commit your real `.env` file or credentials.

Start the backend:

```bash
npm start
```

If your `package.json` does not define a `start` script, use the development script configured in that file, such as `npm run dev`.

### 3. Set Up the Frontend

Open a new terminal from the project root:

```bash
cd frontend
npm install
```

Create a frontend `.env` file if your application requires one. Use the variable names specified by your frontend code or example configuration.

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in your terminal, typically `http://localhost:5173`.

### 4. Configure the Database

Ensure MongoDB is running or that your MongoDB connection string points to an accessible database. The backend environment must contain the correct connection settings before the application can connect successfully.

## 🔐 Security

- Environment files containing secrets are excluded from version control.
- Never publish database credentials, API keys, passwords, or JWT signing secrets.
- Configure your own environment variables before running the application.
- Do not use real user data when testing or sharing screenshots.

## 🎯 Project Goals

FlowSmart was built to explore full-stack web development concepts, including component-based UI development, REST API design, database integration, authentication, and application state management.

## 👨‍💻 Author

**Anand Singh**

GitHub: [@anand247-design](https://github.com/anand247-design)

---

If you find this project useful, feel free to explore the code and share feedback.
