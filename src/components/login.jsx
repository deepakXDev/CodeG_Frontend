import { useState, useRef } from 'react';
import InputField, { MailIcon, LockIcon, UserIcon } from './Inputfield';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleError, handleSuccess } from '../utils';
// import Hcaptchaa from './hcaptchaa';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Login({ onToggleForm }) {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });
  const [captchaToken, setCaptchaToken] = useState('dummy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo({ ...loginInfo, [name]: value });
  }

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
  };

  const handleCaptchaError = (err) => {
    setCaptchaToken(null);
    handleError("Captcha verification failed. Please try again.");
  };

  
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        
        const { email, password } = loginInfo;
        if (!email || !password) {
            return handleError("Please fill in all fields.");
        }
        if (!captchaToken) {
            return handleError("Please complete the captcha verification.");
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...loginInfo, captchaToken }),
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                handleSuccess("Login successful!");
                login(result.user);
                setTimeout(() => navigate('/dashboard'), 1000);
            } else {
                handleError(result.message || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            handleError("A network error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   if (isSubmitting) return;
    
  //   const { email, password } = loginInfo;
  //   if(!email || !password) {
  //     return handleError("Please fill all fields");
  //   }

  //   if (!captchaToken) {
  //     return handleError("Please complete the captcha verification");
  //   }

  //   setIsSubmitting(true);

  //   try{
  //     const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       credentials: 'include',
  //       body: JSON.stringify({
  //         ...loginInfo,
  //         captchaToken
  //       })
  //     });
  //     const result = await response.json();
  //     console.log('Login response:', result);
      
  //     if (response.ok && result.success) {
  //       handleSuccess("Login successful!");
  //       login(result.user);
        
  //       setTimeout(() => {
  //         navigate('/dashboard');
  //       }, 1000);
  //     } else {
  //       const errorMessage = result.message || "Login failed";
  //       handleError(errorMessage);
  //       // Reset captcha on error
  //       setCaptchaToken(null);
  //       if (captchaRef.current) {
  //         captchaRef.current.resetCaptcha();
  //       }
  //     }
  //   } catch(err) {
  //     handleError("Network error. Please check your connection and try again.");
  //     console.log(err);
  //     // Reset captcha on error
  //     setCaptchaToken(null);
  //     if (captchaRef.current) {
  //       captchaRef.current.resetCaptcha();
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  return (
  <>
    <CardContent className="p-8">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="text-3xl font-bold text-white">Welcome Back to CodeG</CardTitle>
        <CardDescription className="text-gray-400 pt-2">
          Sign in to continue your progress and explore new challenges.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <ShadcnInputField 
          icon={Mail} 
          type="email" 
          name="email" 
          placeholder="Email Address" 
          value={loginInfo.email}
          onChange={handleChange} 
        />
        <ShadcnInputField 
          icon={Lock} 
          type="password" 
          name="password" 
          placeholder="Password" 
          isPassword={true} 
          value={loginInfo.password}
          onChange={handleChange} 
        />
        
        <div className="text-right mb-6">
          <Button variant="link" className="text-sm text-gray-400 h-auto p-0 hover:text-white">
            Forgot your password?
          </Button>
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-md h-12">
          {isSubmitting ? 'Signing You In...' : 'Sign In'}
        </Button>
      </form>

      <p className="text-center text-gray-400 text-sm mt-8">
        New to CodeG?
        <Button variant="link" onClick={onToggleForm} className="font-semibold text-purple-400 hover:text-purple-300 pl-2">
          Create Account
        </Button>
      </p>
    </CardContent>
      <ToastContainer theme="dark" position="bottom-right" /> {/* This container is what displays the toasts */}
  </>
);
};

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