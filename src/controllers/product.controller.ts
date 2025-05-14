import { Request, Response, NextFunction } from "express";

// VAR
const fallbackPaginationSize = 10;
const fallbackPaginationPage = 1;

import productService from "@/services/product.service";
import { responseOk } from "@/utils/response";
import { ProductFilters, PostProduct, PutProduct } from "@/interfaces/products.interface";
import { ResponseError } from "@/errors/response.error";
import { validationsStrings } from "@/constants/validations.strings";

const getMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // FILTERS
    const filters: ProductFilters = {
      texture: req.query.texture?.toString(),
      finishing: req.query.finishing?.toString(),
      color: req.query.color?.toString(),
      design: req.query.design?.toString(),
      size:
        req.query.size_height && req.query.size_width
          ? {
              height: Number(req.query.size_height),
              width: Number(req.query.size_width),
            }
          : undefined,
    };

    // SEARCH QUERY
    const searchQuery: string | undefined = req.query.search?.toString();

    // IF NEED PAGINATION
    const { pagination_size, pagination_page } = req.query;

    if (pagination_page || pagination_size) {
      const { product, pagination } = await productService.getPaginated(
        parseInt(pagination_page as string) || fallbackPaginationPage,
        parseInt(pagination_size as string) || fallbackPaginationSize,
        searchQuery,
        filters
      );

      responseOk(res, 200, product, pagination);

      return;
    }
    // END IF NEED PAGINATION ---

    const products = await productService.getMany(searchQuery, filters);

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

    if(!productId) throw new ResponseError(404,validationsStrings.product.idRequired)

    const body:PutProduct = req.body

    const result = await productService.update(productId,body)

    responseOk(res,200,result)

  } catch (err) {
    next(err)
  }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {};

export default {
  getMany,
  get,
  add,
  update,
  remove,
};
