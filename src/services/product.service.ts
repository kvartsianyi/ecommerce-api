import db from '@/db';
import { products } from '@/db/schema';
import { Product } from '@/models';

class ProductService {
  async createProduct(userId: number, productData: Product): Promise<Product> {
    productData.userId = userId;

    const [product] = await db.insert(products).values(productData).returning();

    return product;
  }
}

export default new ProductService();
