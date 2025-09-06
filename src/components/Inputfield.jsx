import React, { useState } from "react";

import { UserIcon as HeroUserIcon } from "@heroicons/react/24/solid";
import { EnvelopeIcon as HeroEnvelopeIcon } from "@heroicons/react/24/solid";
import { LockClosedIcon as HeroLockIcon } from "@heroicons/react/24/solid";
import { EyeIcon as HeroEyeIcon } from "@heroicons/react/24/solid";
import { EyeSlashIcon as HeroEyeOffIcon } from "@heroicons/react/24/solid";

export const UserIcon = (props) => (
  <HeroUserIcon className={`h-5 w-5 text-black ${props.className || ""}`} />
);

export const MailIcon = (props) => (
  <HeroEnvelopeIcon className={`h-5 w-5 text-black ${props.className || ""}`} />
);

export const LockIcon = (props) => (
  <HeroLockIcon className={`h-5 w-5 text-black ${props.className || ""}`} />
);

export const EyeIcon = (props) => (
  <HeroEyeIcon className={`h-5 w-5 text-black ${props.className || ""}`} />
);

export const EyeOffIcon = (props) => (
  <HeroEyeOffIcon className={`h-5 w-5 text-black ${props.className || ""}`} />
);

function InputField({
  label,
  type,
  placeholder,
  value,
  onChange,
  name,
  icon: Icon,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon />
          </div>
        )}
        <input
          type={isPasswordField && showPassword ? "text" : type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full py-2 px-3 ${Icon ? "pl-10" : ""} ${
            isPasswordField ? "pr-10" : ""
          } bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black`}
        />
        {isPasswordField && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InputField;
