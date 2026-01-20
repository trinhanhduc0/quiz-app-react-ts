import React, { useState, FC, FormEvent, useEffect } from 'react';
import { auth, googleProvider } from '~/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import TokenService from '~/services/StorageService';
import API_ENDPOINTS from '~/config';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    TokenService.getToken() != null ? navigate("/dashboard") : ""
  })

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const signInWithGoogle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await fetch(API_ENDPOINTS.GOOGLE_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await response.json();
      await TokenService.save(data);

      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      alert(t('login.googleError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left - Branding */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-10">
          <img src="/logo.png" alt="Logo" className="h-16 mb-6" />
          <h2 className="text-2xl font-bold mb-2">Quiz Management System</h2>
          <p className="text-sm text-blue-100 text-center max-w-xs">
            Nền tảng quản lý lớp học và bài kiểm tra trực tuyến hiện đại
          </p>
        </div>

        {/* Right - Login Form */}
        <div className="p-8 md:p-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t('login.title')}
          </h1>
          {/* <p className="text-gray-500 text-sm mb-6">
            {t('login.subtitle')}
          </p> */}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition font-medium"
            >
              <LogIn className="w-4 h-4" />
              {t('login.loginButton')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-3 text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Login */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <img src="/google-logo.jpg" alt="Google" className="w-5 h-5" />
            <span className="text-sm font-medium">
              {loading ? t('login.loading') : t('login.googleLoginButton')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
