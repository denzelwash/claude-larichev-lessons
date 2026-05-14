import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Продукты', maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @ApiProperty({ example: '#FF5733', description: 'HEX-цвет в формате #RRGGBB' })
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'color must be a hex color (#RRGGBB)' })
  color: string;

  @ApiProperty({ example: 'shopping-cart', maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  icon: string;
}
