import { useState } from 'react';
import { Plus, Layout } from 'lucide-react';

interface CreateBoardFormProps {
  onCreate: (title: string) => Promise<void>;
}

export const CreateBoardForm = ({ onCreate }: CreateBoardFormProps) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    try {
      await onCreate(title.trim());
      setTitle('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-12 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto relative z-20">
      <div className="flex-1 relative group">
        <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Название новой доски..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-900/40 border border-slate-700/50 rounded-2xl px-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 transition-all backdrop-blur-sm"
        />
      </div>
      <button
        type="submit"
        disabled={!title.trim() || loading}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
      >
        <Plus size={20} />
        {loading ? 'Создание...' : 'Создать доску'}
      </button>
    </form>
  );
};
