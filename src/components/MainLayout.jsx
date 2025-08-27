import React from 'react';
import Header from './Header'; // Assuming your Header component is in the same directory

// const MainLayout = ({ children }) => {
//     return (
//         // This div is the new global container with the dark theme
//         <div className="min-h-screen bg-[#1A1A1A] text-gray-300 font-sans">
//             <Header />
//             <main className="pt-20"> {/* Padding-top to offset the fixed header */}
//                 {children}
//             </main>
//         </div>
//     );
// };

const MainLayout = ({ children }) => {
    return (
        // This div is the new global container with the dark theme
        <div className="min-h-screen bg-[#1A1A1A] text-gray-300 font-sans relative">
            {/* Background pattern and glow effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>

            {/* Content needs to be relative to stay on top */}
            <div className="relative z-10">
                <Header />
                <main className="pt-20"> {/* Padding-top to offset the fixed header */}
                    {children}
                </main>
            </div>
             {/* Custom CSS for the radial gradient if not in tailwind.config.js */}
             <style jsx="true">{`
                .bg-radial-gradient {
                    background-image: radial-gradient(circle at 50% 30%, var(--tw-gradient-stops));
                }
            `}</style>
        </div>
    );
};

export default MainLayout;