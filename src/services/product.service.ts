import { eq, ilike, lte, gte, count, SQL } from 'drizzle-orm';
import { PgUpdateSetSource } from 'drizzle-orm/pg-core';

import db from '@/db';
import { products } from '@/db/schema';
import {
  FilterConfig,
  FindOptions,
  GetProductsFilters,
  OrderByConfig,
  PaginatedResult,
  Product,
  ProductFilters,
  ProductOrderByFields,
  QueryContext,
} from '@/models';
import cloudinaryService from './cloudinary.service';
import { NotFoundException } from '@/exceptions';
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE_NUMBER, ERROR_MESSAGES } from '@/constants';
import { buildWhere, buildOrderBy, calcOffset, calcTotalPages } from '@/utils';

class ProductService {
  async getProducts(filters: GetProductsFilters): Promise<PaginatedResult<Product>> {
    const { page = DEFAULT_PAGE_NUMBER, perPage = DEFAULT_ITEMS_PER_PAGE } = filters;

    const filterConfig: FilterConfig<ProductFilters> = {
      title: value => ilike(products.title, `%${value}%`),
      priceGt: value => gte(products.price, value),
      priceLt: value => lte(products.price, value),
    };
    const orderByConfig: OrderByConfig<ProductOrderByFields> = {
      title: products.title,
      price: products.price,
      _default: products.createdAt,
    };

    const whereConditions = buildWhere(filters, filterConfig);
    const orderByConditions = buildOrderBy(filters, orderByConfig);

    const query = db
      .select()
      .from(products)
      .where(whereConditions)
      .limit(perPage)
      .offset(calcOffset(page, perPage))
      .orderBy(orderByConditions);
    const countQuery = db.select({ count: count() }).from(products).where(whereConditions);

    const [data, [{ count: totalCount }]] = await Promise.all([query, countQuery]);

    return {
      data,
      page,
      perPage,
      totalPages: calcTotalPages(totalCount, perPage),
    };
  }

  async getProduct(productId: number): Promise<Product> {
    const product = await this.findById(productId);

    if (!product) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST);
    }

    return product;
  }

  async createProduct(userId: number, productData: Product): Promise<Product> {
    productData.userId = userId;

    const [product] = await db.insert(products).values(productData).returning();

    return product;
  }

  async updateProduct(productId: number, productData: Partial<Product>): Promise<Product> {
    const product = await this.findById(productId);

    if (!product) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST);
    }

    const updatedProduct = await this.updateById(productId, productData);

    return updatedProduct;
  }

  async updateProductImage(productId: number, file: Express.Multer.File): Promise<Product> {
    const product = await this.findById(productId);

    if (!product) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST);
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
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST);
    }

    const deletedProduct = await this.deleteById(productId);

    return deletedProduct;
  }

  async findById(
    id: number,
    { ctx = db, forUpdate = false }: FindOptions = {},
  ): Promise<Product | undefined> {
    const query = ctx.select().from(products).where(eq(products.id, id));

    if (forUpdate) {
      query.for('update');
    }

    const [product] = await query;

    return product;
  }

  async updateById(
    productId: number,
    productData: Partial<Product>,
    ctx: QueryContext = db,
  ): Promise<Product> {
    const [product] = await ctx
      .update(products)
      .set(productData)
      .where(eq(products.id, productId))
      .returning();

    return product;
  }

  async updateByParams(
    productData: PgUpdateSetSource<typeof products>,
    where: SQL | undefined,
    ctx: QueryContext = db,
  ): Promise<Product[]> {
    const updatedProducts = await ctx.update(products).set(productData).where(where).returning();

    return updatedProducts;
  }

  async deleteById(productId: number): Promise<Product> {
    const [product] = await db.delete(products).where(eq(products.id, productId)).returning();

    return product;
  }
}

export default new ProductService();
