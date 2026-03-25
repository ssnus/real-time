import { Injectable, Inject, forwardRef, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BoardGateway } from '../board/board.gateway';
import { AccessControlService } from '../access/access-control.service';

@Injectable()
export class CardService {
    constructor(
        private prisma: PrismaService,
        private accessControl: AccessControlService,
        @Inject(forwardRef(() => BoardGateway))
        private boardGateway: BoardGateway
    ) { }

    async create(userId: string, columnId: string, dto: CreateCardDto) {
        const column = await this.accessControl.validateColumnAccess(userId, columnId);

        const card = await this.prisma.card.create({
            data: {
                title: dto.title,
                description: dto.description,
                order: dto.order,
                columnId
            },
        });

        this.boardGateway.server.to(`board_${column.boardId}`).emit('cardCreated', {
            card,
            createdBy: userId,
            timestamp: new Date().toISOString()
        });

        return card;
    }

    async findAll(userId: string, columnId: string) {
        await this.accessControl.validateColumnAccess(userId, columnId);

        return this.prisma.card.findMany({
            where: { columnId },
            orderBy: { order: 'asc' },
        });
    }

    async update(userId: string, id: string, dto: UpdateCardDto) {
        const card = await this.accessControl.validateCardAccess(userId, id);

        return this.prisma.card.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                order: dto.order,
            },
        });
    }

    async remove(userId: string, id: string) {
        const card = await this.accessControl.validateCardAccess(userId, id);

        await this.prisma.card.delete({ where: { id } });

        this.boardGateway.server.to(`board_${card.column.boardId}`).emit('cardDeleted', {
            cardId: id,
            columnId: card.columnId,
            deletedBy: userId,
            timestamp: new Date().toISOString()
        });

        return { message: 'Успешно удалено' };
    }

    async moveCard(userId: string, cardId: string, newColumnId: string, newOrder: number) {
        const card = await this.accessControl.validateCardAccess(userId, cardId);
        const newColumn = await this.accessControl.validateColumnAccess(userId, newColumnId);

        if (newColumn.boardId !== card.column.boardId) {
            throw new ForbiddenException('Cannot move card to this column');
        }

        return this.prisma.card.update({
            where: { id: cardId },
            data: {
                columnId: newColumnId,
                order: newOrder,
            },
        });
    }
}
