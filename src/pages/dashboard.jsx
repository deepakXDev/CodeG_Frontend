import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

//==============================================================================
// 1. CONFIGURATION & HELPERS (Moved outside for performance)
//==============================================================================

// Configuration object for role-specific data and styling
const ROLE_CONFIG = {
  Problem_Setter: {
    label: 'Problem Setter',
    styles: 'bg-purple-900/50 text-purple-300 border border-purple-700',
    icon: <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />,
    features: [
      { title: 'Create Problem', description: 'Design a new challenge for the community.', path: '/create-problem' },
      { title: 'My Problems', description: 'View and manage all your contributions.', path: '/my-problems' }
    ]
  },
  Admin: {
    label: 'Administrator',
    styles: 'bg-red-900/50 text-red-300 border border-red-700',
    icon: <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
    features: [
      { title: 'Manage Users', description: 'Oversee all users and roles.', path: '/admin/users' },
      { title: 'All Problems', description: 'Review and manage all problems.', path: '/admin/problems' }
    ]
  },
  User: {
    label: 'User',
    styles: 'bg-gray-700 text-gray-300 border border-gray-600',
    icon: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    features: []
  },
};

//==============================================================================
// 2. MAIN DASHBOARD COMPONENT
//==============================================================================

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();

  // Guard clause in case user data is not yet loaded
  if (!loggedInUser) {
    return <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center text-white">Loading User Profile...</div>;
  }

  const userRoleConfig = ROLE_CONFIG[loggedInUser.role] || ROLE_CONFIG.User;

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-gray-300 font-sans pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <WelcomeHeader user={loggedInUser} roleConfig={userRoleConfig} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Standard User Actions */}
          <ActionCard 
            title="Browse Problems" 
            description="Sharpen your skills and solve challenges." 
            path="/problems"
            icon={<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
          />
          <ActionCard 
            title="Web IDE" 
            description="A frictionless environment to code and test." 
            path="/code"
            icon={<path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />}
          />
          <ActionCard 
            title="My Profile" 
            description="Track your progress and achievements." 
            path="/profile"
            icon={<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
          />

          {/* Role-Specific Actions */}
          {userRoleConfig.features.map(feature => (
             <ActionCard 
                key={feature.path}
                title={feature.title} 
                description={feature.description} 
                path={feature.path}
                isSpecialRole
                icon={<path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />}
             />
          ))}
        </div>
      </div>
    </div>
  );
}

//==============================================================================
// 3. UI & LAYOUT SUB-COMPONENTS
//==============================================================================

const WelcomeHeader = ({ user, roleConfig }) => (
  <div className="text-center mb-12">
    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
      Welcome back, {user.name || 'Developer'}!
    </h1>
    <p className="text-gray-400 text-lg mb-6">
      Let's build something great today. Here are your quick actions:
    </p>
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${roleConfig.styles}`}>
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        {roleConfig.icon}
      </svg>
      {roleConfig.label}
    </div>
  </div>
);

const ActionCard = ({ title, description, path, icon, isSpecialRole = false }) => {
  const navigate = useNavigate();
  
  const baseClasses = "bg-[#282828] p-6 rounded-xl border transition-all duration-300 group";
  const borderClasses = isSpecialRole 
    ? "border-purple-800 hover:border-purple-600 hover:bg-[#2d2d2d]" 
    : "border-gray-700 hover:border-gray-500 hover:bg-[#333333]";

  return (
    <div onClick={() => navigate(path)} className={`${baseClasses} ${borderClasses} cursor-pointer`}>
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center mr-4 border border-gray-600">
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-gray-400 mb-6">{description}</p>
      <button className="w-full text-center font-semibold py-2 bg-gray-700/50 text-gray-300 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
        {isSpecialRole ? `Go to ${title}` : `Open ${title}`}
      </button>
    </div>
  );
};