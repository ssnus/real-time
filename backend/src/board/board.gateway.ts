import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AccessControlService } from '../access/access-control.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080'],
    credentials: true,
  },
  namespace: 'board',
})
export class BoardGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('BoardGateway');

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private accessControl: AccessControlService,
  ) { }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      
      if (!token) {
        this.logger.error(`No token provided for client: ${client.id}`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.user = payload;
      this.logger.log(`Client connected: ${client.id}, User: ${payload.sub}`);
    } catch (error) {
      this.logger.error(`Connection error for ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinBoard')
  async handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { boardId: string }
  ) {
    try {
      const user = client.data.user;
      await this.accessControl.validateBoardAccess(user.sub, body.boardId);

      client.join(`board_${body.boardId}`);
      this.logger.log(`Client ${client.id} joined room: board_${body.boardId}`);

      client.emit('joined', { boardId: body.boardId });
      return { success: true };
    } catch (error) {
      this.logger.error('Join board error:', error);
      client.emit('error', { message: 'Failed to join board' });
      return { success: false };
    }
  }

  @SubscribeMessage('moveCard')
  async handleMoveCard(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: {
      cardId: string;
      newColumnId: string;
      newOrder: number;
    }
  ) {
    try {
      const user = client.data.user;

      // Используем централизованный сервис для проверки доступа
      const card = await this.accessControl.validateCardAccess(user.sub, body.cardId);
      const newColumn = await this.accessControl.validateColumnAccess(user.sub, body.newColumnId);

      if (card.column.boardId !== newColumn.boardId) {
        throw new Error('Cannot move card to another board');
      }

      const updatedCard = await this.prisma.card.update({
        where: { id: body.cardId },
        data: {
          columnId: body.newColumnId,
          order: body.newOrder,
        },
      });

      this.server.to(`board_${card.column.boardId}`).emit('cardMoved', {
        card: updatedCard,
        movedBy: user.sub,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Card ${body.cardId} moved by user ${user.sub}`);
      return { success: true, card: updatedCard };
    } catch (error) {
      this.logger.error('Move card error:', error.message);
      client.emit('error', { message: error.message || 'Failed to move card' });
      return { success: false };
    }
  }

  @SubscribeMessage('updateCard')
  async handleUpdateCard(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: {
      cardId: string;
      title?: string;
      description?: string;
    }
  ) {
    try {
      const user = client.data.user;
      const card = await this.accessControl.validateCardAccess(user.sub, body.cardId);

      const updatedCard = await this.prisma.card.update({
        where: { id: body.cardId },
        data: {
          title: body.title,
          description: body.description,
        },
      });

      this.server.to(`board_${card.column.boardId}`).emit('cardUpdated', {
        card: updatedCard,
        updatedBy: user.sub,
        timestamp: new Date().toISOString(),
      });

      return { success: true, card: updatedCard };
    } catch (error) {
      this.logger.error('Update card error:', error);
      client.emit('error', { message: 'Failed to update card' });
      return { success: false };
    }
  }

  @SubscribeMessage('cardDragging')
  async handleCardDragging(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: {
      boardId: string;
      cardId: string;
      userId: string;
    }
  ) {
    client.to(`board_${body.boardId}`).emit('userDraggingCard', {
      cardId: body.cardId,
      userId: body.userId,
    });
  }

  @SubscribeMessage('cardDragEnd')
  async handleCardDragEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: {
      boardId: string;
      cardId: string;
      userId: string;
    }
  ) {
    client.to(`board_${body.boardId}`).emit('userStoppedDragging', {
      cardId: body.cardId,
      userId: body.userId,
    });
  }
}