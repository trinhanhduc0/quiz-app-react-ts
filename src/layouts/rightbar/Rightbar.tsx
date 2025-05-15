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
  const languageDropdownRef = useRef<HTMLDivElement | null>(null);

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

  const toggleLanguageDropdown = useCallback(() => {
    setLanguageDropdownOpen((prev) => !prev);
  }, []);

  const changeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng);
      setLanguageDropdownOpen(false);
    },
    [i18n],
  );

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      languageDropdownRef.current &&
      !languageDropdownRef.current.contains(event.target as Node)
    ) {
      setLanguageDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  const handleOk = () => {
    TokenService.removeToken();
    navigate('/login');
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-900 text-white transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 z-50 shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <Link to="/dashboard" className="text-2xl font-bold hover:text-blue-400 transition-colors">
          QUIZ APP
        </Link>
        <ToggleButton onClickButton={toggle} />
      </div>

      {/* Navigation */}
      <ul className="flex flex-col gap-2 p-4">
        {menuItems.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <Link
              to={to}
              onClick={toggle}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                location.pathname === to
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700 text-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}

        {/* Language Dropdown */}
        <li className="relative">
          <div
            onClick={toggleLanguageDropdown}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 text-gray-200 cursor-pointer transition-all duration-200"
          >
            <Languages className="w-5 h-5" />
            <span>Language</span>
          </div>

          {isLanguageDropdownOpen && (
            <div
              ref={languageDropdownRef}
              className="absolute left-4 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10 origin-top animate-dropdown"
            >
              {languageOptions.map(({ code, label }) => (
                <div
                  key={code}
                  onClick={() => changeLanguage(code)}
                  className="flex items-center gap-2 p-3 hover:bg-gray-700 text-gray-200 cursor-pointer transition-colors"
                >
                  {i18n.language === code && <Check className="w-4 h-4 text-green-400" />}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}
        </li>
      </ul>

      {/* Logout */}
      <div className="absolute bottom-4 left-4">
        <button
          onClick={showModal}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 text-gray-200 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('leftbar.logout')}</span>
        </button>
      </div>

      {/* Logout Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl animate-modal">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('leftbar.logout_confirm_title')}
            </h3>
            <p className="text-gray-600 mb-6">{t('leftbar.logout_comfirm')}</p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleOk}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
              >
                Yes
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rightbar;
