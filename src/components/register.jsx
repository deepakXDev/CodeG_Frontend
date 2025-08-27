import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import { UserIcon, MailIcon, LockIcon, EyeOffIcon, EyeIcon } from "./Inputfield";
import Hcaptchaa from "./hcaptchaa";

//==============================================================================
// 1. HELPER COMPONENTS (Modular & Reusable)
//==============================================================================

// A generic input field for the forms
const InputField = ({ icon: Icon, type, name, placeholder, value, onChange, isPassword = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    const inputType = isPassword ? (isVisible ? 'text' : 'password') : type;

    return (
        <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icon className="w-5 h-5 text-gray-400" />
            </div>
            <input
                type={inputType}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
            {isPassword && (
                <button type="button" onClick={() => setIsVisible(!isVisible)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isVisible ? <EyeOffIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                </button>
            )}
        </div>
    );
};

// A selectable card for choosing account type
const AccountTypeCard = ({ role, label, description, selectedRole, onSelect }) => (
    <div
        className={`flex items-start p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
            selectedRole === role ? "border-purple-500 bg-[#2d2d2d]" : "border-gray-700 hover:border-gray-500"
        }`}
        onClick={() => onSelect(role)}
    >
        <input
            type="radio"
            name="role"
            value={role}
            checked={selectedRole === role}
            onChange={() => onSelect(role)}
            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 bg-gray-800"
        />
        <div className="ml-3 flex-1">
            <label className="text-sm font-medium text-white cursor-pointer">{label}</label>
            <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
    </div>
);

//==============================================================================
// 2. MAIN AUTHENTICATION FLOW COMPONENT
//==============================================================================

export default function RegisterFlow({ onToggleForm }) {
    const [view, setView] = useState('register'); // 'register' or 'otp'
    const [userEmail, setUserEmail] = useState('');

    const handleRegisterSuccess = (email) => {
        setUserEmail(email);
        setView('otp');
    };

    if (view === 'otp') {
        return <OtpForm email={userEmail} onToggleForm={onToggleForm} />;
    }

    return <RegisterForm onRegisterSuccess={handleRegisterSuccess} onToggleForm={onToggleForm} />;
}


//==============================================================================
// 3. REGISTER FORM COMPONENT
//==============================================================================

function RegisterForm({ onRegisterSuccess, onToggleForm }) {
    const [captchaToken, setCaptchaToken] = useState('dummy'); // Using dummy token as per original code
    const [isSubmitting, setIsSubmitting] = useState(false);
    const captchaRef = useRef(null);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const { name, email, password, role } = registerInfo;
        if (!name || !email || !password || !role) {
            return handleError("All fields are required.");
        }
        if (!captchaToken) {
            return handleError("Please complete the captcha verification.");
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registerInfo, captchaToken }),
            });
            const result = await response.json();

            if (response.ok) {
                handleSuccess("Registration successful! Please check your email for a verification code.");
                onRegisterSuccess(registerInfo.email); // Switch to OTP view
            } else {
                handleError(result.message || "Registration failed. Please try again.");
                // Reset captcha logic can be added here if needed
            }
        } catch (err) {
            handleError("An unexpected error occurred: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Join the Community</h2>
            <p className="text-center text-gray-400 mb-8">Create your account to start solving.</p>

            <form onSubmit={handleSubmit}>
                <InputField icon={UserIcon} type="text" name="name" placeholder="Full Name" onChange={handleChange} />
                <InputField icon={MailIcon} type="email" name="email" placeholder="Email Address" onChange={handleChange} />
                <InputField icon={LockIcon} type="password" name="password" placeholder="Password" isPassword={true} onChange={handleChange} />

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-3">Select Account Type</label>
                    <div className="space-y-3">
                        <AccountTypeCard role="User" label="Standard User" description="Solve problems, track progress, and compete." selectedRole={registerInfo.role} onSelect={(role) => setRegisterInfo(prev => ({ ...prev, role }))} />
                        <AccountTypeCard role="Problem_Setter" label="Problem Setter" description="Create and manage challenges for the community." selectedRole={registerInfo.role} onSelect={(role) => setRegisterInfo(prev => ({ ...prev, role }))} />
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full py-3 mt-4 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 disabled:bg-gray-600 transition-all duration-300 transform hover:scale-105">
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
            </form>

            <p className="text-center text-gray-400 mt-8">
                Already have an account?
                <button onClick={onToggleForm} className="font-semibold text-purple-400 hover:text-purple-300 ml-2 focus:outline-none">
                    Log In
                </button>
            </p>
            <ToastContainer />
        </div>
    );
}

//==============================================================================
// 4. OTP FORM COMPONENT
//==============================================================================

function OtpForm({ email, onToggleForm }) {
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6 || isSubmitting) {
            return handleError("Please enter a valid 6-digit OTP.");
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const result = await response.json();

            if (response.ok) {
                handleSuccess("Email verified successfully! You can now log in.");
                setTimeout(() => onToggleForm(), 2000); // Switch to login form
            } else {
                handleError(result.message || "Invalid OTP or it has expired.");
            }
        } catch (err) {
            handleError("An unexpected error occurred: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-gray-400 mb-8">
                An OTP has been sent to <span className="font-bold text-purple-400">{email}</span>.
            </p>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    className="w-full text-center tracking-[1em] text-2xl bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 text-white placeholder-gray-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
                <button type="submit" disabled={isSubmitting} className="w-full py-3 mt-6 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 disabled:bg-gray-600 transition-all">
                    {isSubmitting ? "Verifying..." : "Verify Account"}
                </button>
            </form>
            <p className="text-center text-gray-500 text-sm mt-6">
                Didn't receive the code? <button className="font-semibold text-purple-400 hover:text-purple-300 focus:outline-none">Resend</button>
            </p>
        </div>
    );
}


// --- Placeholder Icons (replace with your actual icon components) ---
// const UserIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
// const MailIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
// const LockIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
// const EyeIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
// const EyeOffIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .946-3.11 3.564-5.44 6.83-6.16M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 2l20 20" /></svg>;
