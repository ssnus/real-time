import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreateBoardDto) {
        return this.prisma.board.create({
            data: {
                title: dto.title,
                ownerId: userId,
            },
        });
    }
    async findAll(userId: string) {
        return this.prisma.board.findMany({
        where: { ownerId: userId },
        include: { columns: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(userId: string, id:string) {
        const board = await this.prisma.board.findUnique({
            where: {id},
            include: {
                columns: {
                    orderBy: { order: 'asc' },
                    include: { cards: {orderBy: { order: 'asc' } } },
                },
            },
        });

        if (!board) {
            throw new NotFoundException('Доска не найдена');
        }

        if (board.ownerId !== userId) {
            throw new ForbiddenException('Отказано в доступе');
        }

        return board;
    }

    async update(userId: string, id: string, dto: UpdateBoardDto) {
        const board = await this.prisma.board.findUnique({ where: { id } });

        if (!board) {
            throw new NotFoundException('Доска не найдена');
        }

        if (board.ownerId !== userId){
            throw new ForbiddenException('Доступ запрещён');
        }

        return this.prisma.board.update({
            where: { id },
            data: { title: dto.title },
        });
    }

    async remove(userId: string, id: string) {
        const board = await this.prisma.board.findUnique({ where: { id } });

        if (!board) {
            throw new NotFoundException('Доска не найдена');
        }

        if (board.ownerId !== userId){
            throw new ForbiddenException('Доступ запрещён');
        }

        await this.prisma.board.delete({ where: { id } });
        return { message: 'Board deleted successfully' };
    }
}
