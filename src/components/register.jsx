import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { toast } from 'sonner';

const ShadcnInputField = ({ icon: Icon, type, name, placeholder, value, onChange, isPassword = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    const inputType = isPassword ? (isVisible ? 'text' : 'password') : type;

    return (
        <div className="relative mb-4">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
                type={inputType}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="pl-10 pr-10 bg-white border-gray-700 focus-visible:ring-purple-500 text-black"
            />
            {isPassword && (
                <button type="button" onClick={() => setIsVisible(!isVisible)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isVisible ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
            )}
        </div>
    );
};

const AccountTypeSelector = ({ selectedRole, onSelect }) => (
    <RadioGroup defaultValue={selectedRole} onValueChange={onSelect} className="space-y-3 mb-6">
        <div>
            <RadioGroupItem value="User" id="user-role" className="peer sr-only" />
            <Label htmlFor="user-role" className="flex flex-col items-start p-4 rounded-lg border-2 border-gray-700 peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:bg-[#2d2d2d] transition-all cursor-pointer">
                <span className="text-sm font-medium text-white">Standard User</span>
                <span className="text-xs text-gray-400 mt-1">Solve problems, track progress, and compete.</span>
            </Label>
        </div>
        <div>
            <RadioGroupItem value="Problem_Setter" id="setter-role" className="peer sr-only" />
            <Label htmlFor="setter-role" className="flex flex-col items-start p-4 rounded-lg border-2 border-gray-700 peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:bg-[#2d2d2d] transition-all cursor-pointer">
                <span className="text-sm font-medium text-white">Problem Setter</span>
                <span className="text-xs text-gray-400 mt-1">Create and manage challenges for the community.</span>
            </Label>
        </div>
    </RadioGroup>
);

export default function Register({ onToggleForm }) {
    const [view, setView] = useState('register');
    const [userEmail, setUserEmail] = useState('');

    const handleRegisterSuccess = (email) => {
        setUserEmail(email);
        setView('otp');
    };

    if (view === 'otp') {
        return <OtpForm email={userEmail} onToggleForm={onToggleForm} />;
    }

    return <RegisterFormComponent onRegisterSuccess={handleRegisterSuccess} onToggleForm={onToggleForm} />;
}


function RegisterFormComponent({ onRegisterSuccess, onToggleForm }) {
    // const [captchaToken, setCaptchaToken] = useState('dummy'); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const captchaRef = useRef(null);
    const [registerInfo, setRegisterInfo] = useState({
        name: "",
        email: "",
        password: "",
        role: "User",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRegisterInfo(prev => ({ ...prev, [name]: value }));
    };

     const handleRoleChange = (role) => {
        setRegisterInfo(prev => ({ ...prev, role }));
    };

   const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, role } = registerInfo;
        if (!name || !email || !password || !role) {
            return handleError("All fields are required.");
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ ...registerInfo, captchaToken: 'dummy' }),
            });
            const result = await response.json();

            if (response.ok) {
                handleSuccess("Registration successful! Please check your email for a verification code.");
                // setTimeout(() => onToggleForm(), 2000);
                onRegisterSuccess(registerInfo.email); 
            } else {
                handleError(result.message || "Registration failed. Please try again.");
            }
        } catch (err) {
            handleError("An unexpected error occurred: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
   
 return (
  <CardContent className="p-8">
    <CardHeader className="text-center p-0 mb-8">
      <CardTitle className="text-3xl font-bold text-white">Join CodeG</CardTitle>
      <CardDescription className="text-gray-400 pt-2">
        Create your free account and start your journey today.
      </CardDescription>
    </CardHeader>

    <form onSubmit={handleSubmit}>
      <ShadcnInputField icon={User} type="text" name="name" placeholder="Full Name" value={registerInfo.name} onChange={handleChange} />
      <ShadcnInputField icon={Mail} type="email" name="email" placeholder="Email Address" value={registerInfo.email} onChange={handleChange} />
      <ShadcnInputField icon={Lock} type="password" name="password" placeholder="Password" value={registerInfo.password} isPassword={true} onChange={handleChange} />
      
      <Label className="block text-sm font-medium text-gray-300 mb-3">Choose Your Account Type</Label>
      <AccountTypeSelector selectedRole={registerInfo.role} onSelect={handleRoleChange} />
      
      <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-md h-12">
        {isSubmitting ? "Creating Your Account..." : "Create Account"}
      </Button>
    </form>

    <p className="text-center text-gray-400 text-sm mt-8">
      Already a member?
      <Button variant="link" onClick={onToggleForm} className="font-semibold text-purple-400 hover:text-purple-300 pl-2">
        Log In
      </Button>
    </p>
  </CardContent>
);
}


function OtpForm({ email, onToggleForm }) {
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const navigate = useNavigate();

       const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            return handleError("Please enter a valid 6-digit OTP.");
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ email, otp }),
            });
            const result = await response.json();

            if (response.ok) {
                handleSuccess("Email verified successfully! You can now log in.");
                setTimeout(() => {
                    onToggleForm(); // Switches back to the login view
                }, 2000);
            } else {
                handleError(result.message || "Invalid OTP or it has expired.");
            }
        } catch (err) {
            handleError("An unexpected error occurred: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    
    const handleResendOtp = async () => {
        if (isResending) return;
        setIsResending(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/resend-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ email }),
            });
            const result = await response.json();

            if (response.ok) {
                handleSuccess(result.message || "A new OTP has been sent to your email.");
            } else {
                handleError(result.message || "Failed to resend OTP. Please try again later.");
            }
        } catch (error) {
            handleError("An error occurred while resending the OTP.");
        } finally {
            setIsResending(false);
        }
    };

        return (
        <CardContent className="p-8 text-center">
            <CardHeader className="p-0 mb-6">
                <CardTitle className="text-3xl font-bold text-white">Verify Your Email</CardTitle>
                <CardDescription className="text-gray-400 pt-2">
                    An OTP has been sent to <span className="font-bold text-purple-400">{email}</span>.
                </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
                <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="E N T E R  O T P"
                    maxLength="6"
                    className="w-full text-center tracking-[0.5em] text-2xl bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-2 h-14 text-white placeholder-gray-500 focus-visible:ring-1 focus-visible:ring-purple-500"
                />
                <Button type="submit" disabled={isSubmitting} className="w-full py-3 mt-6 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-700 transition-all h-12 text-md">
                    {isSubmitting ? "Verifying..." : "Verify Account"}
                </Button>
            </form>
            <p className="text-center text-gray-500 text-sm mt-6">
                Didn't receive the code? 
                <Button variant="link" onClick={handleResendOtp} disabled={isResending} className="font-semibold text-purple-400 hover:text-purple-300 focus:outline-none p-1">
                    {isResending ? "Resending..." : "Resend"}
                </Button>
            </p>
        </CardContent>
    );
}


