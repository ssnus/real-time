import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AccessControlService } from '../access/access-control.service';

@Injectable()
export class BoardService {
    constructor(
        private prisma: PrismaService,
        private accessControl: AccessControlService,
    ) {}

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

    async findOne(userId: string, id: string) {
        return this.accessControl.validateBoardAccess(userId, id);
    }

    async update(userId: string, id: string, dto: UpdateBoardDto) {
        await this.accessControl.validateBoardAccess(userId, id);

        return this.prisma.board.update({
            where: { id },
            data: { title: dto.title },
        });
    }

    async remove(userId: string, id: string) {
        await this.accessControl.validateBoardAccess(userId, id);

        await this.prisma.board.delete({ where: { id } });
        return { message: 'Board deleted successfully' };
    }
}
