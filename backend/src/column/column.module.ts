import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';
import { JwtModule } from '@nestjs/jwt';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    BoardModule,
    AccessModule,
  ],
  controllers: [ColumnController],
  providers: [ColumnService],
  exports: [ColumnService],
})
export class ColumnModule { }
