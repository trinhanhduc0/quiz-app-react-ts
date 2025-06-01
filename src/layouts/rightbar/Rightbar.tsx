import React, { useEffect, useRef, useState, useCallback, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ToggleButton from '~/components/toggleButton/ToggleButton';
import TokenService from '~/services/TokenService';
import { LayoutDashboard, LogOut, BookMarked, FlaskConical, Languages, Check } from 'lucide-react';

interface RightBarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Rightbar: FC<RightBarProps> = ({ isOpen, toggle }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLanguageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const rightbarRef = useRef<HTMLDivElement | null>(null);

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('leftbar.dashboard') },
    { to: '/manage-class', icon: BookMarked, label: t('leftbar.manageClass') },
    { to: '/manage-test', icon: FlaskConical, label: t('leftbar.manageTest') },
    { to: '/manage-question', icon: FlaskConical, label: t('leftbar.manageQuestions') },
  ];

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'vi', label: 'Tiếng Việt' },
  ];

  const toggleLanguageDropdown = () => setLanguageDropdownOpen((prev) => !prev);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguageDropdownOpen(false);
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      console.log(isOpen)
      if (isOpen && rightbarRef.current && !rightbarRef.current.contains(event.target as Node)) {
          toggle(); // Chỉ toggle khi click ra ngoài Rightbar

      }
    },
    [toggle],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  const handleOk = () => {
    navigate('/login');
  };

  return (
    <div
      ref={rightbarRef}
      className={`fixed top-0 right-0 h-full w-64 bg-gray-100 text-gray-800 shadow-md transition-transform duration-300 ease-in-out z-50 rounded-l-lg border-l border-gray-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        boxShadow: 'inset -5px 0 10px -5px rgba(0,0,0,0.1), 3px 0 10px -3px rgba(0,0,0,0.05)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      
      {/* Header */}
      <div className="flex justify-end px-4 ">
        {/* TOGGLE */}
        <ToggleButton onClickButton={toggle} /> 
      </div>

      {/* Menu Items */}
      <ul className="mt-4 px-3 space-y-1">
        {menuItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                onClick={toggle}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'text-blue-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            </li>
          );
        })}

        {/* Language Dropdown */}
        <li className="relative mt-2">
          <div
            onClick={toggleLanguageDropdown}
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            <Languages className="w-5 h-5" />
            <span className="text-sm">Language</span>
          </div>

          {isLanguageDropdownOpen && (
            <div className="absolute left-4 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-20 overflow-hidden border border-gray-700">
              {languageOptions.map(({ code, label }) => (
                <div
                  key={code}
                  onClick={() => changeLanguage(code)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200"
                >
                  {i18n.language === code && <Check className="w-4 h-4 text-green-400" />}
                  {label}
                </div>
              ))}
            </div>
          )}
        </li>
      </ul>

      {/* Logout Button */}
      <div className="absolute bottom-6 left-4 w-[calc(100%-2rem)]">
        <button
          onClick={showModal}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">{t('leftbar.logout')}</span>
        </button>
      </div>

      {/* Logout Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('leftbar.logout_confirm_title')}
            </h3>
            <p className="text-gray-600 mb-6">{t('leftbar.logout_comfirm')}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                {t('No') || 'No'}
              </button>
              <button
                onClick={handleOk}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('Yes') || 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rightbar;
