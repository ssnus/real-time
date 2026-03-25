import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBoards, createBoard, Board } from '../api/boards';
import { toast } from 'react-toastify';
import { CreateBoardForm } from '../components/board/CreateBoardForm';
import { LogOut, Layout, Clock, Hash, Plus } from 'lucide-react';

export const BoardsPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadBoards();
    }
  }, [token]);

  const loadBoards = async () => {
    try {
      const data = await getBoards();
      setBoards(data);
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message;
      const formattedMessage = Array.isArray(message) ? message.join(', ') : message || (err as any)?.message || 'Ошибка загрузки досок';
      toast.error(formattedMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (title: string) => {
    try {
      const newBoard = await createBoard(title);
      toast.success('Доска создана! 🎉');
      setBoards([newBoard, ...boards]);
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message;
      const formattedMessage = Array.isArray(message) ? message.join(', ') : message || (err as any)?.message || 'Ошибка создания доски';
      toast.error(formattedMessage);
      throw err; // Пробрасываем ошибку в форму, чтобы она прекратила loading
    }
  };

  const handleBoardClick = (boardId: string) => {
    navigate(`/boards/${boardId}`);
  };

  return (
    <div className="container mx-auto p-4 sm:p-8 min-h-screen">
      {/* Декоративные фоновые элементы */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <header className="flex flex-col sm:flex-row justify-between items-center mb-12 glass rounded-3xl p-6 border border-white/10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Layout className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Рабочие пространства</h1>
            <p className="text-slate-400 text-sm">Всего досок: {boards.length}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-white font-semibold">{user?.name || user?.email}</p>
            <p className="text-slate-400 text-xs truncate max-w-[150px]">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700 hover:border-slate-600 group active:scale-95"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
            <span>Выйти</span>
          </button>
        </div>
      </header>

      <CreateBoardForm onCreate={handleCreateBoard} />

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">Загрузка ваших досок...</p>
        </div>
      ) : boards.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border border-white/5 mt-10">
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Hash className="text-slate-600" size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Здесь пока пусто</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-8">
            У вас еще нет ни одной канбан-доски. Введите название выше и создайте свою первую доску, чтобы начать работу!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boards.map((board) => (
            <div
              key={board.id}
              className="glass hover:bg-white/5 rounded-3xl p-8 cursor-pointer transition-all border border-white/5 hover:border-white/20 group relative overflow-hidden flex flex-col justify-between h-56 shadow-xl"
              onClick={() => handleBoardClick(board.id)}
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <Plus size={16} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">
                  {board.title}
                </h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Clock size={14} />
                  <span>Создана {new Date(board.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </div>
                <span className="text-slate-500 font-medium text-sm bg-slate-900/40 px-3 py-1 rounded-full border border-slate-800">
                  {board.columns?.length || 0} колонок
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};