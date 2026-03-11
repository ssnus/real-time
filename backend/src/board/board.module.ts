import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { JwtModule } from '@nestjs/jwt';
import { BoardGateway } from './board.gateway';


@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [BoardController],
  providers: [BoardService, BoardGateway],
  exports: [BoardService, BoardGateway],
})
export class BoardModule { }
