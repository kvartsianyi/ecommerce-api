import { CartItem, UpsertCartItem, CartSummary } from '@/models';
import { NotFoundException } from '@/exceptions';
import { ERROR_MESSAGES } from '@/constants';
import { CartItemModel, CartModel, ProductModel } from '@/db/models';

class CartService {
  async addItemToCart(
    userId: number,
    cartItemData: Omit<UpsertCartItem, 'cartId'>,
  ): Promise<CartSummary> {
    const { productId } = cartItemData;

    const product = await ProductModel.findById(productId);

    if (!product) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST);
    }

    const cart = await CartModel.findOrCreateCart(userId);

    const upsertCartItem: UpsertCartItem = {
      ...cartItemData,
      cartId: cart.id,
    };
    await CartItemModel.upsertCartItem(upsertCartItem);

    const cartSummary = await CartModel.getCartSummary(userId);

    return cartSummary!;
  }

  async updateCartItem(
    userId: number,
    id: number,
    cartItemData: Pick<CartItem, 'quantity'>,
  ): Promise<CartSummary> {
    const cartItem = await CartItemModel.findByIdAndUserId(id, userId);

    if (!cartItem) {
      throw new NotFoundException(ERROR_MESSAGES.CART_ITEM_DOES_NOT_EXIST);
    }

    await CartItemModel.updateById(id, cartItemData);

    const cartSummary = await CartModel.getCartSummary(userId);

    return cartSummary!;
  }

  async deleteCartItem(userId: number, id: number): Promise<CartItem> {
    const cartItem = await CartItemModel.findByIdAndUserId(id, userId);

    if (!cartItem) {
      throw new NotFoundException(ERROR_MESSAGES.CART_ITEM_DOES_NOT_EXIST);
    }

    const deletedCartItem = await CartItemModel.deleteById(cartItem.id);

    return deletedCartItem;
  }
}

export default new CartService();
