import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Import shadcn/ui components
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

// Placeholder Icons (replace with a library like lucide-react if you wish)
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;

export default function UserDropdown() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        // The context now handles the API call and navigation
        await logout(); 
        // No need for handleSuccess here, as the context will redirect
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
            <Button variant="outline" onClick={() => navigate('/auth')}>
                Login
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                        <AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserIcon />
                    <span className="ml-2">Profile</span>
                </DropdownMenuItem>
                
                {(user?.role === 'Problem_Setter' || user?.role === 'Admin') && (
                    <DropdownMenuItem onClick={() => navigate('/create-problem')}>
                        <PlusCircleIcon />
                        <span className="ml-2">Create Problem</span>
                    </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                    <LogOutIcon />
                    <span className="ml-2">{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
