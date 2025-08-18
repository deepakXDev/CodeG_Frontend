import { useState, useRef } from "react";
import InputField, { UserIcon, MailIcon, LockIcon } from "./Inputfield";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import Hcaptchaa from "./hcaptchaa";

export default function Register({ onToggleForm }) {
  // const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaToken, setCaptchaToken] = useState('dummy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef(null);

  const [registerInfo, setRegisterInfo] = useState({
    name: "",
    // username: "",
    email: "",
    password: "",
    role: "User",
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setRegisterInfo({ ...registerInfo, [name]: value });
  };

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

    const { name, email, password, role } = registerInfo;
    if (!name || !email || !password || !role) {
      return handleError("Please fill all fields");
    }

    if (!captchaToken) {
      return handleError("Please complete the captcha verification");
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...registerInfo,
            captchaToken,
          }),
        }
      );
      const result = await response.json();
      console.log(result);
      if (response.ok) {
        const accountTypeMessage =
          registerInfo.role === "Problem_Setter"
            ? "Problem_Setter account created successfully! You can now create and manage coding problems."
            : "User account created successfully!";
        handleSuccess(accountTypeMessage);
        setTimeout(() => {
          onToggleForm();
        }, 2000);
      } else {
        handleError(result.message || "Registration failed");
        // Reset captcha on error
        setCaptchaToken(null);
        if (captchaRef.current) {
          captchaRef.current.resetCaptcha();
        }
      }
    } catch (err) {
      handleError("Registration failed. Try again. : " + err.message);
      // Reset captcha on error
      setCaptchaToken(null);
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-center mb-2 text-black">
        Create Account
      </h2>
      <p className="text-center text-gray-600 mb-8">Sign up to get started</p>

      <form onSubmit={handleSubmit}>
        <InputField
          icon={UserIcon}
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          autoFocus={true}
        />
        {/* <InputField
          icon={UserIcon}
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        /> */}
        <InputField
          icon={MailIcon}
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        {/* Added isPassword prop to enable the visibility toggle */}
        <InputField
          icon={LockIcon}
          type="password"
          name="password"
          placeholder="Password"
          isPassword={true}
          onChange={handleChange}
        />

        {/* Account Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-3">
            Account Type
          </label>
          <div className="space-y-3">
            <div
              className={`flex items-start p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                registerInfo.role === "User"
                  ? "border-black bg-gray-100"
                  : "border-gray-300 hover:border-gray-500"
              }`}
              onClick={() =>
                setRegisterInfo({ ...registerInfo, role: "User" })
              }
            >
              <input
                type="radio"
                id="user-type"
                name="role"
                value="User"
                checked={registerInfo.role === "User"}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-black focus:ring-gray-400 border-gray-400"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <label
                    htmlFor="user-type"
                    className="text-sm font-medium text-black cursor-pointer"
                  >
                    User
                  </label>
                  <span className="ml-2 px-2 py-1 text-xs bg-white text-black border border-black rounded-full">
                    Standard
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Solve problems, participate in contests, and track your
                  progress
                </p>
              </div>
            </div>

            <div
              className={`flex items-start p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                registerInfo.role === "Problem_Setter"
                  ? "border-black bg-gray-100"
                  : "border-gray-300 hover:border-gray-500"
              }`}
              onClick={() =>
                setRegisterInfo({ ...registerInfo, role: "Problem_Setter" })
              }
            >
              <input
                type="radio"
                id="problem_Setter-type"
                name="role"
                value="Problem_Setter"
                checked={registerInfo.role === "Problem_Setter"}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-black focus:ring-gray-400 border-gray-400"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <label
                    htmlFor="Problem_Setter-type"
                    className="text-sm font-medium text-black cursor-pointer"
                  >
                    Problem Setter
                  </label>
                  <span className="ml-2 px-2 py-1 text-xs bg-black text-white rounded-full">
                    Creator
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Create and manage coding problems, plus all user features
                </p>
                <div className="flex items-center mt-2 text-xs text-black">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Problem creation & management tools
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <Hcaptchaa
          ref={captchaRef}
          onVerify={handleCaptchaVerify}
          onExpire={handleCaptchaExpire}
          onError={handleCaptchaError}
        /> */}

        <button
          type="submit"
          // disabled={!captchaToken || isSubmitting}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg transition duration-300 transform shadow-lg hover:shadow-xl mt-4 font-bold ${
            captchaToken && !isSubmitting
              ? "bg-black hover:bg-gray-800 text-white hover:scale-105"
              : "bg-gray-400 text-gray-600 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-8">
        Already have an account?
        <button
          onClick={onToggleForm}
          className="font-semibold text-black hover:text-gray-700 ml-2 focus:outline-none border-b border-transparent hover:border-black transition duration-300"
        >
          Login
        </button>
      </p>
      <ToastContainer />
    </div>
  );
}
