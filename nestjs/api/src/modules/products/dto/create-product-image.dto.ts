// src/modules/products/dto/create-product-image.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProductImageDto {
  @ApiProperty({
    description: 'Image URL',
    example: 'https://res.cloudinary.com/.../image.jpg',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Alt text for accessibility',
    example: 'iPhone 15 front view',
    required: false,
  })
  @IsString()
  @IsOptional()
  alt?: string;

  @ApiProperty({
    description: 'Display order (0-based)',
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: 'Is this the primary image?',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class UpdateProductImageDto {
  @ApiProperty({
    description: 'Alt text for accessibility',
    example: 'iPhone 15 front view',
    required: false,
  })
  @IsString()
  @IsOptional()
  alt?: string;

  @ApiProperty({
    description: 'Display order (0-based)',
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: 'Is this the primary image?',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}