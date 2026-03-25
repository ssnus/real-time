import { useState } from 'react';
import { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { useBoardStore } from '../store/useBoardStore';
import { Card } from '../api/boards';

export const useBoardDnd = (boardId: string | undefined, token: string | null) => {
    const { board, moveCardLocally, syncCardMovement } = useBoardStore();
    const [activeCard, setActiveCard] = useState<Card | null>(null);

    const onDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const { data } = active;
        if (data.current?.type === 'card' && boardId && token) {
            const cardId = data.current.card.id;
            setActiveCard(data.current.card);

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                useBoardStore.getState().setDraggingCard(boardId, cardId, payload.sub);
            } catch (e) {
                console.error("Failed to decode token for drag start", e);
            }
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || !board) return;

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

        const overCards = board.columns?.find(c => c.id === overColumnId)?.cards || [];
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

        if (boardId && token && active.data.current?.type === 'card') {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                useBoardStore.getState().clearDraggingCard(boardId, active.id as string, payload.sub);
            } catch (e) {
                console.error("Failed to decode token for drag end", e);
            }
        }

        if (!over || !board) return;

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

        const destCol = board.columns?.find(c => c.id === destColId);
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

        await syncCardMovement(activeId, destColId, newIndex);
    };

    return {
        activeCard,
        onDragStart,
        onDragOver,
        onDragEnd
    };
};
