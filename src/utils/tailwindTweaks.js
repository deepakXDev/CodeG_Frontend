// utils/tailwindTweaks.js
export const tweakClasses = (className) => {
//   const map = {
//     /* ---------------------- GLOBAL ---------------------- */
//     "min-h-screen bg-white": "min-h-screen font-sans bg-gradient-to-br from-purple-50 to-pink-50 text-gray-900",
    
//     /* ---------------------- HERO ---------------------- */
//     "text-6xl font-bold text-black": "text-6xl md:text-7xl font-extrabold text-gray-900",
//     "text-gray-700": "text-purple-600",
//     "px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800": "px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-3xl shadow-2xl hover:scale-105 hover:shadow-3xl transition-transform duration-300 font-semibold",
    
//     /* ---------------------- FEATURE CARDS ---------------------- */
//     "bg-white p-8 rounded-lg border-2 border-black hover:shadow-xl": "bg-gradient-to-br from-white to-purple-50 p-8 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-transform duration-300 border border-gray-200",
//     "text-2xl font-bold text-black": "text-2xl font-bold mb-4 text-purple-700",
    
//     /* ---------------------- AI Buttons ---------------------- */
//     "bg-blue-500 text-white hover:bg-blue-600": "px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:scale-105 transition-transform duration-300",
//     "bg-green-500 text-white hover:bg-green-600": "px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full shadow-md hover:scale-105 transition-transform duration-300",
//     "bg-purple-500 text-white hover:bg-purple-600": "px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-full shadow-md hover:scale-105 transition-transform duration-300",
//     "bg-yellow-400 text-white hover:bg-yellow-500": "px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full shadow-md hover:scale-105 transition-transform duration-300",

//     /* ---------------------- OUTPUT/EDITOR ---------------------- */
//     "bg-gray-50 rounded-lg border-2 border-gray-300": "bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-gray-200 shadow-2xl hover:shadow-3xl",
//     "font-mono text-sm": "font-mono text-base text-gray-900",
    
//     /* ---------------------- CTA/FOOTER ---------------------- */
//     "py-20 bg-black text-white": "py-20 bg-gradient-to-r from-purple-700 to-pink-500 text-white rounded-3xl shadow-2xl backdrop-blur-sm",
//     "px-8 py-4 bg-white text-black rounded-lg": "px-10 py-4 bg-white text-purple-700 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-transform duration-300",
//   };



  // replace all old classes with new ones
  let updatedClass = className;
  for (const [oldClass, newClass] of Object.entries(map)) {
    if (updatedClass.includes(oldClass)) {
      updatedClass = updatedClass.replace(oldClass, newClass);
    }
  }

  return updatedClass;
};
