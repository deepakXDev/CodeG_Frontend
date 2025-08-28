import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils';
import { User, Mail, MapPin, Link as LinkIcon, Save, X, Camera } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const FormField = ({ id, label, value, name, onChange, placeholder, type = "text", required = false }) => (
    <div>
        <Label htmlFor={id} className="text-gray-300 mb-2 block">{label}{required && ' *'}</Label>
        <Input
            id={id}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="bg-[#1A1A1A] border-gray-700 focus-visible:ring-purple-500 text-white"
        />
    </div>
);

const GenderSelector = ({ value, onValueChange }) => (
    <div>
        <Label className="text-gray-300 mb-2 block">Gender</Label>
        <Select name="gender" value={value} onValueChange={onValueChange}>
            <SelectTrigger className="bg-[#1A1A1A] border-gray-700 text-white">
                <SelectValue placeholder="Select a gender" />
            </SelectTrigger>
            <SelectContent className="bg-[#282828] border-gray-700 text-white">
                <SelectItem value="N">Not specified</SelectItem>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
                <SelectItem value="O">Other</SelectItem>
            </SelectContent>
        </Select>
    </div>
);

const AvatarUploader = ({ src, fallback, onAvatarChange }) => {
    const fileInputRef = useRef(null);
    const handleAvatarClick = () => fileInputRef.current.click();

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="h-32 w-32 border-4 border-purple-500">
                    <AvatarImage src={src} />
                    <AvatarFallback className="text-4xl bg-[#1A1A1A]">{fallback}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                </div>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={(e) => onAvatarChange(e.target.files[0])}
            />
            <p className="text-sm text-gray-500">Click avatar to change</p>
        </div>
    );
};


const EditProfile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '', username: '', email: '', gender: 'N', location: '', website: '', avatar: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/me`, { credentials: 'include' });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setFormData({
                            fullName: result.data.fullName || '',
                            username: result.data.username || '',
                            email: result.data.email || '',
                            gender: result.data.gender || 'N',
                            location: result.data.location || '',
                            website: result.data.website || '',
                            avatar: result.data.avatar || ''
                        });
                    }
                } else { throw new Error("Failed to fetch profile"); }
            } catch (error) {
                handleError('Failed to load profile data.');
                navigate('/profile');
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (file) => {
        if (file) {
            setAvatarFile(file);
            setFormData(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName.trim() || !formData.username.trim()) {
            return handleError('Full Name and Username are required.');
        }
        setSaving(true);
        try {
            const updateData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'avatar' && key!=='email') updateData.append(key, formData[key]);
            });
            if (avatarFile) updateData.append('avatar', avatarFile);
            
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/me`, {
                method: 'PUT',
                credentials: 'include',
                body: updateData
            });
            const result = await response.json();

            if (response.ok && result.success) {
                handleSuccess('Profile updated successfully!');
                setTimeout(() => navigate('/profile'), 1500);
            } else {
                handleError(result.message || 'Failed to update profile');
            }
        } catch (error) {
            handleError('An error occurred while updating your profile.');
        } finally {
            setSaving(false);
        }
    };

    const getUserInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Card className="bg-[#282828] border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-3xl text-white">Edit Profile</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                        <X className="h-6 w-6 text-gray-400" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <AvatarUploader 
                            src={formData.avatar}
                            fallback={getUserInitials(formData.fullName)}
                            onAvatarChange={handleAvatarChange}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField id="fullName" label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                            <FormField id="username" label="Username" name="username" value={formData.username} onChange={handleInputChange} required />
                        </div>
                        <FormField id="email" label="Email" name="email" value={formData.email} onChange={handleInputChange} type="email" required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <GenderSelector value={formData.gender} onValueChange={(value) => setFormData(p => ({ ...p, gender: value }))} />
                            <FormField id="location" label="Location" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., San Francisco, CA" />
                        </div>
                        <FormField id="website" label="Website" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://your-portfolio.com" type="url" />
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button type="submit" disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold h-12">
                                <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate('/profile')} disabled={saving} className="flex-1 border-gray-600 hover:bg-gray-700 h-12">
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditProfile;
