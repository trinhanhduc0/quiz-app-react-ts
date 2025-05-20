import React from 'react';
import { useNavigate } from 'react-router-dom';
import ToggleButton from '~/components/toggleButton/ToggleButton';

interface TopbarProps {
  isOpen: boolean;
  isHidden: boolean;
  onClickRight: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onClickRight, isOpen, isHidden }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`
        fixed top-0 left-0 w-full z-50 
        flex justify-between items-center
        bg-gradient-to-b from-blue-400 to-gray-300
        shadow-md
        transform transition-all duration-500 ease-in-out
        ${isHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'}
        
        `}
    >
      <div className="flex  flex-[3]">
        <div
          onClick={() => navigate('/dashboard')}
          role="button"
          className="cursor-pointer transition-transform duration-200 hover:scale-105"
        >
          <img className="h-auto w-[150px] p-2" src="/logo.png" alt="Logo" />
        </div>
      </div>
      <div className="flex justify-end items-center flex-[1] relative">
        <ToggleButton onClickButton={onClickRight} />
      </div>
    </div>
  );
};

export default Topbar;
