import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBoardStore } from '../store/useBoardStore';
import { Column as ColumnComponent } from '../components/Column';
import { LogOut, ArrowLeft, Plus } from 'lucide-react';

import {
    DndContext,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import { Card as CardComponent } from '../components/Card';

export const BoardPage = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const {
        board,
        loading,
        error,
        loadBoard,
        addColumn,
        moveCardLocally,
        syncCardMovement,
        setupSocket,
        cleanupSocket
    } = useBoardStore();

    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [activeCard, setActiveCard] = useState<any | null>(null);

    useEffect(() => {
        if (token && boardId) {
            loadBoard(token, boardId);
            setupSocket(token, boardId);

            return () => {
                cleanupSocket();
            };
        }
    }, [token, boardId]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const handleCreateColumn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newColumnTitle.trim() || !token || !boardId) return;

        await addColumn(token, boardId, newColumnTitle.trim());
        setNewColumnTitle('');
    };

    const onDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const { data } = active;
        if (data.current?.type === 'card' && token && boardId) {
            const cardId = data.current.card.id;
            setActiveCard(data.current.card);

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                useBoardStore.getState().setDraggingCard(token, boardId, cardId, payload.sub);
            } catch (e) {
                console.error("Failed to decode token for drag start", e);
            }
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const isActiveCard = active.data.current?.type === 'card';
        const isOverCard = over.data.current?.type === 'card';
        const isOverColumn = over.data.current?.type === 'column';

        if (!isActiveCard) return;

        const activeColumnId = active.data.current?.card?.columnId;
        let overColumnId: string | undefined;

        if (isOverCard) {
            overColumnId = over.data.current?.card?.columnId;
        } else if (isOverColumn) {
            overColumnId = over.data.current?.column?.id;
        }

        if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
            return;
        }

        const overCards = board?.columns?.find(c => c.id === overColumnId)?.cards || [];
        const overIndex = isOverCard
            ? overCards.findIndex(c => c.id === overId)
            : overCards.length;


        const newIndex = overIndex >= 0 ? overIndex : overCards.length;
        moveCardLocally(activeId, activeColumnId, overColumnId, newIndex);

        if (active.data.current?.card) {
            active.data.current.card.columnId = overColumnId;
        }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        setActiveCard(null);
        const { active, over } = event;

        if (token && boardId && active.data.current?.type === 'card') {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                useBoardStore.getState().clearDraggingCard(token, boardId, active.id as string, payload.sub);
            } catch (e) {
                console.error("Failed to decode token for drag end", e);
            }
        }

        if (!over || !token) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeData = active.data.current;
        if (activeData?.type !== 'card') return;

        const sourceColId = activeData.card.columnId;

        let destColId = sourceColId;
        if (over.data.current?.type === 'column') {
            destColId = over.data.current.column.id;
        } else if (over.data.current?.type === 'card') {
            destColId = over.data.current.card.columnId;
        }

        const destCol = board?.columns?.find(c => c.id === destColId);
        if (!destCol) return;

        let newIndex = 0;
        const cards = destCol.cards || [];

        if (overId === destColId) {
            newIndex = cards.length;
        } else {
            const overIndex = cards.findIndex(c => c.id === overId);
            const activeIndex = cards.findIndex(c => c.id === activeId);

            if (activeIndex !== -1 && overIndex !== -1 && sourceColId === destColId) {
                newIndex = overIndex;
                if (activeIndex !== overIndex) {
                    moveCardLocally(activeId, sourceColId, destColId, newIndex);
                }
            } else {
                newIndex = overIndex !== -1 ? overIndex : cards.length;
            }
        }

        await syncCardMovement(token, activeId, destColId, newIndex);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !board) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <h2 className="text-2xl font-bold text-slate-300">Доска не найдена</h2>
                <p className="text-slate-500">{error}</p>
                <button onClick={() => navigate('/boards')} className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition">
                    Вернуться на главную
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="glass sticky top-0 z-10 px-6 py-4 flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/boards')}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-300"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-extrabold tracking-tight text-white">{board.title}</h1>
                </div>

                <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors font-medium"
                >
                    <LogOut size={16} />
                    <span>Выйти</span>
                </button>
            </header>

            <main className="flex-1 overflow-x-auto px-6 pb-6">
                <div className="flex items-start gap-6 h-full min-w-max">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDragEnd={onDragEnd}
                    >
                        {board.columns?.map((column) => (
                            <ColumnComponent
                                key={column.id}
                                column={column}
                                token={token!}
                            />
                        ))}

                        <DragOverlay>
                            {activeCard ? <CardComponent card={activeCard} /> : null}
                        </DragOverlay>
                    </DndContext>

                    <form onSubmit={handleCreateColumn} className="w-80 shrink-0">
                        <div className="glass rounded-2xl p-4 flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Новая колонка..."
                                value={newColumnTitle}
                                onChange={(e) => setNewColumnTitle(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                            />
                            <button
                                type="submit"
                                disabled={!newColumnTitle.trim()}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                <Plus size={18} />
                                Добавить колонку
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};