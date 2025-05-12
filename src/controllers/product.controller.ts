import { Request, Response, NextFunction } from "express";

// VAR
const fallbackPaginationSize = 10;
const fallbackPaginationPage = 1;

import productService from "@/services/product.service";
import { responseOk } from "@/utils/response";
import { ProductFilters, ProductRequestBody } from "@/interfaces/products.interface";
import { ResponseError } from "@/errors/response.error";
import { ObjectId } from "mongodb";
import { messages } from "@/constants/messages.strings";

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

    if (!ObjectId.isValid(productId))
      throw new ResponseError(400, messages.product.invalidId);

    const product = await productService.get(productId);

    if (!product) throw new ResponseError(404, messages.product.notFound);

    responseOk(res, 200, product);
  } catch (err) {
    next(err);
  }
};

const add = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // GET ALL REQUEST BODY 
    const {
      name,
      type,
      design,
      size_width,
      size_height,
      color,
      finishing,
      texture,
      brand,
      price
    }:ProductRequestBody = req.body

    const result = await productService.create({
      name,brand,color,design,finishing,price,size_height,size_width,texture,type
    })

    responseOk(res,201,result)

  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {};

const remove = async (req: Request, res: Response, next: NextFunction) => {};

export default {
  getMany,
  get,
  add,
  update,
  remove,
};
