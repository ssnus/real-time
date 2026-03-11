import { API_URL, getAuthHeaders } from './auth';

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

export const getBoards = async (token: string): Promise<Board[]> => {
  const res = await fetch(`${API_URL}/boards`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch boards');
  return res.json();
};

export const createBoard = async (token: string, title: string): Promise<Board> => {
  const res = await fetch(`${API_URL}/boards`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create board');
  return res.json();
};

export const getBoard = async (token: string, boardId: string): Promise<Board> => {
  const res = await fetch(`${API_URL}/boards/${boardId}`, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ API error response:', errorText);
    throw new Error(`Server error: ${res.status}`);
  }

  const data = await res.json();

  return data;
};

export const createColumn = async (
  token: string,
  boardId: string,
  title: string,
  order: number
): Promise<Column> => {
  const res = await fetch(`${API_URL}/boards/${boardId}/columns`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ title, order }),
  });
  if (!res.ok) throw new Error('Failed to create column');
  return res.json();
};

export const createCard = async (
  token: string,
  columnId: string,
  title: string,
  description: string,
  order: number
): Promise<Card> => {
  const res = await fetch(`${API_URL}/columns/${columnId}/cards`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ title, description, order }),
  });
  if (!res.ok) throw new Error('Failed to create card');
  return res.json();
};

export const moveCard = async (
  token: string,
  cardId: string,
  newColumnId: string,
  newOrder: number
): Promise<Card> => {
  const res = await fetch(`${API_URL}/columns/${newColumnId}/cards/${cardId}/move`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ newColumnId, newOrder }),
  });
  if (!res.ok) throw new Error('Failed to move card');
  return res.json();
};