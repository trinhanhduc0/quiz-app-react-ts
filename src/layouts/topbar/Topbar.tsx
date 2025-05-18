import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ToggleButton from '~/components/toggleButton/ToggleButton';
import './Topbar.scss';

interface TopbarProps {
  isOpen: boolean;
  onClickLeft: () => void;
  onClickRight: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onClickLeft, onClickRight, isOpen }) => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false); // Dự phòng nếu muốn dùng modal sau

  if (isOpen) return null;

  return (
    <div className="topbar bg-gradient-to-b from-blue-400 to-gray-300">
      <div className="left">
        <ToggleButton onClickButton={onClickLeft} />
      </div>
      <div className="center">
        <div className="logo" onClick={() => navigate('/dashboard')} role="button">
          <img className="h-[auto] w-[150px] p-2 " src="/logo.png" alt="" />
        </div>
      </div>
      <div className="right">
        <ToggleButton onClickButton={onClickRight} />
      </div>
    </div>
  );
};

export default Topbar;
