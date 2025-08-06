import { Request, Response, NextFunction } from "express";

// VAR
const fallbackPaginationSize = 10;
const fallbackPaginationPage = 1;

import productService from "@/services/product.service";
import { responseOk } from "@/utils/response";
import { ProductFilters, ProductOrderBy } from "@/interfaces/products.interface";
import { PostProduct, PutProduct } from "@/validations/product.validation";
import { FilterQuery, parseQueryArray, parseQuerySizeToArray } from "@/utils/queryFormatter";

const getMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // FILTERS
    const filters: ProductFilters = {
      texture: parseQueryArray(req.query.texture as FilterQuery),
      finishing: parseQueryArray(req.query.finishing as FilterQuery),
      color: parseQueryArray(req.query.color as FilterQuery),
      design: parseQueryArray(req.query.design as FilterQuery),
      application: parseQueryArray(req.query.application as FilterQuery),
      size: parseQuerySizeToArray(req.query.size as FilterQuery),
      bestSeller: req.query.bestSeller?.toString()=="true",
      newArrivals: req.query.newArrivals?.toString()=="true",
      discounted: req.query.discounted?.toString()=="true"
    };

    // SEARCH QUERY
    const searchQuery: string | undefined = req.query.search?.toString();

    // ORDER BY Query
    const orderBy:string | undefined = req.query.order_by?.toString()

    // IF NEED PAGINATION
    const { pagination_size, pagination_page } = req.query;

    if (pagination_page || pagination_size) {
      const { product, pagination } = await productService.getPaginated(
        parseInt(pagination_page as string) || fallbackPaginationPage,
        parseInt(pagination_size as string) || fallbackPaginationSize,
        searchQuery,
        filters,
        orderBy as ProductOrderBy
      );

      responseOk(res, 200, product, pagination);

      return;
    }

    // END IF NEED PAGINATION ---
    const products = await productService.getMany(searchQuery, filters, orderBy as ProductOrderBy);

    responseOk(res, 200, products);
  } catch (err) {
    next(err);
  }
};

const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;

    const product = await productService.get(productId)

    responseOk(res, 200, product);
  } catch (err) {
    next(err);
  }
};

const getProductFilterOptions = async (_req: Request, res: Response, next: NextFunction)=>{
  try {
    const result = await productService.getProductFilterOptions()

    responseOk(res,200,result)
  } catch (err) {
    next(err)
  }
}

const add = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // GET ALL REQUEST BODY 
    const body:PostProduct = req.body

    const result = await productService.create(body)

    responseOk(res,201,result)

  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId:string = req.params.id

    const body:PutProduct = req.body

    const result = await productService.update(productId,body)

    responseOk(res,200,result)

  } catch (err) {
    next(err)
  }
};

const updateProductFlags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    const { isBestSeller, isNewArrivals } = req.body;

    const result = await productService.updateProductFlags(productId, { isBestSeller, isNewArrivals });
    responseOk(res, 200, result);
  } catch (err) {
    next(err);
  }
};

const updateProductDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    const { discount } = req.body;

    const result = await productService.updateProductDiscount(productId, discount);
    responseOk(res, 200, result);
  } catch (err) {
    next(err);
  }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId:string = req.params.id

    const result = await productService.remove(productId)

    responseOk(res,200,result)

  } catch (err) {
    next(err)
  }
};

export default {
  getMany,
  get,
  getProductFilterOptions,
  add,
  update,
  updateProductFlags,
  updateProductDiscount,
  remove,
};
