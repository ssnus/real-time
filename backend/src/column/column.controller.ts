import { Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
    Req
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request.interface';

@Controller('boards/:boardId/columns')
@UseGuards(JwtAuthGuard)
export class ColumnController {
  constructor(private columnService: ColumnService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Param('boardId') boardId: string, @Body() dto: CreateColumnDto) {
    const userId = req.user.sub;
    return this.columnService.create(userId, boardId, dto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser, @Param('boardId') boardId: string) {
    const userId = req.user.sub;
    return this.columnService.findAll(userId, boardId);
  }

  @Put(':id')
  update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateColumnDto) {
    const userId = req.user.sub;
    return this.columnService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.columnService.remove(userId, id);
  }
}
