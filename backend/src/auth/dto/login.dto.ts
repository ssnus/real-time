import { IsString, IsEmail, MinLength } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: 'Неверный формат почты'})
    email: string;

    @IsString()
    @MinLength(8, {message: 'Пароль не должен быть меньше 8 символов'})
    password: string;
}