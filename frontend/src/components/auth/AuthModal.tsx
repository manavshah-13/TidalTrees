import React, { useState } from 'react';
import { X, Lock, User as UserIcon, Mail, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import type { User } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login } = useAuthStore();
  const [isLogin, setIsLogin] = useState<boolean>(defaultMode === 'login');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Username and password are required');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(isLogin ? 'Authenticating...' : 'Creating your account...');

    try {
      if (isLogin) {
        const res = await api.post<{ access_token: string }>('/api/auth/login', {
          username: username.trim(),
          password: password.trim(),
        });
        const token = res.data.access_token;
        localStorage.setItem('token', token);

        // Fetch current user details
        const meRes = await api.get<User>('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        login(token, meRes.data);
        toast.success(`Welcome back, ${meRes.data.username}!`, { id: toastId });
        onClose();
      } else {
        // Register
        await api.post('/api/auth/register', {
          username: username.trim(),
          password: password.trim(),
          email: email.trim() || null,
        });

        // Automatically log in
        const loginRes = await api.post<{ access_token: string }>('/api/auth/login', {
          username: username.trim(),
          password: password.trim(),
        });
        const token = loginRes.data.access_token;
        localStorage.setItem('token', token);

        const meRes = await api.get<User>('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        login(token, meRes.data);
        toast.success(`Account created! Welcome to TidalTrees, ${username}.`, {
          id: toastId,
        });
        onClose();
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (isLogin ? 'Invalid credentials' : 'Registration failed');
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container max-w-md">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <div className="icon-badge-emerald">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isLogin ? 'Guardian Sign In' : 'Join TidalTrees'}
            </h2>
          </div>
          <button onClick={onClose} className="close-button" aria-label="Close">
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-700/60 mx-6 mt-2">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              isLogin
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              !isLogin
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="input-label">Username</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                placeholder="mangrove_sentinel"
                className="styled-input pl-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="input-label">Email (Optional)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  placeholder="sentinel@coastal.org"
                  className="styled-input pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="input-label">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="styled-input pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3 font-semibold"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Portal' : 'Create Guardian Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
