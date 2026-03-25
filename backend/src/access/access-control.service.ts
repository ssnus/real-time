import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AccessControlService {
  constructor(private prisma: PrismaService) {}

  async validateBoardAccess(userId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            cards: { orderBy: { order: 'asc' } }
          }
        }
      }
    });

    if (!board) throw new NotFoundException('Board not found');
    if (board.ownerId !== userId) throw new ForbiddenException('Access denied');

    return board;
  }

  async validateColumnAccess(userId: string, columnId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column) throw new NotFoundException('Column not found');
    if (column.board.ownerId !== userId) throw new ForbiddenException('Access denied');

    return column;
  }

  async validateCardAccess(userId: string, cardId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { column: { include: { board: true } } },
    });

    if (!card) throw new NotFoundException('Card not found');
    if (card.column.board.ownerId !== userId) throw new ForbiddenException('Access denied');

    return card;
  }
}
