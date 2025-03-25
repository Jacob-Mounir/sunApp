import React from 'react';

export const SunIcon: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="#f59e0b" 
      className={className}
    >
      <circle cx="12" cy="12" r="5" fill="#f59e0b" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};