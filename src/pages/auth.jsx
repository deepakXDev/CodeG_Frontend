import React from 'react'
import { useState } from 'react'
import Login from '../components/login.jsx'
// import Register from '../components/register.jsx'
import Register from '@/components/register.jsx'


const AuthCard = ({ children }) => (
    <div className="bg-[#282828]/60 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/20 overflow-hidden">
        {children}
    </div>
);


const AuthBackground = () => (
    <>
        <div 
            className="absolute inset-0 opacity-20" 
            style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.12\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            }}
        ></div>
        <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
    </>
);

const AuthHeader = ({ isLoginView }) => (
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold mb-2 text-white">
      Welcome to <span className="border-b-4 border-purple-500">CodeG</span>
    </h1>
    <p className="text-gray-400">
      {isLoginView ? 'Sign in to access your personalized dashboard' : 'Join CodeG and start building your skills today'}
    </p>
  </div>
);

const AuthFooter = () => (
  <div className="text-center mt-8 text-gray-500">
    <p className="text-xs">
      By continuing, you agree to CodeG’s <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
    </p>
  </div>
);



function Auth() {
    const [isLoginView, setIsLoginView] = useState(true);

    const toggleForm = () => {
        setIsLoginView(!isLoginView);
    };

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-gray-300 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
            <AuthBackground />
            <div className="relative z-10 w-full max-w-md">
                <AuthHeader isLoginView={isLoginView} />
                <AuthCard>
                    {isLoginView ? (
                        <Login onToggleForm={toggleForm} />
                    ) : (
                        <Register onToggleForm={toggleForm} />
                    )}
                </AuthCard>

                <AuthFooter />
            </div>
        </div>
    );
}

export default Auth;