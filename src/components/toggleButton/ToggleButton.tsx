import React from 'react';
import './ToggleButton.scss';

interface ToggleButtonProps {
  onClickButton: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ onClickButton }) => {
  return (
    <div className="button-navigate">
      <button className="toggle-btn" onClick={onClickButton}>
        <span className="middle-bar"></span>
      </button>
    </div>
  );
};

export default ToggleButton;
