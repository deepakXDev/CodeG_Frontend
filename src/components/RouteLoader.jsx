import React from 'react';

const RouteLoader = ({ message = "Loading..." }) => {
    return (
        <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center relative overflow-hidden font-sans">
            {/* Background Gradient Effect */}
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-radial-gradient from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>

            {/* Main loading content */}
            <div className="relative z-10 text-center flex flex-col items-center">
                
                {/* Animated Rings Spinner */}
                <div className="relative w-24 h-24 flex items-center justify-center mb-8">
                    {/* Ring 1 (Outer) */}
                    <div className="absolute w-full h-full rounded-full border-2 border-purple-500/30 animate-ping-slow opacity-50"></div>
                    {/* Ring 2 (Inner) */}
                    <div className="absolute w-2/3 h-2/3 rounded-full border-2 border-purple-500/50 animate-ping-slower opacity-75"></div>
                    {/* Central Glow */}
                    <div className="w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(192,132,252,0.7)]"></div>
                </div>
                
                {/* Loading text */}
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-white animate-pulse" style={{ animationDelay: '200ms' }}>
                        {message}
                    </h2>
                    <div className="flex items-center justify-center space-x-1.5">
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
                    </div>
                </div>
                
                {/* Brand identifier */}
                <div className="absolute top-full mt-12">
                    <p className="text-gray-600 text-sm font-medium">
                        <span className="bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text font-bold">CodeG</span>
                    </p>
                </div>
            </div>
            
            {/* Custom CSS for animations (if not in tailwind.config.js) */}
            <style jsx="true">{`
                @keyframes ping-slow {
                    75%, 100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                @keyframes ping-slower {
                    75%, 100% {
                        transform: scale(1.8);
                        opacity: 0;
                    }
                }
                .animate-ping-slow {
                    animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                .animate-ping-slower {
                    animation: ping-slower 2.5s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s;
                }
                .bg-radial-gradient {
                    background-image: radial-gradient(circle, var(--tw-gradient-stops));
                }
            `}</style>
        </div>
    );
};

export default RouteLoader;
