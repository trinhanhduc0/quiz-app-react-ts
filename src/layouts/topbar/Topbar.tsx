import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import ToggleButton from '~/components/toggleButton/ToggleButton';

interface TopbarProps {
  isOpen: boolean;
  isHidden: boolean;
  onClickRight: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onClickRight, isOpen, isHidden }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <div
      className={`
    fixed top-0 left-0 w-full z-50 h-16
    backdrop-blur-xl bg-white/70
    border-b border-white/30
    shadow-sm
    transition-all duration-300
    ${isHidden ? '-translate-y-full' : 'translate-y-0'}
  `}
    >
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

        {/* Logo + Title */}
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img src="/logo.png" className="h-9" />
          {!isMobile && <div>
            <p className="text-sm font-semibold text-gray-800">Quiz Management</p>
            <p className="text-xs text-gray-500">Online Examination System</p>
          </div>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ToggleButton onClickButton={onClickRight} />
        </div>
      </div>
    </div>

  );
};

export default Topbar;
