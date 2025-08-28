import React from "react";
import Header from "./Header"; // Assuming your Header component is in the same directory

export const LayoutBackground = () => (
  <>
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
    ></div>

    <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient from-purple-900/10 via-transparent to-transparent pointer-events-none"></div>

    <style jsx="true">{`
      .bg-radial-gradient {
        background-image: radial-gradient(
          circle at 20% 30%,
          var(--tw-gradient-stops)
        );
      }
    `}</style>
  </>
);

const MainLayout = ({ children }) => {
    return (
        
        <div className="min-h-screen bg-[#1A1A1A] text-gray-300 font-sans relative">
            <LayoutBackground />

            
            <div className="relative z-10">
                <Header />
                <main className="pt-20">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
