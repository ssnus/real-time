import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../api/socket';
import { useBoardStore } from '../store/useBoardStore';

/**
 * Manages the WebSocket connection lifecycle for a board.
 * Separated from useBoardStore so the store only handles state.
 */
export const useBoardSocket = (token: string | null, boardId: string | undefined) => {
    const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);
    const { loadBoard } = useBoardStore();

    useEffect(() => {
        if (!token || !boardId) return;

        const socket = connectSocket(token, boardId);
        socketRef.current = socket;


        socket.on('columnCreated', () => loadBoard(boardId, true));
        socket.on('columnDeleted', () => loadBoard(boardId, true));
        socket.on('cardCreated', () => loadBoard(boardId, true));
        socket.on('cardDeleted', () => loadBoard(boardId, true));
        socket.on('cardMoved', () => loadBoard(boardId, true));
        socket.on('cardUpdated', () => loadBoard(boardId, true));


        socket.on('userDraggingCard', ({ cardId, userId }: { cardId: string; userId: string }) => {
            useBoardStore.setState((state) => ({
                draggedCards: { ...state.draggedCards, [cardId]: userId },
            }));
        });

        socket.on('userStoppedDragging', ({ cardId }: { cardId: string }) => {
            useBoardStore.setState((state) => {
                const next = { ...state.draggedCards };
                delete next[cardId];
                return { draggedCards: next };
            });
        });

        return () => {
            socket.off('columnCreated');
            socket.off('columnDeleted');
            socket.off('cardCreated');
            socket.off('cardDeleted');
            socket.off('cardMoved');
            socket.off('cardUpdated');
            socket.off('userDraggingCard');
            socket.off('userStoppedDragging');
            disconnectSocket();
            socketRef.current = null;
        };
    }, [token, boardId]);

    return socketRef;
};
