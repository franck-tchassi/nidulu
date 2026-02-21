//nestjs/api/src/modules/products/products.controller.ts
// nestjs/api/src/modules/products/products.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto, ProductImageResponseDto } from './dto/product-response.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  // ==================== CREATE PRODUCT ====================
@Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    description: 'Créer un produit avec plusieurs images et variants',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'iPhone 15 Pro' },
        description: { type: 'string', example: 'Dernier iPhone avec puce A17 Pro' },
        price: { type: 'number', example: 1299.99 },
        stock: { type: 'number', example: 50 },
        sku: { type: 'string', example: 'IPH15-PRO-256' },
        categoryId: { type: 'string', example: 'uuid-category' },
        isActive: { type: 'boolean', example: true },
        variants: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductVariantDto' },
          description: 'Liste des variants du produit',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Images du produit (jusqu\'à 10)',
        },
      },
      required: ['name', 'sku', 'categoryId'],
    },
  })
  @ApiOperation({ summary: 'Créer un produit avec images et variants' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    images?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    this.logger.log(`Création produit: ${createProductDto.name}`);
    this.logger.log(`Images reçues: ${images?.length || 0}`);

    const processedDto = {
      ...createProductDto,
      price: typeof createProductDto.price === 'string' ? parseFloat(createProductDto.price) : createProductDto.price,
      stock: typeof createProductDto.stock === 'string' ? parseInt(createProductDto.stock, 10) : createProductDto.stock,
      isActive: typeof createProductDto.isActive === 'string' ? createProductDto.isActive === 'true' : createProductDto.isActive,
    };

    return await this.productsService.create(processedDto, images);
  }

  // ==================== GET ALL PRODUCTS ====================
  @Get()
  @ApiOperation({
    summary: 'Récupérer tous les produits avec filtres optionnels',
    description: 'Pagination incluse. Peut filtrer par catégorie, statut, recherche.'
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits avec pagination',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  async findAll(@Query() queryDto: QueryProductDto) {
    this.logger.log(`Récupération produits avec filtres: ${JSON.stringify(queryDto)}`);
    return await this.productsService.findAll(queryDto);
  }

  // ==================== GET PRODUCT BY ID ====================
  @Get(':id')
  @ApiOperation({
    summary: 'Récupérer un produit par son ID',
    description: 'Inclut toutes les images associées au produit'
  })
  @ApiResponse({
    status: 200,
    description: 'Détails du produit',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produit non trouvé',
  })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    this.logger.log(`Récupération produit ID: ${id}`);
    return await this.productsService.findOne(id);
  }

  // ==================== UPDATE PRODUCT ====================
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    description: 'Mettre à jour un produit avec variants et images',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'iPhone 15 Pro Max' },
        description: { type: 'string', example: 'Dernier iPhone avec écran Dynamic Island' },
        price: { type: 'number', example: 1399.99 },
        stock: { type: 'number', example: 25 },
        sku: { type: 'string', example: 'IPH15-PROMAX-512' },
        categoryId: { type: 'string', example: 'uuid-category' },
        isActive: { type: 'boolean', example: true },
        variants: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductVariantDto' },
          description: 'Liste des variants mis à jour',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Nouvelles images à ajouter',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Mettre à jour un produit avec variants et images' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    images?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    this.logger.log(`Mise à jour produit ID: ${id}`);
    this.logger.log(`Nouvelles images: ${images?.length || 0}`);

    const processedDto = {
      ...updateProductDto,
      price: typeof updateProductDto.price === 'string' ? parseFloat(updateProductDto.price) : updateProductDto.price,
      stock: typeof updateProductDto.stock === 'string' ? parseInt(updateProductDto.stock, 10) : updateProductDto.stock,
      isActive: typeof updateProductDto.isActive === 'string' ? updateProductDto.isActive === 'true' : updateProductDto.isActive,
    };

    return await this.productsService.update(id, processedDto, images);
  }

  // ==================== ADD IMAGES TO PRODUCT ====================
  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Ajouter des images à un produit existant',
    description: 'Ajoute les nouvelles images à la fin de la liste existante'
  })
  @ApiBody({
    description: 'Images à ajouter',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Images à ajouter (jusqu\'à 10)',
        },
      },
      required: ['images'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Images ajoutées avec succès',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produit non trouvé',
  })
  @ApiResponse({
    status: 400,
    description: 'Images invalides ou trop grandes',
  })
  async addImages(
    @Param('id') productId: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    images: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    this.logger.log(`Ajout d'images au produit ID: ${productId}`);
    this.logger.log(`Nombre d'images: ${images.length}`);
    
    if (!images || images.length === 0) {
      throw new Error('Aucune image fournie');
    }

    return await this.productsService.addImages(productId, images);
  }

  // ==================== UPDATE SPECIFIC IMAGE ====================
  @Patch(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('image', 1))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Remplacer une image spécifique',
    description: 'Supprime l\'ancienne image et la remplace par la nouvelle'
  })
  @ApiBody({
    description: 'Nouvelle image',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Nouvelle image',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image mise à jour avec succès',
    type: ProductImageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produit ou image non trouvé',
  })
  async updateImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    images: Express.Multer.File[],
  ): Promise<ProductImageResponseDto> {
    this.logger.log(`Mise à jour image ${imageId} du produit ${productId}`);
    
    if (!images || images.length === 0) {
      throw new Error('Aucune image fournie');
    }

    return await this.productsService.updateImage(productId, imageId, images[0]);
  }

  // ==================== DELETE PRODUCT IMAGE ====================
  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une image spécifique',
    description: 'Ne peut pas supprimer la dernière image d\'un produit'
  })
  @ApiResponse({
    status: 204,
    description: 'Image supprimée avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Produit ou image non trouvé',
  })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer la dernière image',
  })
  async deleteImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
  ): Promise<void> {
    this.logger.log(`Suppression image ${imageId} du produit ${productId}`);
    return await this.productsService.deleteImage(productId, imageId);
  }

  // ==================== REORDER PRODUCT IMAGES ====================
  @Put(':id/images/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Réorganiser l\'ordre des images',
    description: 'La première image devient l\'image principale'
  })
  @ApiBody({
    description: 'Nouvel ordre des images',
    schema: {
      type: 'object',
      properties: {
        imageIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['img-uuid-1', 'img-uuid-2', 'img-uuid-3'],
          description: 'IDs des images dans le nouvel ordre',
        },
      },
      required: ['imageIds'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Images réorganisées avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Produit non trouvé',
  })
  @ApiResponse({
    status: 400,
    description: 'IDs d\'images invalides',
  })
  async reorderImages(
    @Param('id') productId: string,
    @Body('imageIds') imageIds: string[],
  ): Promise<void> {
    this.logger.log(`Réorganisation images du produit ${productId}`);
    this.logger.log(`Nouvel ordre: ${imageIds.join(', ')}`);
    
    if (!imageIds || imageIds.length === 0) {
      throw new Error('Aucun ID d\'image fourni');
    }

    return await this.productsService.reorderImages(productId, imageIds);
  }

  // ==================== UPDATE PRODUCT STOCK ====================
  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mettre à jour le stock d\'un produit',
    description: 'Quantité positive pour ajouter, négative pour retirer'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description: 'Ajustement du stock (positif pour ajouter, négatif pour retirer)',
          example: 10,
        },
      },
      required: ['quantity'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Stock mis à jour avec succès',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Stock insuffisant',
  })
  @ApiResponse({
    status: 404,
    description: 'Produit non trouvé',
  })
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<ProductResponseDto> {
    this.logger.log(`Mise à jour stock produit ${id}: ${quantity}`);
    return await this.productsService.updateStock(id, quantity);
  }

  // ==================== DELETE PRODUCT ====================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer un produit',
    description: 'Supprime également toutes les images associées sur Cloudinary'
  })
  @ApiResponse({
    status: 200,
    description: 'Produit supprimé avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Produit non trouvé',
  })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer un produit dans des commandes actives',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Suppression produit ID: ${id}`);
    return await this.productsService.remove(id);
  }

  // ==================== GET PRODUCT IMAGES ONLY ====================
  @Get(':id/images')
  @ApiOperation({
    summary: 'Récupérer uniquement les images d\'un produit',
    description: 'Retourne la liste de toutes les images associées au produit'
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des images du produit',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/ProductImageResponseDto' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Produit non trouvé',
  })
  async getProductImages(
    @Param('id') productId: string,
  ): Promise<ProductImageResponseDto[]> {
    this.logger.log(`Récupération images du produit: ${productId}`);
    const product = await this.productsService.findOne(productId);
    return product.images;
  }

  // ==================== SET PRIMARY IMAGE ====================
  @Patch(':id/images/:imageId/primary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Définir une image comme principale',
    description: 'Définit l\'image spécifiée comme image principale du produit'
  })
  @ApiResponse({
    status: 200,
    description: 'Image définie comme principale',
    type: ProductImageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produit ou image non trouvé',
  })
  async setPrimaryImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
  ): Promise<ProductImageResponseDto> {
    this.logger.log(`Définition image ${imageId} comme principale pour produit ${productId}`);
    
    // Cette fonctionnalité nécessiterait une méthode supplémentaire dans ProductsService
    // Pour l'instant, on peut utiliser reorderImages avec l'image en première position
    const product = await this.productsService.findOne(productId);
    const imageIds = product.images.map(img => img.id);
    
    // Placer l'image sélectionnée en première position
    const newOrder = [
      imageId,
      ...imageIds.filter(id => id !== imageId)
    ];
    
    await this.productsService.reorderImages(productId, newOrder);
    
    // Retourner l'image mise à jour
    const updatedProduct = await this.productsService.findOne(productId);
    return updatedProduct.images.find(img => img.id === imageId)!;
  }
}













