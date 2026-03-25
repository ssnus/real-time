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
import { MoveCardDto } from './dto/move-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request.interface';

@Controller('columns/:columnId/cards')
@UseGuards(JwtAuthGuard)
export class CardController {
  constructor(private cardService: CardService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Param('columnId') columnId: string, @Body() dto: CreateCardDto) {
    const userId = req.user.sub;
    return this.cardService.create(userId, columnId, dto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser, @Param('columnId') columnId: string) {
    const userId = req.user.sub;
    return this.cardService.findAll(userId, columnId);
  }

  @Put(':id')
  update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateCardDto) {
    const userId = req.user.sub;
    return this.cardService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.cardService.remove(userId, id);
  }
  
  @Patch(':id/move')
  moveCard(
    @Req() req: RequestWithUser,
    @Param('id') cardId: string,
    @Body() dto: MoveCardDto
  ) {
    const userId = req.user.sub;
    return this.cardService.moveCard(userId, cardId, dto.newColumnId, dto.newOrder);
  }
}