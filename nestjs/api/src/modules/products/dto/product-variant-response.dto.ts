import { ApiProperty } from '@nestjs/swagger';

export class ProductVariantResponseDto {
  @ApiProperty({ example: 'uuid-variant' })
  id!: string;

  @ApiProperty({ example: 'uuid-size' })
  sizeId!: string;

  @ApiProperty({ example: 'M' })
  size!: string;

  @ApiProperty({ example: 'ADULT' })
  sizeType!: string;

  @ApiProperty({ example: 'NOIR' })
  color!: string;

  @ApiProperty({ example: 10 })
  stock!: number;

  @ApiProperty({ example: 49.99, nullable: true })
  price!: number | null;

  @ApiProperty({ example: 'TSHIRT-NOIR-M', nullable: true })
  sku!: string | null;
}
