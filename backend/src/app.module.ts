import { Module, Global } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { ColumnModule } from './column/column.module';
import { CardModule } from './card/card.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'env',
    }),
    PrismaModule,
    AuthModule,
    BoardModule,
    ColumnModule,
    CardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
