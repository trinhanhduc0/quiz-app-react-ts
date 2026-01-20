import React, { useEffect, useRef, useState, useCallback, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ToggleButton from '~/components/toggleButton/ToggleButton';
import TokenService from '~/services/StorageService';
import { LayoutDashboard, LogOut, BookMarked, FlaskConical, Languages, Check, User } from 'lucide-react';
import PermissionService from '~/services/PermissionService';
import StudentProfileModal from '~/components/user/UserComponent';


interface MenuItem {
  to: string;
  icon: any;
  label: string;
  permissions?: string[]; // nếu không có → ai cũng thấy
}


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
  const [isProfileOpen, setProfileOpen] = useState(false);
  const openProfileModal = () => setProfileOpen(true);
  const closeProfileModal = () => setProfileOpen(false);
  const menuItems: MenuItem[] = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: t('leftbar.dashboard'),
    },
    {
      to: '/manage-class',
      icon: BookMarked,
      label: t('leftbar.manageClass'),
      permissions: ['TEACHER', 'ADMIN'],
    },
    {
      to: '/manage-test',
      icon: FlaskConical,
      label: t('leftbar.manageTest'),
      permissions: ['TEACHER', 'ADMIN'],
    },
    {
      to: '/manage-question',
      icon: FlaskConical,
      label: t('leftbar.manageQuestions'),
      permissions: ['TEACHER', 'ADMIN'],
    },
    {
      to: '/manage-users',
      icon: FlaskConical,
      label: t('leftbar.manageUser'),
      permissions: ['ADMIN'],
    },

  ];

  const visibleMenuItems = menuItems.filter(item => {

    if (!item.permissions) return true;
    return PermissionService.hasAny(item.permissions);
  });


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
    closeProfileModal();
    TokenService.logout()
    setIsModalVisible(false);
    toggle()
    navigate('/login');
  };

  return (
    <div
      ref={rightbarRef}
      className={`fixed top-0 right-0 h-full w-64 bg-gray-100 text-gray-800 shadow-md transition-transform duration-300 ease-in-out z-50 rounded-l-lg border-l border-gray-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      style={{
        boxShadow: 'inset -5px 0 10px -5px rgba(0,0,0,0.1), 3px 0 10px -3px rgba(0,0,0,0.05)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {<StudentProfileModal
        open={isProfileOpen}
        onClose={closeProfileModal}
        onSuccess={() => {
          closeProfileModal();
        }}
      />}
      {/* Header */}
      <div className="flex justify-end px-4 ">
        {/* TOGGLE */}
        <ToggleButton onClickButton={toggle} />
      </div>

      {/* Menu Items */}
      <ul className="mt-4 px-3 space-y-1">
        {visibleMenuItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                onClick={toggle}
                className={`
    group flex items-center gap-3 px-4 py-3 rounded-xl
    transition-all duration-300
    ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-white/10 hover:text-black'
                  }
  `}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium tracking-wide">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            onClick={() => {
              openProfileModal();
              toggle(); // đóng rightbar khi mở modal
            }}
            className="
        group flex w-full items-center gap-3 px-4 py-3 rounded-xl
        text-gray-400 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500
        hover:text-white transition-all duration-300
      "
          >
            <User className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-sm font-medium tracking-wide">
              Hồ sơ cá nhân
            </span>
          </button>
        </li>
        {/* Language Dropdown */}
        <li className="relative mt-2">
          <div
            onClick={toggleLanguageDropdown}
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            <Languages className="w-5 h-5" />
            <span className="text-sm">{t('language')}</span>
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
                {t('no')}
              </button>
              <button
                onClick={handleOk}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rightbar;
