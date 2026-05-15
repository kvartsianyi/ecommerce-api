import { ilike, lte, gte } from 'drizzle-orm';

import { products } from '@/db/schema';
import {
  FilterConfig,
  GetProductsFilters,
  OrderByConfig,
  PaginatedResult,
  Product,
  ProductFilters,
  ProductOrderByFields,
} from '@/models';
import cloudinaryService from './cloudinary.service';
import { NotFoundException } from '@/exceptions';
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE_NUMBER, ERROR_MESSAGES } from '@/constants';
import { buildWhere, buildOrderBy, calcTotalPages } from '@/utils';
import { ProductModel } from '@/db/models';

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

    const listQuery = ProductModel.list({
      whereConditions,
      orderByConditions,
      page,
      perPage,
    });
    const countQuery = ProductModel.count(whereConditions);

    const [data, totalCount] = await Promise.all([listQuery, countQuery]);

    const meta = {
      page,
      perPage,
      totalPages: calcTotalPages(totalCount, perPage),
    };

    return {
      data,
      meta,
    };
  }

  async getProduct(productId: number): Promise<Product> {
    const product = await ProductModel.findById(productId);

    if (!product) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST);
    }

    return product;
  }

  async createProduct(userId: number, productData: Product): Promise<Product> {
    productData.userId = userId;

    const product = await ProductModel.create(productData);

    return product;
  }

  async updateProduct(productId: number, productData: Partial<Product>): Promise<Product> {
    const product = await ProductModel.findById(productId);

    if (!product) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST);
    }

    const updatedProduct = await ProductModel.updateById(productId, productData);

    return updatedProduct;
  }

  async updateProductImage(productId: number, file: Express.Multer.File): Promise<Product> {
    const product = await ProductModel.findById(productId);

    if (!product) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST);
    }

    const updatedProduct = await ProductModel.updateById(productId, { image: file.path });

    const publicId = cloudinaryService.getPublicIdFromUrl(product.image);
    if (publicId) {
      await cloudinaryService.delete(publicId);
    }

    return updatedProduct;
  }

  async deleteProduct(productId: number): Promise<Product> {
    const product = await ProductModel.findById(productId);

    if (!product) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST);
    }

    const deletedProduct = await ProductModel.deleteById(productId);

    return deletedProduct;
  }
}

export default new ProductService();
