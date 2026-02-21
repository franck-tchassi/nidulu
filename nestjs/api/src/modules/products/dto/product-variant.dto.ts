// src/modules/products/dto/product-variant.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ColorEU } from './create-product.dto'; // On réutilise l'enum existant

export class ProductVariantDto {
  @ApiProperty({ description: 'Size ID', example: 'uuid-size' })
  @IsString()
  @IsNotEmpty()
  sizeId: string;

  @ApiProperty({ description: 'Color', enum: ColorEU })
  @IsString()
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
