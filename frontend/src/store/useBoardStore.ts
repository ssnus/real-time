import { create } from 'zustand';
import { Board, getBoard, createColumn, createCard, moveCard } from '../api/boards';
import { connectSocket, disconnectSocket, getSocket } from '../api/socket';

interface BoardState {
    board: Board | null;
    loading: boolean;
    error: string | null;
    socket: ReturnType<typeof connectSocket> | null;
    draggedCards: Record<string, string>;

    loadBoard: (token: string, boardId: string) => Promise<void>;
    addColumn: (token: string, boardId: string, title: string) => Promise<void>;
    addCard: (token: string, columnId: string, title: string, description?: string) => Promise<void>;
    moveCardLocally: (cardId: string, sourceColId: string, destColId: string, newIndex: number) => void;
    syncCardMovement: (token: string, cardId: string, destColId: string, newOrder: number) => Promise<void>;

    setDraggingCard: (token: string, boardId: string, cardId: string, userId: string) => void;
    clearDraggingCard: (token: string, boardId: string, cardId: string, userId: string) => void;

    setupSocket: (token: string, boardId: string) => void;
    cleanupSocket: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
    board: null,
    loading: true,
    error: null,
    socket: null,
    draggedCards: {},

    loadBoard: async (token: string, boardId: string) => {
        set({ loading: true, error: null });
        try {
            const data = await getBoard(token, boardId);
            set({ board: data, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Ошибка загрузки доски', loading: false });
        }
    },

    addColumn: async (token: string, boardId: string, title: string) => {
        const { board } = get();
        if (!board) return;

        try {
            const order = board.columns?.length || 0;
            const newColumn = await createColumn(token, boardId, title, order);

            set((state) => ({
                board: state.board ? {
                    ...state.board,
                    columns: [...(state.board.columns || []), { ...newColumn, cards: [] }],
                } : null
            }));
        } catch (err: any) {
            console.error('Ошибка создания колонки:', err);
        }
    },

    addCard: async (token: string, columnId: string, title: string, description?: string) => {
        const { board } = get();
        if (!board) return;

        try {
            const column = board.columns?.find((c) => c.id === columnId);
            const order = column?.cards?.length || 0;
            const newCard = await createCard(token, columnId, title, description || '', order);

            set((state) => {
                if (!state.board) return state;
                return {
                    board: {
                        ...state.board,
                        columns: state.board.columns?.map(col => {
                            if (col.id === columnId) {
                                return { ...col, cards: [...(col.cards || []), newCard] };
                            }
                            return col;
                        })
                    }
                };
            });
        } catch (err: any) {
            console.error('Ошибка создания карточки:', err);
        }
    },

    moveCardLocally: (cardId: string, sourceColId: string, destColId: string, newIndex: number) => {
        set((state) => {
            if (!state.board || !state.board.columns) return state;

            const columns = [...state.board.columns];
            const sourceColIdx = columns.findIndex(c => c.id === sourceColId);
            const destColIdx = columns.findIndex(c => c.id === destColId);

            if (sourceColIdx === -1 || destColIdx === -1) return state;

            const sourceCards = [...(columns[sourceColIdx].cards || [])];
            const cardIdx = sourceCards.findIndex(c => c.id === cardId);

            if (cardIdx === -1) return state;

            const [cardToMove] = sourceCards.splice(cardIdx, 1);
            columns[sourceColIdx] = { ...columns[sourceColIdx], cards: sourceCards };

            const destCards = sourceColId === destColId ? sourceCards : [...(columns[destColIdx].cards || [])];
            destCards.splice(newIndex, 0, cardToMove);
            columns[destColIdx] = { ...columns[destColIdx], cards: destCards };

            return { board: { ...state.board, columns } };
        });
    },

    syncCardMovement: async (token: string, cardId: string, destColId: string, newOrder: number) => {
        const socket = getSocket();

        try {
            if (socket && socket.connected) {
                await new Promise((resolve, reject) => {
                    socket.emit('moveCard', {
                        token,
                        cardId,
                        newColumnId: destColId,
                        newOrder,
                    }, (response: any) => {
                        if (response?.success) {
                            resolve(true);
                        } else {
                            reject(new Error(response?.message || 'Failed to sync via socket'));
                        }
                    });
                    setTimeout(resolve, 500);
                });
            } else {
                await moveCard(token, cardId, destColId, newOrder);
            }
        } catch (err) {
            console.error('Ошибка синхронизации карточки (rollback required):', err);
            const { board, loadBoard } = get();
            if (board) {
                await loadBoard(token, board.id);
            }
        }
    },

    setDraggingCard: (token: string, boardId: string, cardId: string, userId: string) => {
        const socket = getSocket();
        if (socket && socket.connected) {
            socket.emit('cardDragging', { token, boardId, cardId, userId });
        }
    },

    clearDraggingCard: (token: string, boardId: string, cardId: string, userId: string) => {
        const socket = getSocket();
        if (socket && socket.connected) {
            socket.emit('cardDragEnd', { token, boardId, cardId, userId });
        }
    },

    setupSocket: (token: string, boardId: string) => {
        const currentSocket = get().socket;
        if (currentSocket) return;

        const socket = connectSocket(token, boardId);

        socket.on('cardMoved', () => {
            get().loadBoard(token, boardId);
        });

        socket.on('cardUpdated', () => {
            get().loadBoard(token, boardId);
        });

        socket.on('userDraggingCard', ({ cardId, userId }: { cardId: string, userId: string }) => {
            set((state) => ({
                draggedCards: { ...state.draggedCards, [cardId]: userId }
            }));
        });

        socket.on('userStoppedDragging', ({ cardId }: { cardId: string }) => {
            set((state) => {
                const newDragged = { ...state.draggedCards };
                delete newDragged[cardId];
                return { draggedCards: newDragged };
            });
        });

        socket.on('columnCreated', () => {
            get().loadBoard(token, boardId);
        });

        socket.on('cardCreated', () => {
            get().loadBoard(token, boardId);
        });

        socket.on('columnDeleted', () => {
            get().loadBoard(token, boardId);
        });

        socket.on('cardDeleted', () => {
            get().loadBoard(token, boardId);
        });

        set({ socket });
    },

    cleanupSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.off('cardMoved');
            socket.off('cardUpdated');
            socket.off('userDraggingCard');
            socket.off('userStoppedDragging');
            socket.off('columnCreated');
            socket.off('cardCreated');
            socket.off('columnDeleted');
            socket.off('cardDeleted');
            disconnectSocket();
            set({ socket: null, draggedCards: {} });
        }
    }
}));
