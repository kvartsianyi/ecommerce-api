import { CartItem, UpsertCartItem, CartDetails, CartDetailsItem } from '@/models';
import { NotFoundException } from '@/exceptions';
import { ERROR_MESSAGES } from '@/constants';
import { CartItemModel, CartModel, ProductModel } from '@/db/models';

class CartService {
  async getCartDetails(userId: number): Promise<CartDetails | null> {
    const cartDetails = await CartModel.getCartDetails(userId);

    if (!cartDetails) {
      return null;
    }

    const items: CartDetailsItem[] = cartDetails.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      productId: item.product!.id,
      title: item.product!.title,
      picture: item.product!.picture,
      price: item.product!.price,
    }));
    const totalAmount = items.reduce((sum, { price, quantity }) => sum + price * quantity, 0);

    return {
      id: cartDetails.id,
      items,
      totalAmount,
    };
  }

  async addItemToCart(
    userId: number,
    cartItemData: Omit<UpsertCartItem, 'cartId'>,
  ): Promise<CartDetails> {
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

    const cartDetails = await this.getCartDetails(userId);

    return cartDetails!;
  }

  async updateCartItem(
    userId: number,
    id: number,
    cartItemData: Pick<CartItem, 'quantity'>,
  ): Promise<CartDetails> {
    const cartItem = await CartItemModel.findByIdAndUserId(id, userId);

    if (!cartItem) {
      throw new NotFoundException(ERROR_MESSAGES.CART_ITEM_DOES_NOT_EXIST);
    }

    await CartItemModel.updateById(id, cartItemData);

    const cartDetails = await this.getCartDetails(userId);

    return cartDetails!;
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
