import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BoardGateway } from '../board/board.gateway';

@Injectable()
export class CardService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => BoardGateway))
        private boardGateway: BoardGateway
    ) { }

    async create(userId: string, columnId: string, dto: CreateCardDto) {
        const column = await this.prisma.column.findUnique({
            where: { id: columnId },
            include: { board: true },
        });

        if (!column || column.board.ownerId !== userId) {
            throw new ForbiddenException('Доступ запрещён');
        }

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
        const column = await this.prisma.column.findUnique({
            where: { id: columnId },
            include: { board: true },
        });

        if (!column || column.board.ownerId !== userId) {
            throw new ForbiddenException('Доступ запрещён');
        }

        return this.prisma.card.findMany({
            where: { columnId },
            orderBy: { order: 'asc' },
        });
    }

    async update(userId: string, id: string, dto: UpdateCardDto) {
        const card = await this.prisma.card.findUnique({
            where: { id },
            include: { column: { include: { board: true } } },
        });

        if (!card || card.column.board.ownerId !== userId) {
            throw new ForbiddenException('Доступ запрещён');
        }

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
        const card = await this.prisma.card.findUnique({
            where: { id },
            include: { column: { include: { board: true } } },
        });

        if (!card || card.column.board.ownerId !== userId) {
            throw new ForbiddenException('Доступ запрещён');
        }

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
        const card = await this.prisma.card.findUnique({
            where: { id: cardId },
            include: { column: { include: { board: true } } },
        });

        if (!card || card.column.board.ownerId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        const newColumn = await this.prisma.column.findUnique({
            where: { id: newColumnId },
            include: { board: true },
        });

        if (!newColumn || newColumn.boardId !== card.column.boardId) {
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
