// nestjs/api/src/modules/category/category.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { Category, Prisma } from '@prisma/client';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // Create a new category
  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const { name, slug, parentId, ...rest } = createCategoryDto;

    // Validate parent relationship to prevent cycles
    if (parentId) {
      await this.validateParentRelationship(parentId);
    }

    const categorySlug =
      slug ??
      name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');

    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (existingCategory) {
      throw new Error(
        'Category with this slug already exists: ' + categorySlug,
      );
    }

    const category = await this.prisma.category.create({
      data: {
        name,
        slug: categorySlug,
        ...rest,
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true } },
      },
    });

    // Get product count separately
    const productCount = await this.prisma.product.count({
      where: { categoryId: category.id },
    });

    return this.formatCategory(category, productCount);
  }

  // Get all categories with optional filters and pagination
  async findAll(queryDto: QueryCategoryDto): Promise<{
    data: CategoryResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { isActive, search, page = 1, limit = 10 } = queryDto;

    const where: Prisma.CategoryWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        {
          name: { contains: search, mode: 'insensitive' },
        },
        {
          description: { contains: search, mode: 'insensitive' },
        },
      ];
    }

    const total = await this.prisma.category.count({ where });

    const categories = await this.prisma.category.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
        parent: { select: { id: true, name: true } },
        children: { select: { id: true } },
      },
    });

    return {
      data: categories.map((category) =>
        this.formatCategory(category, category._count.products),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get category by ID
  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
        parent: { select: { id: true, name: true } },
        children: { select: { id: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.formatCategory(category, Number(category._count.products));
  }

  // Get category by slug
  async findBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
        parent: { select: { id: true, name: true } },
        children: { select: { id: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.formatCategory(category, Number(category._count.products));
  }

  // Updatecategory
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // Validate parent relationship to prevent cycles
    if (updateCategoryDto.parentId) {
      await this.validateParentRelationship(updateCategoryDto.parentId, id);
    }

    if (
      updateCategoryDto.slug &&
      updateCategoryDto.slug !== existingCategory.slug
    ) {
      const slugTaken = await this.prisma.category.findUnique({
        where: { slug: updateCategoryDto.slug },
      });

      if (slugTaken) {
        throw new ConflictException(
          `Category with slug ${updateCategoryDto.slug} already exists`,
        );
      }
    }

    const { parentId, ...rest } = updateCategoryDto;

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        ...rest,
        ...(parentId !== undefined && {
          parent: parentId ? { connect: { id: parentId } } : { disconnect: true },
        }),
      },
      include: {
        _count: {
          select: { products: true },
        },
        parent: { select: { id: true, name: true } },
        children: { select: { id: true } },
      },
    });

    return this.formatCategory(
      updatedCategory,
      Number(updatedCategory._count.products),
    );
  }

  // Remove a catgory
  async remove(id: string): Promise<{ message: string }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.products > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${category._count.products} products. Remove or reassign first`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: `Category delete successfully` };
  }

  private formatCategory(
    category: Category & {
      parent?: { id: string; name: string } | null;
      children?: { id: string }[];
    },
    productCount: number,
  ): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      productCount,
      parentId: category.parentId || null,
      parentName: category.parent?.name || null,
      childrenCount: category.children?.length || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  // Validate parent relationship to prevent cycles
  private async validateParentRelationship(
    parentId: string,
    excludeId?: string,
  ): Promise<void> {
    const parentCategory = await this.prisma.category.findUnique({
      where: { id: parentId },
    });

    if (!parentCategory) {
      throw new NotFoundException('Parent category not found');
    }

    // Prevent self-reference
    if (excludeId && parentId === excludeId) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    // Prevent circular references by checking if the parent is a descendant
    if (excludeId) {
      const isDescendant = await this.isDescendant(parentId, excludeId);
      if (isDescendant) {
        throw new BadRequestException(
          'Cannot create circular category hierarchy',
        );
      }
    }
  }

  // Check if category A is a descendant of category B
  private async isDescendant(
    potentialDescendantId: string,
    potentialAncestorId: string,
  ): Promise<boolean> {
    let currentId = potentialDescendantId;

    // Walk up the parent chain to see if we reach the potential ancestor
    while (currentId) {
      if (currentId === potentialAncestorId) {
        return true;
      }

      const category = await this.prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      if (!category) break;
      currentId = category.parentId || '';
    }

    return false;
  }

  // Get all descendants of a category (simplified version)
  private async getAllDescendants(categoryId: string): Promise<Category[]> {
    // For cycle detection, we use the isDescendant method instead
    // This method is kept for potential future use but simplified
    return [];
  }
}