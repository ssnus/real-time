import { Module, forwardRef } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { JwtModule } from '@nestjs/jwt';
import { BoardGateway } from './board.gateway';


@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    AccessModule,
  ],
  controllers: [BoardController],
  providers: [BoardService, BoardGateway],
  exports: [BoardService, BoardGateway],
})
export class BoardModule { }
