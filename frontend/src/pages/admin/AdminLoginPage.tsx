import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { ApiResponse, User as UserType } from '../../types';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.post<ApiResponse<{
        accessToken: string;
        userId: number;
        username: string;
        email: string;
        fullName: string;
        roles: string[];
        permissions: string[];
      }>>('/auth/login', { username, password });

      const authData = res.data.data;
      const isAdminOrManager = authData.roles?.some(
        (r) => r === 'ROLE_ADMIN' || r === 'ROLE_MANAGER'
      );

      if (!isAdminOrManager) {
        setErrorMessage('Tài khoản của bạn không có quyền truy cập vào Cổng Quản Trị.');
        return;
      }

      const userObj: UserType = {
        id: authData.userId,
        username: authData.username,
        email: authData.email,
        fullName: authData.fullName,
        roles: authData.roles,
        permissions: authData.permissions,
      };

      setAuth(authData.accessToken, userObj);
      navigate('/admin');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMessage(err.response?.data?.message || 'Tài khoản hoặc mật khẩu quản trị không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />

      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/60 shadow-2xl space-y-6 relative z-10 text-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Cổng Quản Trị Hệ Thống
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Khu vực hạn chế, chỉ dành cho Quản trị viên và Nhân sự điều hành
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Tên tài khoản quản trị</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên tài khoản..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Mật khẩu bảo mật</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-3"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-700/60 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Trở về Cửa hàng
          </a>
        </div>
      </div>
    </div>
  );
};
