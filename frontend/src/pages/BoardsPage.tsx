import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBoards, createBoard, Board } from '../api/boards';
import { toast } from 'react-toastify';

export const BoardsPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadBoards();
    }
  }, [token]);

  const loadBoards = async () => {
    try {
      const data = await getBoards(token!);
      setBoards(data);
    } catch (err: any) {
      toast.error(err.message || 'Ошибка загрузки досок');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !token) return;

    try {
      const newBoard = await createBoard(token, newBoardTitle);
      toast.success('Доска создана! 🎉');
      setBoards([newBoard, ...boards]);
      setNewBoardTitle('');
    } catch (err: any) {
      toast.error(err.message || 'Ошибка создания доски');
    }
  };

  const handleBoardClick = (boardId: string) => {
    navigate(`/boards/${boardId}`);
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <header className="flex justify-between items-center mb-8 glass rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white">Мои доски 👋</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 font-medium">{user?.name || user?.email}</span>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600"
          >
            Выйти
          </button>
        </div>
      </header>

      <form onSubmit={handleCreateBoard} className="mb-10 flex gap-4 max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Название новой доски..."
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          className="flex-1 glass text-white placeholder-slate-400 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newBoardTitle.trim()}
        >
          Создать
        </button>
      </form>

      {loading ? (
        <p className="text-center text-slate-400 mt-10 text-lg">Загрузка...</p>
      ) : boards.length === 0 ? (
        <p className="text-center text-slate-400 mt-10 text-lg">У вас пока нет досок. Создайте первую! 🚀</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className="glass-card rounded-xl p-6 cursor-pointer flex flex-col justify-between h-40"
              onClick={() => handleBoardClick(board.id)}
            >
              <h3 className="text-xl font-semibold text-white truncate">{board.title}</h3>
              <p className="text-slate-400 font-medium">
                {board.columns?.length || 0} колонок
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};