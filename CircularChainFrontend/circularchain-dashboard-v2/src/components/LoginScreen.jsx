import React from 'react';

const Button = ({ children, className, ...props }) => (
  <button className={className} {...props}>
    {children}
  </button>
);

export default function LoginScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-8">
      {/* Rest of your existing code */}
      <Button
        className="w-full h-12 bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 text-gray-700 font-medium rounded-lg"
      >
        {/* Google Logo SVG */}
        Sign in with Google
      </Button>
    </div>
  );
}