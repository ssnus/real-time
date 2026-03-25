import api from './index';

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  columns?: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  boardId: string;
  cards?: Card[];
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
  columnId: string;
  createdAt: string;
  updatedAt: string;
}

export const getBoards = async (): Promise<Board[]> => {
  const res = await api.get('/boards');
  return res.data;
};

export const createBoard = async (title: string): Promise<Board> => {
  const res = await api.post('/boards', { title });
  return res.data;
};

export const getBoard = async (boardId: string): Promise<Board> => {
  const res = await api.get(`/boards/${boardId}`);
  return res.data;
};

export const createColumn = async (
  boardId: string,
  title: string,
  order: number
): Promise<Column> => {
  const res = await api.post(`/boards/${boardId}/columns`, { title, order });
  return res.data;
};

export const createCard = async (
  columnId: string,
  title: string,
  description: string,
  order: number
): Promise<Card> => {
  const res = await api.post(`/columns/${columnId}/cards`, { title, description, order });
  return res.data;
};

export const moveCard = async (
  cardId: string,
  newColumnId: string,
  newOrder: number
): Promise<Card> => {
  const res = await api.patch(`/columns/${cardId}/move`, { newColumnId, newOrder });
  return res.data;
};