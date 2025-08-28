import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleError } from '../utils'; // Your custom error handler
import { Calendar, User, Mail, MapPin, Link as LinkIcon, Edit } from 'lucide-react';

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

//==============================================================================
// 1. DATA-DRIVEN SUB-COMPONENTS
//==============================================================================

const ProfileHeader = ({ user }) => {
    const navigate = useNavigate();
    const getUserInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <Card className="bg-[#282828] border-gray-700 mb-8">
            <CardContent className="p-6 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <Avatar className="h-28 w-28 border-4 border-purple-500">
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                    <AvatarFallback className="text-4xl bg-[#1A1A1A]">
                        {getUserInitials(user.fullName)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-white">{user.fullName}</h1>
                    <p className="text-xl text-gray-400 mt-1">@{user.username}</p>
                    <Button onClick={() => navigate('/edit-profile')} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const ProfileStats = ({ userId }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}/profile`, { credentials: 'include' });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) setStats(result.data.stats);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            }
        };
        fetchStats();
    }, [userId]);

    if (!stats) return <Card className="bg-[#282828] border-gray-700 p-6"><p>Loading stats...</p></Card>;
    
    const acceptanceRate = stats.totalSubmissions > 0 ? ((stats.totalSolved / stats.totalSubmissions) * 100).toFixed(1) : 0;

    return (
        <Card className="bg-[#282828] border-gray-700">
            <CardHeader>
                <CardTitle className="text-2xl text-white">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-[#1A1A1A] rounded-lg">
                    <p className="text-3xl font-bold text-purple-400">{stats.totalSolved || 0}</p>
                    <p className="text-sm text-gray-400">Solved</p>
                </div>
                <div className="p-4 bg-[#1A1A1A] rounded-lg">
                    <p className="text-3xl font-bold text-purple-400">{stats.totalSubmissions || 0}</p>
                    <p className="text-sm text-gray-400">Submissions</p>
                </div>
                <div className="p-4 bg-[#1A1A1A] rounded-lg">
                    <p className="text-3xl font-bold text-purple-400">{acceptanceRate}%</p>
                    <p className="text-sm text-gray-400">Acceptance</p>
                </div>
                 <div className="p-4 bg-[#1A1A1A] rounded-lg">
                    <p className="text-3xl font-bold text-purple-400">{stats.currentStreak || 0}</p>
                    <p className="text-sm text-gray-400">Streak</p>
                </div>
            </CardContent>
        </Card>
    );
};

const CodingActivity = ({ userId }) => {
    const [activity, setActivity] = useState([]);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}/activity`, { credentials: 'include' });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) setActivity(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch activity:", error);
            }
        };
        fetchActivity();
    }, [userId]);

    // A simple representation of the heatmap. A library like 'react-calendar-heatmap' would be better for a real implementation.
    return (
        <Card className="bg-[#282828] border-gray-700">
            <CardHeader>
                <CardTitle className="text-2xl text-white">Coding Activity</CardTitle>
                <CardDescription>Your submission activity over the last year.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                 <div className="grid grid-cols-12 gap-1 h-32 bg-[#1A1A1A] p-2 rounded-lg">
                    {/* This is a placeholder for a real heatmap */}
                    {Array.from({ length: 365 }).map((_, i) => (
                        <TooltipProvider key={i} delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className={`w-full h-2 rounded-sm ${Math.random() > 0.7 ? 'bg-purple-600' : 'bg-gray-700'}`}></div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{new Date(Date.now() - (365 - i) * 24 * 60 * 60 * 1000).toDateString()}</p>
                                    <p>{Math.floor(Math.random() * 5)} submissions</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )).slice(0, 84) /* Limit for display */}
                </div>
            </CardContent>
        </Card>
    );
};

const AccountDetails = ({ user }) => {
    const getGenderDisplay = (gender) => {
        const genderMap = { 'M': 'Male', 'F': 'Female', 'O': 'Other', 'N': 'Not specified' };
        return genderMap[gender] || 'Not specified';
    };

    return (
        <Card className="bg-[#282828] border-gray-700">
            <CardHeader>
                <CardTitle className="text-2xl text-white">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-4" />
                    <p className="text-gray-300">{user.email}</p>
                </div>
                <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-4" />
                    <p className="text-gray-300">{getGenderDisplay(user.gender)}</p>
                </div>
                <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-4" />
                    <p className="text-gray-300">{user.location || 'Not specified'}</p>
                </div>
                 <div className="flex items-center">
                    <LinkIcon className="h-5 w-5 text-gray-400 mr-4" />
                    {user.website ? (
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{user.website}</a>
                    ) : (
                        <p className="text-gray-300">Not specified</p>
                    )}
                </div>
                <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-4" />
                    <p className="text-gray-300">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
            </CardContent>
        </Card>
    );
};


//==============================================================================
// 2. MAIN PROFILE PAGE COMPONENT
//==============================================================================

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Use the new '/me' endpoint to get authenticated user's data
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/me`, { credentials: 'include' });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) setUser(result.data);
                } else {
                    throw new Error("Failed to fetch profile");
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                handleError('Failed to load your profile data.');
                navigate('/auth'); // Redirect to login if profile fails to load
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!user) {
         return (
            <div className="flex flex-col items-center justify-center h-screen text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Could not load profile</h2>
                <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <ProfileHeader user={user} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ProfileStats userId={user._id} />
                    <CodingActivity userId={user._id} />
                </div>
                <div className="lg:col-span-1">
                    <AccountDetails user={user} />
                </div>
            </div>
        </div>
    );
};

export default Profile;
