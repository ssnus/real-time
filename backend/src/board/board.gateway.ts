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
  ) { }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinBoard')
  async handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { boardId: string; token: string }
  ) {
    try {
      const payload = this.jwtService.verify(body.token, {
        secret: process.env.JWT_SECRET,
      });

      const board = await this.prisma.board.findUnique({
        where: { id: body.boardId, ownerId: payload.sub },
      });

      if (!board) {
        client.emit('error', { message: 'Access denied to this board' });
        return;
      }

      client.join(`board_${body.boardId}`);
      this.logger.log(`Client ${client.id} joined room: board_${body.boardId}`);

      client.emit('joined', { boardId: body.boardId });
      return { success: true };
    } catch (error) {
      this.logger.error('Join board error:', error);
      client.emit('error', { message: 'Invalid token or board not found' });
      return { success: false };
    }
  }

  @SubscribeMessage('moveCard')
  async handleMoveCard(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: {
      token: string;
      cardId: string;
      newColumnId: string;
      newOrder: number;
    }
  ) {
    try {
      const payload = this.jwtService.verify(body.token, {
        secret: process.env.JWT_SECRET,
      });

      const card = await this.prisma.card.findUnique({
        where: { id: body.cardId },
        include: { column: { include: { board: true } } },
      });

      if (!card || card.column.board.ownerId !== payload.sub) {
        client.emit('error', { message: 'Access denied' });
        return { success: false };
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
        movedBy: payload.sub,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Card ${body.cardId} moved by user ${payload.sub}`);
      return { success: true, card: updatedCard };
    } catch (error) {
      this.logger.error('Move card error:', error);
      client.emit('error', { message: 'Failed to move card' });
      return { success: false };
    }
  }

  @SubscribeMessage('updateCard')
  async handleUpdateCard(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: {
      token: string;
      cardId: string;
      title?: string;
      description?: string;
    }
  ) {
    try {
      const payload = this.jwtService.verify(body.token, {
        secret: process.env.JWT_SECRET,
      });

      const card = await this.prisma.card.findUnique({
        where: { id: body.cardId },
        include: { column: { include: { board: true } } },
      });

      if (!card || card.column.board.ownerId !== payload.sub) {
        client.emit('error', { message: 'Access denied' });
        return { success: false };
      }

      const updatedCard = await this.prisma.card.update({
        where: { id: body.cardId },
        data: {
          title: body.title,
          description: body.description,
        },
      });


      this.server.to(`board_${card.column.boardId}`).emit('cardUpdated', {
        card: updatedCard,
        updatedBy: payload.sub,
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
      token: string;
      boardId: string;
      cardId: string;
      userId: string;
    }
  ) {
    try {
      this.jwtService.verify(body.token, {
        secret: process.env.JWT_SECRET,
      });

      client.to(`board_${body.boardId}`).emit('userDraggingCard', {
        cardId: body.cardId,
        userId: body.userId,
      });
    } catch (error) {
      client.emit('error', { message: 'Invalid token' });
    }
  }

  @SubscribeMessage('cardDragEnd')
  async handleCardDragEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: {
      token: string;
      boardId: string;
      cardId: string;
      userId: string;
    }
  ) {
    try {
      this.jwtService.verify(body.token, {
        secret: process.env.JWT_SECRET,
      });

      client.to(`board_${body.boardId}`).emit('userStoppedDragging', {
        cardId: body.cardId,
        userId: body.userId,
      });
    } catch (error) {
      client.emit('error', { message: 'Invalid token' });
    }
  }
}