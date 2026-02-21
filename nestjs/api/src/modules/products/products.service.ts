// nestjs/api/src/modules/products/products.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Category, Prisma, Product, ProductImage } from '@prisma/client';
import { ProductResponseDto, ProductImageResponseDto } from './dto/product-response.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ==================== CREATE PRODUCT ====================
  async create(
    createProductDto: CreateProductDto,
    imageFiles?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    this.logger.log(`Tentative de création produit: ${createProductDto.name}`);
    
    // Vérifier si le SKU existe déjà
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });
    
    if (existingSku) {
      throw new ConflictException(
        `Un produit avec le SKU "${createProductDto.sku}" existe déjà`,
      );
    }

    // Vérifier que la catégorie existe
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });
    
    if (!category) {
      throw new NotFoundException(`Catégorie avec ID "${createProductDto.categoryId}" non trouvée`);
    }

    let imageUrls: string[] = [];

    // Upload des images vers Cloudinary si fournies
    if (imageFiles && imageFiles.length > 0) {
      this.logger.log(`Upload de ${imageFiles.length} images vers Cloudinary...`);
      
      try {
        // Upload parallèle pour améliorer les performances
        const uploadPromises = imageFiles.map(async (file, index) => {
          this.logger.debug(`Upload image ${index + 1}: ${file.originalname} (${file.size} bytes)`);
          return await this.cloudinaryService.uploadImage(file, 'products');
        });
        
        imageUrls = await Promise.all(uploadPromises);
        this.logger.log(`${imageUrls.length} images uploadées avec succès`);
        
      } catch (error) {
        this.logger.error('Échec de l\'upload des images:', error);
        
        // Nettoyer les images déjà uploadées en cas d'erreur
        if (imageUrls.length > 0) {
          this.logger.warn('Nettoyage des images partiellement uploadées...');
          await this.cleanupFailedUploads(imageUrls);
        }
        
        throw new BadRequestException(
          'Échec de l\'upload des images. Veuillez réessayer avec des images valides.'
        );
      }
    }

    try {
      // Créer le produit avec ses images et variants
      const product = await this.prisma.product.create({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: new Prisma.Decimal(createProductDto.price),
          stock: createProductDto.stock,
          sku: createProductDto.sku,
          categoryId: createProductDto.categoryId,
          isActive: createProductDto.isActive ?? true,
          images: {
            create: imageUrls.map((url, index) => ({
              url,
              alt: createProductDto.name,
              order: index,
              isPrimary: index === 0,
            })),
          },
          ...(createProductDto.variants && createProductDto.variants.length > 0
            ? {
                variants: {
                  create: createProductDto.variants.map((variant) => ({
                    sizeId: variant.sizeId,
                    color: variant.color,
                    stock: variant.stock ?? 0,
                    price: variant.price ? new Prisma.Decimal(variant.price) : undefined,
                    sku: variant.sku,
                  })),
                },
              }
            : {}),
        },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          variants: { include: { size: true } },
        },
      });


      this.logger.log(`Produit créé avec succès: ${product.id} avec ${product.images.length} images`);
      return this.formatProduct(product);
      
    } catch (error) {
      this.logger.error('Erreur lors de la création du produit:', error);
      
      // Nettoyer les images Cloudinary en cas d'erreur de base de données
      if (imageUrls.length > 0) {
        await this.cleanupFailedUploads(imageUrls);
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2003':
            throw new BadRequestException('Catégorie invalide');
          default:
            throw new InternalServerErrorException('Erreur lors de la création du produit');
        }
      }
      
      throw error;
    }
  }

  // ==================== GET ALL PRODUCTS ====================
  async findAll(queryDto: QueryProductDto): Promise<{
    data: ProductResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { category, isActive, search, page = 1, limit = 10 } = queryDto;

    // Construire les conditions de recherche
    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.categoryId = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      // Compter le total pour la pagination
      const total = await this.prisma.product.count({ where });

      // Récupérer les produits avec pagination
      const products = await this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          variants: { include: { size: true } },
        },
      });

      this.logger.debug(`Récupération de ${products.length} produits sur ${total} au total`);
      
      return {
        data: products.map((product) => this.formatProduct(product)),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
      
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des produits:', error);
      throw new InternalServerErrorException('Impossible de récupérer les produits');
    }
  }

  // ==================== GET PRODUCT BY ID ====================
  async findOne(id: string): Promise<ProductResponseDto> {
    this.logger.debug(`Recherche produit ID: ${id}`);
    
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          variants: { include: { size: true } },
        },
      });
      
      if (!product) {
        throw new NotFoundException(`Produit avec ID "${id}" non trouvé`);
      }

      return this.formatProduct(product);
      
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Erreur lors de la recherche du produit ${id}:`, error);
      throw new InternalServerErrorException('Impossible de récupérer le produit');
    }
  }

  // ==================== UPDATE PRODUCT ====================
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    imageFiles?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    this.logger.log(`Mise à jour produit ID: ${id}`);
    
    // Récupérer le produit existant
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Produit avec ID "${id}" non trouvé`);
    }

    // Vérifier si le SKU est modifié et s'il existe déjà
    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      const skuTaken = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });

      if (skuTaken) {
        throw new ConflictException(
          `Un produit avec le SKU "${updateProductDto.sku}" existe déjà`,
        );
      }
    }

    // Vérifier la catégorie si elle est modifiée
    if (updateProductDto.categoryId && updateProductDto.categoryId !== existingProduct.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });
      
      if (!category) {
        throw new NotFoundException(`Catégorie avec ID "${updateProductDto.categoryId}" non trouvée`);
      }
    }

    // Upload des nouvelles images si fournies
    let newImageData: { url: string; alt: string }[] = [];
    if (imageFiles && imageFiles.length > 0) {
      this.logger.log(`Upload de ${imageFiles.length} nouvelles images...`);
      
      try {
        const uploadPromises = imageFiles.map(async (file) => {
          const url = await this.cloudinaryService.uploadImage(file, 'products');
          return {
            url,
            alt: updateProductDto.name || existingProduct.name,
          };
        });
        
        newImageData = await Promise.all(uploadPromises);
        this.logger.log(`${newImageData.length} nouvelles images uploadées`);
        
      } catch (error) {
        this.logger.error('Échec de l\'upload des nouvelles images:', error);
        
        // Nettoyer les nouvelles images déjà uploadées
        if (newImageData.length > 0) {
          await this.cleanupFailedUploads(newImageData.map(img => img.url));
        }
        
        throw new BadRequestException('Échec de l\'upload des nouvelles images');
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (updateProductDto.name !== undefined) {
      updateData.name = updateProductDto.name;
    }
    
    if (updateProductDto.description !== undefined) {
      updateData.description = updateProductDto.description;
    }
    
    if (updateProductDto.categoryId !== undefined) {
      updateData.categoryId = updateProductDto.categoryId;
    }
    
    if (updateProductDto.isActive !== undefined) {
      updateData.isActive = updateProductDto.isActive;
    }
    
    if (updateProductDto.price !== undefined) {
      updateData.price = new Prisma.Decimal(updateProductDto.price);
    }
    
    if (updateProductDto.stock !== undefined) {
      updateData.stock = updateProductDto.stock;
    }

    try {
      // Mettre à jour le produit
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          ...updateData,
          ...(newImageData.length > 0 && {
            images: {
              create: newImageData.map((img, index) => ({
                ...img,
                order: existingProduct.images.length + index,
                isPrimary: false,
              })),
            },
          }),
        },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          variants: { include: { size: true } },
        },
      });

      this.logger.log(`Produit ${id} mis à jour avec succès`);
      return this.formatProduct(updatedProduct);
      
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du produit ${id}:`, error);
      
      // Nettoyer les nouvelles images en cas d'erreur
      if (newImageData.length > 0) {
        await this.cleanupFailedUploads(newImageData.map(img => img.url));
      }
      
      throw new InternalServerErrorException('Impossible de mettre à jour le produit');
    }
  }

  // ==================== ADD IMAGES TO PRODUCT ====================
  async addImages(
    productId: string,
    imageFiles: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    this.logger.log(`Ajout d'images au produit ID: ${productId}`);
    
    // Vérifier que le produit existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Produit avec ID "${productId}" non trouvé`);
    }

    if (!imageFiles || imageFiles.length === 0) {
      throw new BadRequestException('Aucune image fournie');
    }

    // Upload des nouvelles images
    const newImageData: { url: string; alt: string; order: number; isPrimary: boolean }[] = [];
    try {
      for (const [index, file] of imageFiles.entries()) {
        this.logger.debug(`Upload image ${index + 1}: ${file.originalname}`);
        const url = await this.cloudinaryService.uploadImage(file, 'products');
        newImageData.push({
          url,
          alt: product.name,
          order: product.images.length + index,
          isPrimary: false,
        });
      }
      
      this.logger.log(`${newImageData.length} images uploadées avec succès`);
    } catch (error) {
      this.logger.error('Échec de l\'upload des images:', error);
      throw new BadRequestException('Échec de l\'upload des images');
    }

    try {
      // Ajouter les images au produit
      const updatedProduct = await this.prisma.product.update({
        where: { id: productId },
        data: {
          images: {
            create: newImageData,
          },
        },
        include: {
          category: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
      });

      this.logger.log(`${newImageData.length} images ajoutées au produit ${productId}`);
      return this.formatProduct(updatedProduct);
      
    } catch (error) {
      this.logger.error(`Erreur lors de l'ajout d'images au produit ${productId}:`, error);
      
      // Nettoyer les images uploadées en cas d'erreur
      await this.cleanupFailedUploads(newImageData.map(img => img.url));
      
      throw new InternalServerErrorException('Impossible d\'ajouter les images');
    }
  }

  // ==================== UPDATE SPECIFIC IMAGE ====================
  async updateImage(
    productId: string,
    imageId: string,
    imageFile: Express.Multer.File,
  ): Promise<ProductImageResponseDto> {
    this.logger.log(`Mise à jour image ${imageId} du produit ${productId}`);
    
    // Vérifier que l'image existe et appartient au produit
    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
    });

    if (!image) {
      throw new NotFoundException(`Image avec ID "${imageId}" non trouvée pour ce produit`);
    }

    let newUrl: string;
    try {
      // Supprimer l'ancienne image de Cloudinary
      const publicId = this.cloudinaryService.extractPublicId(image.url);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
        this.logger.debug(`Ancienne image supprimée de Cloudinary: ${publicId}`);
      }

      // Uploader la nouvelle image
      newUrl = await this.cloudinaryService.uploadImage(imageFile, 'products');
      this.logger.debug(`Nouvelle image uploadée: ${newUrl}`);
      
    } catch (error) {
      this.logger.error('Échec de la mise à jour de l\'image:', error);
      throw new BadRequestException('Échec de la mise à jour de l\'image');
    }

    try {
      // Mettre à jour l'image dans la base de données
      const updatedImage = await this.prisma.productImage.update({
        where: { id: imageId },
        data: {
          url: newUrl,
        },
      });

      this.logger.log(`Image ${imageId} mise à jour avec succès`);
      return this.formatProductImage(updatedImage);
      
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'image ${imageId}:`, error);
      
      // Essayer de supprimer la nouvelle image en cas d'erreur
      try {
        const newPublicId = this.cloudinaryService.extractPublicId(newUrl);
        if (newPublicId) {
          await this.cloudinaryService.deleteImage(newPublicId);
        }
      } catch (cleanupError) {
        this.logger.warn('Impossible de nettoyer la nouvelle image après erreur:', cleanupError);
      }
      
      throw new InternalServerErrorException('Impossible de mettre à jour l\'image');
    }
  }

  // ==================== DELETE PRODUCT IMAGE ====================
  async deleteImage(productId: string, imageId: string): Promise<void> {
    this.logger.log(`Suppression image ${imageId} du produit ${productId}`);
    
    // Vérifier que l'image existe et appartient au produit
    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
    });

    if (!image) {
      throw new NotFoundException(`Image avec ID "${imageId}" non trouvée pour ce produit`);
    }

    // Vérifier si c'est la dernière image
    const productImages = await this.prisma.productImage.findMany({
      where: { productId },
    });

    if (productImages.length <= 1) {
      throw new BadRequestException(
        'Impossible de supprimer la dernière image d\'un produit. ' +
        'Supprimez le produit ou ajoutez une nouvelle image d\'abord.'
      );
    }

    try {
      // Supprimer l'image de Cloudinary
      const publicId = this.cloudinaryService.extractPublicId(image.url);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
        this.logger.debug(`Image supprimée de Cloudinary: ${publicId}`);
      }
    } catch (error) {
      this.logger.warn(`Échec de la suppression de l'image de Cloudinary: ${error.message}`);
      // Continuer quand même avec la suppression de la base de données
    }

    try {
      // Supprimer l'image de la base de données
      await this.prisma.productImage.delete({
        where: { id: imageId },
      });

      this.logger.log(`Image ${imageId} supprimée de la base de données`);

      // Si l'image supprimée était principale, définir la première image restante comme principale
      if (image.isPrimary) {
        const remainingImages = await this.prisma.productImage.findMany({
          where: { productId },
          orderBy: { order: 'asc' },
        });

        if (remainingImages.length > 0) {
          await this.prisma.productImage.update({
            where: { id: remainingImages[0].id },
            data: { isPrimary: true },
          });
          
          this.logger.log(`Image ${remainingImages[0].id} définie comme nouvelle image principale`);
        }
      }
      
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'image ${imageId}:`, error);
      throw new InternalServerErrorException('Impossible de supprimer l\'image');
    }
  }

  // ==================== REORDER IMAGES ====================
  async reorderImages(productId: string, imageIds: string[]): Promise<void> {
    this.logger.log(`Réorganisation des images du produit ${productId}`);
    this.logger.debug(`Nouvel ordre: ${imageIds.join(', ')}`);
    
    if (!imageIds || imageIds.length === 0) {
      throw new BadRequestException('Aucun ID d\'image fourni');
    }

    // Vérifier que toutes les images appartiennent au produit
    const productImages = await this.prisma.productImage.findMany({
      where: { productId },
    });

    const productImageIds = productImages.map(img => img.id);
    const invalidIds = imageIds.filter(id => !productImageIds.includes(id));
    
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Les IDs suivants ne correspondent pas aux images du produit: ${invalidIds.join(', ')}`
      );
    }

    if (imageIds.length !== productImageIds.length) {
      throw new BadRequestException(
        `Nombre d'IDs (${imageIds.length}) ne correspond pas au nombre d'images du produit (${productImageIds.length})`
      );
    }

    try {
      await this.prisma.$transaction(async (prisma) => {
        for (let i = 0; i < imageIds.length; i++) {
          await prisma.productImage.update({
            where: {
              id: imageIds[i],
              productId,
            },
            data: {
              order: i,
              isPrimary: i === 0, // Première image = image principale
            },
          });
        }
      });

      this.logger.log(`Images du produit ${productId} réorganisées avec succès`);
      
    } catch (error) {
      this.logger.error(`Erreur lors de la réorganisation des images du produit ${productId}:`, error);
      throw new InternalServerErrorException('Impossible de réorganiser les images');
    }
  }

  // ==================== UPDATE PRODUCT STOCK ====================
  async updateStock(id: string, quantity: number): Promise<ProductResponseDto> {
    this.logger.log(`Mise à jour stock produit ${id}: ${quantity}`);
    
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!product) {
      throw new NotFoundException(`Produit avec ID "${id}" non trouvé`);
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new BadRequestException(
        `Stock insuffisant. Stock actuel: ${product.stock}, tentative de retrait: ${Math.abs(quantity)}`
      );
    }

    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: { stock: newStock },
        include: {
          category: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
      });

      this.logger.log(`Stock produit ${id} mis à jour: ${product.stock} → ${newStock}`);
      return this.formatProduct(updatedProduct);
      
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du stock du produit ${id}:`, error);
      throw new InternalServerErrorException('Impossible de mettre à jour le stock');
    }
  }

  // ==================== DELETE PRODUCT ====================
  async remove(id: string): Promise<{ message: string }> {
    this.logger.log(`Suppression produit ID: ${id}`);
    
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        orderitems: true,
        cartItems: true,
        images: true,
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Produit avec ID "${id}" non trouvé`);
    }

    // Vérifier si le produit est dans des commandes
    if (product.orderitems && product.orderitems.length > 0) {
      throw new BadRequestException(
        'Impossible de supprimer un produit présent dans des commandes. ' +
        'Marquez-le comme inactif à la place.'
      );
    }

    // Supprimer les images de Cloudinary
    if (product.images && product.images.length > 0) {
      this.logger.log(`Suppression de ${product.images.length} images de Cloudinary...`);
      const deletePromises = product.images.map(async (image) => {
        try {
          const publicId = this.cloudinaryService.extractPublicId(image.url);
          if (publicId) {
            await this.cloudinaryService.deleteImage(publicId);
            this.logger.debug(`Image Cloudinary supprimée: ${publicId}`);
          }
        } catch (error) {
          this.logger.warn(`Échec de la suppression de l'image ${image.id} de Cloudinary: ${error.message}`);
        }
      });
      
      await Promise.all(deletePromises);
    }

    try {
      // Supprimer le produit (cascade supprimera les images de la base)
      await this.prisma.product.delete({
        where: { id },
      });

      this.logger.log(`Produit ${id} supprimé avec succès`);
      return { message: 'Produit supprimé avec succès' };
      
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du produit ${id}:`, error);
      throw new InternalServerErrorException('Impossible de supprimer le produit');
    }
  }

  // ==================== HELPER METHODS ====================
  
  /**
   * Nettoyer les images uploadées en cas d'échec
   */
  private async cleanupFailedUploads(imageUrls: string[]): Promise<void> {
    this.logger.warn(`Nettoyage de ${imageUrls.length} images partiellement uploadées...`);
    
    const deletePromises = imageUrls.map(async (url) => {
      try {
        const publicId = this.cloudinaryService.extractPublicId(url);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      } catch (error) {
        this.logger.warn(`Impossible de nettoyer l'image ${url}:`, error);
      }
    });
    
    await Promise.all(deletePromises);
    this.logger.log('Nettoyage des images terminé');
  }

  /**
   * Formater un produit pour la réponse
   */
  private formatProduct(
    product: Product & { category: Category; images: ProductImage[]; variants?: any[]; },
  ): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      sku: product.sku,
      images: product.images.map(img => this.formatProductImage(img)),

      // ✅ VARIANTS (TAILLE + COULEUR)
      variants: product.variants
        ? product.variants.map(v => ({
            id: v.id,
            sizeId: v.sizeId,
            size: v.size?.label,
            sizeType: v.size?.type,
            color: v.color,
            stock: v.stock,
            price: v.price ? Number(v.price) : null,
            sku: v.sku,
          }))
        : [],

      isActive: product.isActive,
      category: product.category.name,
      categoryId: product.categoryId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Formater une image de produit pour la réponse
   */
  private formatProductImage(image: ProductImage): ProductImageResponseDto {
    return {
      id: image.id,
      url: image.url,
      alt: image.alt ?? undefined,
      order: image.order,
      isPrimary: image.isPrimary,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }

  // ==================== ADDITIONAL METHODS ====================
  
  /**
   * Rechercher des produits par catégorie
   */
  async findByCategory(categoryId: string, limit = 10): Promise<ProductResponseDto[]> {
    this.logger.debug(`Recherche produits par catégorie: ${categoryId}`);
    
    const products = await this.prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
          take: 1, // Prendre seulement la première image
        },
      },
    });
    
    return products.map(product => this.formatProduct(product));
  }

  /**
   * Rechercher des produits par terme
   */
  async searchProducts(searchTerm: string, limit = 20): Promise<ProductResponseDto[]> {
    this.logger.debug(`Recherche produits: "${searchTerm}"`);
    
    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { sku: { contains: searchTerm, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
    });
    
    return products.map(product => this.formatProduct(product));
  }

  /**
   * Récupérer les produits les plus récents
   */
  async getLatestProducts(limit = 8): Promise<ProductResponseDto[]> {
    this.logger.debug(`Récupération des ${limit} produits les plus récents`);
    
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
    });
    
    return products.map(product => this.formatProduct(product));
  }

  /**
   * Vérifier la disponibilité du stock
   */
  async checkStockAvailability(productId: string, requestedQuantity: number): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, isActive: true },
    });
    
    if (!product || !product.isActive) {
      return false;
    }
    
    return product.stock >= requestedQuantity;
  }

  /**
   * Décrementer le stock (pour les commandes)
   */
  async decrementStock(productId: string, quantity: number): Promise<void> {
    this.logger.log(`Décrémentation stock produit ${productId}: ${quantity}`);
    
    try {
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });
      
      this.logger.log(`Stock produit ${productId} décrémenté de ${quantity}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la décrémentation du stock produit ${productId}:`, error);
      throw new InternalServerErrorException('Impossible de mettre à jour le stock');
    }
  }

  /**
   * Incrémenter le stock (pour les retours/annulations)
   */
  async incrementStock(productId: string, quantity: number): Promise<void> {
    this.logger.log(`Incrémentation stock produit ${productId}: ${quantity}`);
    
    try {
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            increment: quantity,
          },
        },
      });
      
      this.logger.log(`Stock produit ${productId} incrémenté de ${quantity}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'incrémentation du stock produit ${productId}:`, error);
      throw new InternalServerErrorException('Impossible de mettre à jour le stock');
    }
  }
}