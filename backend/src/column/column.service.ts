import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { BoardGateway } from '../board/board.gateway';

@Injectable()
export class ColumnService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => BoardGateway))
        private boardGateway: BoardGateway
    ) { }

    async create(userId: string, boardId: string, dto: CreateColumnDto) {
        const board = await this.prisma.board.findUnique({
            where: { id: boardId },
        });

        if (!board || board.ownerId !== userId) {
            throw new ForbiddenException('Доступ запрещён');
        }

        const column = await this.prisma.column.create({
            data: {
                title: dto.title,
                order: dto.order,
                boardId,
            },
            include: { cards: true }
        });

        this.boardGateway.server.to(`board_${boardId}`).emit('columnCreated', {
            column,
            createdBy: userId,
            timestamp: new Date().toISOString()
        });

        return column;
    }

    async findAll(userId: string, boardId: string) {
        const board = await this.prisma.board.findUnique({
            where: { id: boardId, ownerId: userId },
        });

        if (!board) {
            throw new ForbiddenException('Доступ запрещён');
        }

        return this.prisma.column.findMany({
            where: { boardId },
            orderBy: { order: 'asc' },
            include: { cards: { orderBy: { order: 'asc' } } },
        });
    }

    async update(userId: string, id: string, dto: UpdateColumnDto) {
        const column = await this.prisma.column.findUnique({
            where: { id },
            include: { board: true },
        });

        if (!column || column.board.ownerId !== userId) {
            throw new ForbiddenException('Доступ запрещён');
        }

        return this.prisma.column.update({
            where: { id },
            data: {
                title: dto.title,
                order: dto.order,
            },
        });
    }

    async remove(userId: string, id: string) {
        const column = await this.prisma.column.findUnique({
            where: { id },
            include: { board: true },
        });

        if (!column || column.board.ownerId !== userId) {
            throw new ForbiddenException('Доступ запрещён');
        }

        await this.prisma.column.delete({ where: { id } });

        this.boardGateway.server.to(`board_${column.boardId}`).emit('columnDeleted', {
            columnId: id,
            deletedBy: userId,
            timestamp: new Date().toISOString()
        });

        return { message: 'Столбец удалён' };
    }
}
