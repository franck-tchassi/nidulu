
// wishlist.controller.ts
import { Controller, Post, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // ❤️ Toggle wishlist
  @Post(':productId')
  toggle(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.toggle(userId, productId);
  }

  // 📄 Récupérer la wishlist
  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.wishlistService.findByUser(userId);
  }

  // ❌ Supprimer
  @Delete(':productId')
  remove(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.remove(userId, productId);
  }
}
