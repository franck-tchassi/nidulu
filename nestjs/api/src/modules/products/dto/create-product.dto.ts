// src/modules/products/dto/create-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * Enum des couleurs EU
 */
export enum ColorEU {
  BLANC = 'BLANC',
  NOIR = 'NOIR',
  BLEU = 'BLEU',
  ROUGE = 'ROUGE',
  VERT = 'VERT',
  JAUNE = 'JAUNE',
  GRIS = 'GRIS',
  ROSE = 'ROSE',
  MARRON = 'MARRON',
  BEIGE = 'BEIGE',
  ORANGE = 'ORANGE',
  VIOLET = 'VIOLET',
  MULTICOLORE = 'MULTICOLORE',
}

/**
 * DTO pour une variante de produit
 */
export class ProductVariantDto {
  @ApiProperty({ description: 'Size ID', example: 'uuid-size' })
  @IsString()
  @IsNotEmpty()
  sizeId: string;

  @ApiProperty({ description: 'Color', enum: ColorEU })
  @IsNotEmpty()
  color: ColorEU;

  @ApiProperty({ description: 'Stock quantity', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ description: 'Variant price', example: 49.99, required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ description: 'Variant SKU', example: 'WH-001-BLANC-S', required: false })
  @IsOptional()
  @IsString()
  sku?: string;
}

/**
 * DTO pour créer un produit
 */
export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Headphones',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality wireless headphones with noise cancellation',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Product price in USD',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @ApiProperty({
    description: 'Stock keeping Unit (Sku) - unique identifier',
    example: 'WH-001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @ApiProperty({
    description: 'Product image url',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Product category ID',
    example: 'uuid-category',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Whether product is active and available for purchase',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Product variants (size + color + stock + price + sku)',
    type: [ProductVariantDto],
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}
