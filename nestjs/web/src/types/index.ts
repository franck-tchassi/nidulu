// web/src/types/index.ts

export interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  productCount: number;
  parentId: string | null;
  parentName: string | null;
  childrenCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  subCategory?: string;
  image: string;
  images?: string[];
  sizes?: string[];
  description: string;
  features?: string[];
  isBundle?: boolean;
  stock?: number;
}

// Interface pour les images (pour le typage fort)
export interface ProductImage {
  url?: string;
  imageUrl?: string;
  path?: string;
  src?: string;
  alt?: string;
  [key: string]: any;
}

// Pour compatibilité
export interface CartItem extends Product {
  quantity: number;
  cartItemId?: string; 
}

// Interface pour la réponse de l'API
export interface CartItemResponse {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images?: ProductImage[];
    image?: string;
    stock: number;
    isActive: boolean;
    category?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Type pour le panier
export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  cartItemId?: string;
  productId: string;
  stock?: number;
  sizes?: string[];
  // Ajoutez product comme optionnel
  product?: {
    id: string;
    name: string;
    price: number;
    images?: (ProductImage | string)[]; // Accepte les deux types
    image?: string;
    stock?: number;
    isActive?: boolean;
    category?: string;
  };
}

export interface Order {
  id: string;
  date: string;
  customer: string;
  total: number;
  status: 'Payé' | 'Expédié' | 'Livré' | 'En préparation';
  items: number;
}

export enum Page {
  Home = '/',
  Catalog = '/catalog',
  ProductDetail = '/product',
  Login='/login',
  Account = '/account',
  AccountOrders = '/orders',
  Cart = '/cart',
  Wishlist = '/wishlist',
  Contact = '/contact',
  About = '/about',
  Admin = '/admin',
  Checkout = '/checkout',
}

export type Category = 
  | 'Vêtements' 
  | 'Accessoires & Puériculture' 
  | 'Jouets & Éveil'
  | 'General'
  | string;