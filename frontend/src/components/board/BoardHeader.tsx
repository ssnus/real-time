import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface BoardHeaderProps {
  title: string;
}

export const BoardHeader = ({ title }: BoardHeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="glass sticky top-0 z-10 px-6 py-4 flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/boards')}
          type="button"
          aria-label="Вернуться к списку досок"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-300"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">{title}</h1>
      </div>

      <button
        onClick={handleLogout}
        type="button"
        aria-label="Выйти из системы"
        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors font-medium"
      >
        <LogOut size={16} />
        <span>Выйти</span>
      </button>
    </header>
  );
};
