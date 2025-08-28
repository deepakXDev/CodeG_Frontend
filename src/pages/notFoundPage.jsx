import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Assuming you use shadcn Button

// You can use an icon library like lucide-react for a better visual
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] text-white text-center px-4">
      <AlertTriangle className="w-24 h-24 text-purple-500 mb-6" />
      <h1 className="text-6xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-400 max-w-md mb-8">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Button 
        asChild 
        className="bg-purple-600 text-white hover:bg-purple-700"
      >
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Go Back Home
        </Link>
      </Button>
    </div>
  );
}
