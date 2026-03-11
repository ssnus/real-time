import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

export class CreateCardDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    order: number;
}