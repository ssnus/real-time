import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class CreateBoardDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'Заголовок должен содержать не менее 3х символов'})
    title: string;
}