import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('boards')
@UseGuards(JwtAuthGuard) 
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateBoardDto) {
    const userId = req.user.sub; 
    return this.boardService.create(userId, dto);
  }

  @Get()
  findAll(@Req() req) {
    const userId = req.user.sub;
    return this.boardService.findAll(userId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.boardService.findOne(userId, id);
  }

  @Put(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateBoardDto) {
    const userId = req.user.sub;
    return this.boardService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.boardService.remove(userId, id);
  }
}