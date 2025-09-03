import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseClasses = `rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#55b7f3] focus:ring-offset-2 ${
    fullWidth ? 'w-full' : ''
  }`;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

const variantClasses = {
  primary: `bg-[#0d68ae] text-white hover:bg-[#0274be] shadow-sm`, 
  secondary: `bg-gray-200 text-black hover:bg-gray-300 shadow-sm`, 
  green:`bg-[#D6A41B] text-black hover:bg-[#b88917] shadow-sm`, 
  outline: `bg-[#9de37f] text-black hover:bg-[#caf880] shadow-sm`
};
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        loading ? 'opacity-70 cursor-not-allowed' : ''
      } ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;