import React from 'react';
import Header from './components/Header';
import Auth from './pages/auth.jsx';
import Dashboard from './pages/dashboard.jsx';
import Profile from './pages/profile.jsx';
import EditProfile from './pages/edit-profile.jsx';
import Problems from './pages/problems.jsx';
import CreateProblem from './pages/create-problem.jsx';
import MyProblems from './pages/my-problems.jsx';
import ProblemDetail from './pages/problem-detail.jsx';
import EditProblem from './pages/edit-problem.jsx';
import SubmissionsPage from './pages/SubmissionsPage.jsx';
import Home from './pages/home.jsx';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import RouteWrapper from './components/RouteWrapper.jsx';
import { ToastProvider } from './components/Toast.jsx';
import MainLayout from './components/MainLayout';



function AppContent() {
    return (
        <MainLayout>
            <Routes>
                <Route 
                    path='/' 
                    element={
                        <RouteWrapper title="Home">
                            <Home />
                        </RouteWrapper>
                    } 
                />
                <Route 
                    path='/auth' 
                    element={
                        <RouteWrapper title="Authentication">
                            <Auth />
                        </RouteWrapper>
                    } 
                />
                <Route path='/dashboard' element={<PrivateRoute element={<Dashboard />} title="Dashboard" />} />
                <Route path='/profile' element={<PrivateRoute element={<Profile />} title="Profile" />} />
                <Route path='/edit-profile' element={<PrivateRoute element={<EditProfile />} title="Edit Profile" />} />
                <Route path='/problems' element={<PrivateRoute element={<Problems />} title="Problems" />} />
                <Route path='/problem/:id' element={<PrivateRoute element={<ProblemDetail />} title="Problem" />} />
                <Route path='/create-problem' element={<PrivateRoute element={<CreateProblem />} title="Create Problem" />} />
                <Route path='/edit-problem/:id' element={<PrivateRoute element={<EditProblem />} title="Edit Problem" />} />
                <Route path='/my-problems' element={<PrivateRoute element={<MyProblems />} title="My Problems" />} />
                <Route path='/submissions' element={<PrivateRoute element={<SubmissionsPage />} title="Submissions" />} />
            </Routes>
        </MainLayout>
    );
}


export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
