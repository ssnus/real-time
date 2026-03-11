import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  UseGuards, 
  Req,
  Patch 
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('columns/:columnId/cards')
@UseGuards(JwtAuthGuard)
export class CardController {
  constructor(private cardService: CardService) {}

  @Post()
  create(@Req() req: any, @Param('columnId') columnId: string, @Body() dto: CreateCardDto) {
    const userId = req.user.sub;
    return this.cardService.create(userId, columnId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Param('columnId') columnId: string) {
    const userId = req.user.sub;
    return this.cardService.findAll(userId, columnId);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCardDto) {
    const userId = req.user.sub;
    return this.cardService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.cardService.remove(userId, id);
  }
  
  @Patch(':id/move')
  moveCard(
    @Req() req: any,
    @Param('id') cardId: string,
    @Body() body: { newColumnId: string; newOrder: number }
  ) {
    const userId = req.user.sub;
    return this.cardService.moveCard(userId, cardId, body.newColumnId, body.newOrder);
  }
}