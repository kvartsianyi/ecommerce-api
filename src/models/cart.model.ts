import { cartItems, carts } from '@/db/schema';

export type Cart = typeof carts.$inferSelect;

export type CartItem = typeof cartItems.$inferSelect;

export interface UpsertCartItem {
  cartId: number;
  productId: number;
  quantity: number;
}

export interface CartDetailsItem {
  id: number;
  productId: number;
  productTitle: string;
  productDescription?: string | null;
  productImage: string | null;
  productPrice: number;
  quantity: number;
}

export interface CartDetails {
  id: number;
  totalAmount: number;
  items: CartDetailsItem[];
}
