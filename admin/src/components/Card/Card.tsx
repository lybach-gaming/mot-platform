import React from 'react';

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, className = '', children }) => {
  return (
    <div className={`bg-white rounded-md shadow-sm flex flex-col ${className}`}>
      {title && (
        <div className="border-b border-gray-200 px-[25px] py-[5px]">
          <h2 className="text-[16px] leading-[28px] font-bold text-accent m-0">
            {title}
          </h2>
        </div>
      )}
      <div className="px-[25px] py-[15px]">
        {children}
      </div>
    </div>
  );
};
