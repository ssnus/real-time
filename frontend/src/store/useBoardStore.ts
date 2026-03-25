import { toast } from 'react-toastify';
import { create } from 'zustand';
import { Board, getBoard, createColumn, createCard, moveCard } from '../api/boards';
import { getSocket } from '../api/socket';

interface BoardState {
    board: Board | null;
    loading: boolean;
    error: string | null;
    draggedCards: Record<string, string>;

    loadBoard: (boardId: string, silent?: boolean) => Promise<void>;
    addColumn: (boardId: string, title: string) => Promise<void>;
    addCard: (columnId: string, title: string, description?: string) => Promise<void>;
    moveCardLocally: (cardId: string, sourceColId: string, destColId: string, newIndex: number) => void;
    syncCardMovement: (cardId: string, destColId: string, newOrder: number) => Promise<void>;

    setDraggingCard: (boardId: string, cardId: string, userId: string) => void;
    clearDraggingCard: (boardId: string, cardId: string, userId: string) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
    board: null,
    loading: true,
    error: null,
    draggedCards: {},

    loadBoard: async (boardId: string, silent: boolean = false) => {
        if (!silent) set({ loading: true, error: null });
        try {
            const data = await getBoard(boardId);
            set({ board: data, loading: false });
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Ошибка загрузки доски';
            if (!silent) set({ error: msg, loading: false });
            else toast.error(msg);
        }
    },

    addColumn: async (boardId: string, title: string) => {
        const { board } = get();
        if (!board) return;

        try {
            const order = board.columns?.length || 0;
            const newColumn = await createColumn(boardId, title, order);

            set((state) => ({
                board: state.board ? {
                    ...state.board,
                    columns: [...(state.board.columns || []), { ...newColumn, cards: [] }],
                } : null
            }));
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Ошибка создания колонки';
            toast.error(msg);
        }
    },

    addCard: async (columnId: string, title: string, description?: string) => {
        const { board } = get();
        if (!board) return;

        try {
            const column = board.columns?.find((c) => c.id === columnId);
            const order = column?.cards?.length || 0;
            const newCard = await createCard(columnId, title, description || '', order);

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
            const msg = err.response?.data?.message || err.message || 'Ошибка создания карточки';
            toast.error(msg);
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

    syncCardMovement: async (cardId: string, destColId: string, newOrder: number) => {
        const socket = getSocket();

        try {
            if (socket && socket.connected) {
                await new Promise((resolve, reject) => {
                    socket.emit('moveCard', {
                        cardId,
                        newColumnId: destColId,
                        newOrder,
                    }, (response: { success: boolean; message?: string }) => {
                        if (response?.success) {
                            resolve(true);
                        } else {
                            reject(new Error(response?.message || 'Failed to sync via socket'));
                        }
                    });
                    setTimeout(resolve, 500);
                });
            } else {
                await moveCard(cardId, destColId, newOrder);
            }
        } catch (err) {
            console.error('Ошибка синхронизации карточки (rollback required):', err);
            const { board, loadBoard } = get();
            if (board) {
                await loadBoard(board.id);
            }
        }
    },

    setDraggingCard: (boardId: string, cardId: string, userId: string) => {
        const socket = getSocket();
        if (socket && socket.connected) {
            socket.emit('cardDragging', { boardId, cardId, userId });
        }
    },

    clearDraggingCard: (boardId: string, cardId: string, userId: string) => {
        const socket = getSocket();
        if (socket && socket.connected) {
            socket.emit('cardDragEnd', { boardId, cardId, userId });
        }
    },
}));
