import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus } from 'lucide-react';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    const success = isRegister
      ? await register(email, password, name)
      : await login(email, password);
    if (success) navigate('/boards');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full glass rounded-3xl p-8 shadow-2xl overflow-hidden relative border border-white/20">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 text-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            {isRegister ? <UserPlus className="text-blue-400" size={32} /> : <LogIn className="text-blue-400" size={32} />}
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isRegister ? 'Создать аккаунт' : 'С возвращением!'}
          </h2>
          <p className="text-slate-400 mt-2">
            {isRegister ? 'Заполните данные для регистрации' : 'Введите свои данные для входа'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {isRegister && (
            <div className="relative group">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 transition-all backdrop-blur-sm"
              />
            </div>
          )}
          
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="email"
              placeholder="Email адрес"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 transition-all backdrop-blur-sm"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 transition-all backdrop-blur-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : (isRegister ? 'Зарегистрироваться' : 'Войти')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm relative z-10">
          <button
            type="button"
            className="text-slate-400 hover:text-white transition-colors underline decoration-slate-600 underline-offset-4"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </div>
      </div>
    </div>
  );
};