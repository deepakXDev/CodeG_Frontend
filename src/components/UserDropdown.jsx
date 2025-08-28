import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


import { User, PlusCircle, LogOut } from 'lucide-react';


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function UserDropdown() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        await logout();
        setIsLoggingOut(false);
    };

    const getUserInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    
    if (!isAuthenticated) {
        return (
            <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
                Login
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0">
                    <Avatar className="h-10 w-10 border-2 border-transparent hover:border-purple-500 transition-colors">
                        <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                        <AvatarFallback className="bg-[#282828] text-gray-300">{getUserInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
                className="w-56 bg-[#282828] border-gray-700 text-gray-300" 
                align="end" 
                forceMount
            >
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{user?.name || 'User'}</p>
                        <p className="text-xs leading-none text-gray-400">{user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                
                
                <DropdownMenuItem 
                    onClick={() => navigate('/profile')} 
                    className="focus:bg-gray-700 focus:text-white cursor-pointer"
                >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                
                {(user?.role === 'Problem_Setter' || user?.role === 'Admin') && (
                    <DropdownMenuItem 
                        onClick={() => navigate('/create-problem')}
                        className="focus:bg-gray-700 focus:text-white cursor-pointer"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Create Problem</span>
                    </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                    onClick={handleLogout} 
                    disabled={isLoggingOut}
                    className="focus:bg-red-900/50 focus:text-white cursor-pointer"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
