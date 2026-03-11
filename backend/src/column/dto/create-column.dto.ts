import { IsString, IsNotEmpty, IsNumber, Min } from "class-validator";

export class CreateColumnDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    @Min(0)
    order: number;
}