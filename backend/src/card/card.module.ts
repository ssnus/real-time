import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { CardController } from './card.controller';
import { CardService } from './card.service';
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
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule { }
