import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBoardStore } from '../store/useBoardStore';
import { Column as ColumnComponent } from '../components/Column';
import { BoardHeader } from '../components/board/BoardHeader';
import { NewColumnForm } from '../components/board/NewColumnForm';
import { useBoardDnd } from '../hooks/useBoardDnd';
import { useBoardSocket } from '../hooks/useBoardSocket';

import {
    DndContext,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import { Card as CardComponent } from '../components/Card';

export const BoardPage = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const { token } = useAuth();
    const navigate = useNavigate();

    const {
        board,
        loading,
        error,
        loadBoard,
        addColumn,
    } = useBoardStore();

    const { activeCard, onDragStart, onDragOver, onDragEnd } = useBoardDnd(boardId, token);
    useBoardSocket(token, boardId);

    useEffect(() => {
        if (token && boardId) {
            loadBoard(boardId);
        }
    }, [token, boardId]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

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
            <BoardHeader title={board.title} />

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
                            />
                        ))}

                        <DragOverlay>
                            {activeCard ? <CardComponent card={activeCard} /> : null}
                        </DragOverlay>
                    </DndContext>

                    <NewColumnForm onAdd={(title) => addColumn(boardId!, title)} />
                </div>
            </main>
        </div>
    );
};