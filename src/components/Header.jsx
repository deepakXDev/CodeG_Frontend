// filepath: d:\algo\oj_project\frontend\src\components\Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserDropdown from './UserDropdown';

export default function Header() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <header className="fixed top-2 left-0 right-0 z-50">
            <nav className="container mx-auto px-6 py-0.5">
                <div className="flex justify-between items-center bg-white/90 backdrop-blur-lg border-2 border-black rounded-xl px-6 py-2 shadow-lg">
                    <h1 
                        className="text-2xl font-bold text-black cursor-pointer hover:text-gray-700 transition-colors border-b-2 border-transparent hover:border-black" 
                        onClick={() => navigate('/')}
                    >
                        CodeJudge
                    </h1>
                    <div className="flex items-center space-x-6">
                        <button 
                            onClick={() => navigate('/')}
                            className="text-black hover:text-gray-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                        >
                            Home
                        </button>
                        <button 
                            onClick={() => navigate('/problems')}
                            className="text-black hover:text-gray-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                        >
                            Problems
                        </button>
                        {isAuthenticated && (
                            <button 
                                onClick={() => navigate('/submissions')}
                                className="text-black hover:text-gray-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                            >
                                Submissions
                            </button>
                        )}
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="text-black hover:text-gray-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                        >
                            Dashboard
                        </button>
                        {/* Add Code Editor link for authenticated users */}
                        <UserDropdown />
                    </div>
                </div>
            </nav>
        </header>
    );
}