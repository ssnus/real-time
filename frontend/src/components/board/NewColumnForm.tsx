import { useState } from 'react';
import { Plus } from 'lucide-react';

interface NewColumnFormProps {
  onAdd: (title: string) => Promise<void>;
}

export const NewColumnForm = ({ onAdd }: NewColumnFormProps) => {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd(title.trim());
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-80 shrink-0">
      <div className="glass rounded-2xl p-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Новая колонка..."
          aria-label="Название новой колонки"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
          Добавить колонку
        </button>
      </div>
    </form>
  );
};
