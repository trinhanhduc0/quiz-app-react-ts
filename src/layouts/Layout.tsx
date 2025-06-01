import React, { useState, useEffect, useRef, useCallback } from 'react';
import Topbar from './topbar/Topbar';
import Rightbar from './rightbar/Rightbar';
import { Outlet } from 'react-router-dom';
import { useTopbar } from '~/context/TopbarContext';
import './Layout.scss';

const Layout: React.FC = () => {
  const [isRightbarOpen, setRightbarOpen] = useState<boolean>(false);
  const prevScrollY = useRef<number>(0);

  const { isHidden, setIsHidden } = useTopbar();

  const toggleRightbar = useCallback(() => {
    setRightbarOpen(prev => !prev);
  }, [isRightbarOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isRightbarOpen) return;

      const currentScrollY = window.scrollY;
      const scrollDifference = 1;

      if (currentScrollY > prevScrollY.current + scrollDifference) {
        setIsHidden(true);
      } else if (currentScrollY < prevScrollY.current - scrollDifference) {
        setIsHidden(false);
      }

      if (currentScrollY === 0) {
        setIsHidden(false);
      }

      prevScrollY.current = currentScrollY;
    };

    const debounce = (func: () => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
      };
    };

    const debouncedHandleScroll = debounce(handleScroll, 100);

    window.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [setIsHidden]);

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar
        isOpen={isRightbarOpen}
        isHidden={isHidden || isRightbarOpen}
        onClickRight={toggleRightbar}
      />
      <Rightbar isOpen={isRightbarOpen} toggle={toggleRightbar} />
      <div style={{ marginTop: '9%' }} className="overflow-y-auto">
        <div className="max-w-7xl mx-auto ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
