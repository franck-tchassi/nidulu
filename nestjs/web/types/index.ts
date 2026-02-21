export type Category = 'Vêtements' | 'Accessoires & Puériculture' | 'Jouets & Éveil';

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
}

export interface CartItem extends Product {
  quantity: number;
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
  ProductDetail = '/product', // Base path for dynamic route
  Account = '/account',
  Cart = '/cart',
  Wishlist = '/wishlist',
  Contact = '/contact',
  About = '/about',
  Admin = '/admin',
  Checkout = '/checkout', // Placeholder for future checkout page
}
