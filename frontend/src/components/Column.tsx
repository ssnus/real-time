import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card as CardComponent } from './Card';
import { Column as ColumnType } from '../api/boards';
import { useBoardStore } from '../store/useBoardStore';
import { Plus, X } from 'lucide-react';
import clsx from 'clsx';

interface ColumnProps {
  column: ColumnType;
  token: string;
}

export const Column = ({ column, token }: ColumnProps) => {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { addCard } = useBoardStore();

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', column },
  });

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    await addCard(token, column.id, newCardTitle.trim(), newCardDesc.trim());
    setNewCardTitle('');
    setNewCardDesc('');
    setIsAdding(false);
  };

  const cardIds = column.cards?.map((c) => c.id) || [];

  return (
    <div
      className="glass rounded-2xl p-4 flex flex-col w-80 shrink-0 max-h-[calc(100vh-120px)]"
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-lg text-slate-100 uppercase tracking-wider text-sm">{column.title}</h3>
        <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full font-medium">
          {column.cards?.length || 0}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          "flex-1 overflow-y-auto hide-scrollbar min-h-[150px] transition-colors duration-200 rounded-xl",
          isOver && "bg-slate-800/30"
        )}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="p-1">
            {column.cards?.map((card) => (
              <CardComponent key={card.id} card={card} />
            ))}
          </div>
        </SortableContext>
      </div>

      <div className="pt-3 mt-2 border-t border-slate-700/50">
        {isAdding ? (
          <form onSubmit={handleCreateCard} className="space-y-3">
            <input
              placeholder="Card title..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newCardDesc}
              onChange={(e) => setNewCardDesc(e.target.value)}
              rows={2}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="text-slate-400 hover:text-slate-200 p-1.5"
                onClick={() => setIsAdding(false)}
              >
                <X size={16} />
              </button>
              <button
                type="submit"
                disabled={!newCardTitle.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Add Card
              </button>
            </div>
          </form>
        ) : (
          <button
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 py-2 rounded-xl transition-all font-medium text-sm border border-transparent hover:border-white/10"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={16} /> Add a card
          </button>
        )}
      </div>
    </div>
  );
};