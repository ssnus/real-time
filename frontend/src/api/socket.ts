import { io, Socket } from 'socket.io-client';
import { API_URL } from './index';

let socket: Socket | null = null;

export const connectSocket = (token: string, boardId: string) => {
  if (socket) socket.disconnect();
  
  socket = io(`${API_URL}/board`, {
    transports: ['websocket'],
    auth: { token },
  });

  socket.emit('joinBoard', { boardId });
  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};