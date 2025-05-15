import React, { useState, useEffect, FC, FormEvent } from 'react';
import { auth, googleProvider } from '~/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import './Login.scss';
import TokenService from '~/services/TokenService';
import API_ENDPOINTS from '~/config';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
const Login: FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleEmailLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in with email and password', error);
    }
  };
  const signInWithGoogle = async (): Promise<void> => {
    if (loading) return;
    setLoading(true);

    try {
      // Bắt đầu đăng nhập với popup Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      console.log('[Google SignIn] idToken:', idToken);

      // Gửi token đến server để xác thực
      const response = await fetch(API_ENDPOINTS.GOOGLE_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      console.log('[Google SignIn] API response status:', response.status);

      // Kiểm tra lỗi HTTP
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`[Google SignIn] Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[Google SignIn] Server response data:', data);

      if (!data.token) {
        throw new Error('[Google SignIn] Missing token in server response');
      }

      await TokenService.saveToken(data.token);

      // Điều hướng sau khi đăng nhập
      navigate('/dashboard');
      window.location.reload();
    } catch (error) {
      console.error('[Google SignIn] Error:', error);
      alert('Đăng nhập Google thất bại. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="space-y-4 w-full max-w-sm mx-auto" onSubmit={handleEmailLogin}>
        <input
          className="w-full border border-gray-300 rounded px-4 py-2"
          type="email"
          placeholder="Email"
        />
        <input
          className="w-full border border-gray-300 rounded px-4 py-2"
          type="password"
          placeholder="Password"
        />
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          type="submit"
        >
          Login
        </button>
      </form>

      <button className="google-btn btn-login" onClick={signInWithGoogle} disabled={loading}>
        <span className="icon-google" style={{ marginRight: '8px' }}>
          <Mail />
        </span>
        {loading ? t('login.loading') : t('login.googleLoginButton')}
      </button>
    </div>
  );
};

export default Login;
