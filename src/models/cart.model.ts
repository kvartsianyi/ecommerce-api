import { cartItems, carts } from '@/db/schema';

export type Cart = typeof carts.$inferSelect;

export type CartItem = typeof cartItems.$inferSelect;

export interface UpsertCartItem {
  cartId: number;
  productId: number;
  quantity: number;
}

export interface CartSummaryItem {
  id: number;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  stock: number;
  picture: string;
}

export interface CartSummary {
  id: number;
  totalAmount: number;
  items: CartSummaryItem[];
}
