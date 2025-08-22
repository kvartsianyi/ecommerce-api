import { eq } from 'drizzle-orm';

import db from '@/db';
import { products } from '@/db/schema';
import { Product } from '@/models';
import cloudinaryService from './cloudinary.service';
import { BadRequestException } from '@/exceptions';
import { ERROR_MESSAGES } from '@/constants';

class ProductService {
  async createProduct(userId: number, productData: Product): Promise<Product> {
    productData.userId = userId;

    const [product] = await db.insert(products).values(productData).returning();

    return product;
  }

  async updateProductImage(productId: number, file: Express.Multer.File): Promise<Product> {
    const product = await this.findById(productId);

    if (!product) {
      throw new BadRequestException(ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST);
    }

    const updatedProduct = await this.updateById(productId, { picture: file.path });

    const publicId = cloudinaryService.getPublicIdFromUrl(product.picture);
    if (publicId) {
      await cloudinaryService.delete(publicId);
    }

    return updatedProduct;
  }

  async deleteProduct(productId: number): Promise<Product> {
    const product = await this.findById(productId);

    if (!product) {
      throw new BadRequestException(ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST);
    }

    const deletedProduct = await this.deleteById(productId);

    return deletedProduct;
  }

  async findById(id: number): Promise<Product | undefined> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    return product;
  }

  async updateById(productId: number, productData: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, productId))
      .returning();

    return product;
  }

  async deleteById(productId: number): Promise<Product> {
    const [product] = await db.delete(products).where(eq(products.id, productId)).returning();

    return product;
  }
}

export default new ProductService();
