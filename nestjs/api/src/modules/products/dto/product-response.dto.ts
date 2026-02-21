import { ApiProperty } from '@nestjs/swagger';
import { ProductVariantResponseDto } from './product-variant-response.dto';

export class ProductImageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty({ required: false })
  alt?: string;

  @ApiProperty()
  order!: number;

  @ApiProperty()
  isPrimary!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ProductResponseDto {
  @ApiProperty({ example: 'uuid-product' })
  id!: string;

  @ApiProperty({ example: 'T-shirt coton bio' })
  name!: string;

  @ApiProperty({ nullable: true })
  description?: string | null;

  @ApiProperty({ example: 29.99 })
  price!: number;

  @ApiProperty({ example: 100 })
  stock!: number;

  @ApiProperty({ example: 'TSHIRT-001' })
  sku!: string;

  @ApiProperty({ type: [ProductImageResponseDto] })
  images!: ProductImageResponseDto[];

  // ✅ ICI LES VARIANTS
  @ApiProperty({
    description: 'Product variants (size + color)',
    type: [ProductVariantResponseDto],
    required: false,
  })
  variants!: ProductVariantResponseDto[];

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 'Clothing' })
  category!: string | null;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

  
  

  

  

  

  
