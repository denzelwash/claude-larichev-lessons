import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'color must be a hex color (#RRGGBB)' })
  color: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  icon: string;
}
