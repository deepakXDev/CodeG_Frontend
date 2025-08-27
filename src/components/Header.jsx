import React from 'react';
import { useNavigate, NavLink as RouterNavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserDropdown from './UserDropdown';

// Reusable NavLink component for cleaner code
const NavLink = ({ to, children }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `font-medium px-3 py-2 rounded-md transition-colors text-sm ${
        isActive
          ? 'bg-gray-700 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`
    }
  >
    {children}
  </RouterNavLink>
);

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-2 left-0 right-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center bg-[#1A1A1A]/80 backdrop-blur-lg border border-gray-700 rounded-xl px-4 sm:px-6 py-2 shadow-2xl">
          {/* Stylish Logo */}
          <div
            className="text-2xl font-bold text-white cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
              CodeG
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/problems">Explore</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/submissions">Submissions</NavLink>
                <NavLink to="/dashboard">Dashboard</NavLink>
              </>
            )}
            <UserDropdown />
          </div>
        </div>
      </nav>
    </header>
  );
}