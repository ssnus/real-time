import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class MoveCardDto {
  @IsString()
  @IsNotEmpty()
  newColumnId: string;

  @IsInt()
  @Min(0)
  newOrder: number;
}
