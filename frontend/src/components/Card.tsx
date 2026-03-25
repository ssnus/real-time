import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '../api/boards';
import { useBoardStore } from '../store/useBoardStore';
import clsx from 'clsx';
import { GripVertical } from 'lucide-react';

interface CardProps {
  card: CardType;
}

export const Card = ({ card }: CardProps) => {
  const { draggedCards } = useBoardStore();
  const draggingUserId = draggedCards[card.id];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'card', card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      aria-label={`Карточка: ${card.title}`}
      className={clsx(
        "glass-card rounded-xl p-4 mb-3 group flex items-start gap-2 select-none relative",
        isDragging && "opacity-50 ring-2 ring-blue-500 z-50 scale-105",
        draggingUserId && !isDragging && "opacity-60 border-blue-400/50 scale-95 pointer-events-none transition-all duration-300"
      )}
    >
      {draggingUserId && !isDragging && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-10 animate-pulse">
          В процессе...
        </div>
      )}

      <div
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      >
        <GripVertical size={16} />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-slate-100 tracking-wide text-sm">{card.title}</h4>
        {card.description && (
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{card.description}</p>
        )}
      </div>
    </article>
  );
};