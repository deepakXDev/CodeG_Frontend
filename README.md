```markdown
# CodeG - The AI-Powered Online Judge Platform

CodeG is a modern, full-featured web platform for practicing coding problems, managing submissions, and receiving AI-powered feedback. Built with **React**, it provides a seamless and modular frontend experience for both competitive programmers and students learning to code, with distinct user roles for problem setters and standard users.

---

## 📑 Table of Contents
- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [License](#license)

---

## 📖 About The Project
This project is the **frontend for CodeG**, an online judge system designed to be robust, scalable, and user-friendly.  

The application is architected as a **Single Page Application (SPA)** using **React** and **react-router-dom** for navigation.  

It features:
- Complete authentication flow
- Role-based access control
- Comprehensive problem management
- Detailed submission tracking system

✨ A standout feature is the **AI review system**, which provides users with insightful feedback on their code submissions — going beyond simple pass/fail test cases.

The entire codebase is modular and maintainable, with a clear separation of concerns between UI components, page-level logic, and state management.

---

## 🚀 Key Features

- 🔐 **Comprehensive Authentication & Authorization**  
  Secure user registration (Register) and login (Login) components, managed globally via `AuthContext`.  
  Includes OTP verification, session management, and a `UserDropdown` for profile/logout actions.

- 🔒 **Role-Based Access**  
  A `PrivateRoute` component protects routes, ensuring only authenticated users can access them.  
  Supports a **Problem Setter** role with permissions to create/manage problems.

- 👤 **User Profile Management**  
  Users can view their profile (`Profile`) and update details via `EditProfile`.

- 💻 **Advanced Problem Management**  
  - Browse challenges on the `Problems` page  
  - Detailed `ProblemDetail` page (description, constraints, submission UI)  
  - Problem Setters can add challenges via `CreateProblem`, which go through an approval workflow  

- 🚀 **Detailed Submission Tracking**  
  - `SubmissionsPage` and `SubmissionHistory` for attempt history  
  - Real-time tracking of statuses (Pending, Compiling, Accepted, Wrong Answer, etc.)

- 🤖 **AI-Powered Code Review**  
  Automated feedback via `AIReview` for logic, efficiency, and style improvements.

- 📊 **Personalized Dashboard**  
  Displays user statistics, recent submissions, and progress bars.

- 🎨 **Modern UI/UX**  
  Clean, responsive `MainLayout`, shared `Header`, and toast notifications.

---

## 🛠️ Tech Stack

- **Framework**: React  
- **Routing**: React Router DOM  
- **State Management**: React Context API (`AuthContext`)  
- **API Communication**: Fetch API / Axios  
- **Build Tool**: Vite / Create React App  

---

## 📂 Project Structure

```

/src
│
├── /components             # Reusable UI components
│   ├── AIReview\.jsx
│   ├── Header.jsx
│   ├── Login.jsx
│   ├── PrivateRoute.jsx
│   ├── Register.jsx
│   ├── SubmissionHistory.jsx
│   ├── Toast.jsx
│   ├── UserDropdown.jsx
│   └── MainLayout.jsx
│
├── /contexts               # Global state management
│   └── AuthContext.jsx
│
├── /pages                  # Top-level route components
│   ├── create-problem.jsx
│   ├── dashboard.jsx
│   ├── edit-profile.jsx
│   ├── home.jsx
│   ├── my-problems.jsx
│   ├── notFoundPage.jsx
│   ├── problem-detail.jsx
│   ├── problems.jsx
│   └── SubmissionsPage.jsx
│
├── /utils                  # Utility functions and services
│   └── apiService.js
│
├── App.jsx                 # Main application component with routing logic
└── index.js                # Entry point of the application

````

---

## ⚡ Getting Started

Follow these simple steps to run the project locally:

### ✅ Prerequisites
- Node.js (v16 or later)
- npm or yarn

### 🔧 Installation
```bash
# Clone the repository
git clone https://github.com/your-username/your-repo-name.git

# Navigate to the project directory
cd your-repo-name

# Install dependencies
npm install

# Start the development server
npm run dev
````

Your application should now be running at:
👉 [http://localhost:5173](http://localhost:5173) (or another available port).

---

## 📜 License

This project is distributed under the **MIT License**.
See [LICENSE.md](LICENSE.md) for details.

```

---

Would you like me to also add **badges** (like React, Vite, MIT License, etc.) at the top of the README to make it look more professional?
```
