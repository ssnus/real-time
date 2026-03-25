import { IsString, IsEmail, MinLength, IsOptional } from "class-validator";

export class RegisterDto {
    @IsEmail({}, {message: 'Неверный формат почты'})
    email: string;

    @IsString()
    @MinLength(8, { message : 'Пароль не должен быть меньше 8 символов'})
    password: string;

    @IsOptional()
    @IsString({ message: 'Имя должно быть строкой'})
    name?: string;
}