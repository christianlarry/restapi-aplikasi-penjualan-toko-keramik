import { Request,Response,NextFunction } from "express"

// VAR
const fallbackPaginationSize = 10
const fallbackPaginationPage = 1

import productService from "@/services/product.service"
import { responseOk } from "@/utils/response"
import { ProductFilters } from "@/interfaces/products.interface"

const getMany = async (req:Request,res:Response,next:NextFunction)=>{
  try {
    // SET FILTERS
    const filters:ProductFilters = {
      texture: req.query.texture?.toString(),
      finishing: req.query.finishing?.toString(),
      color: req.query.color?.toString(),
      design: req.query.design?.toString(),
      size: (req.query.size_height&&req.query.size_width) ? {
        height: Number(req.query.size_height),
        width: Number(req.query.size_width)
      }:undefined,
    }

    // IF NEED PAGINATION
    const {pagination_size,pagination_page} = req.query

    if(pagination_page || pagination_size){

      const {product,pagination} = await productService.getPaginated(
        Number(pagination_page)||fallbackPaginationPage,
        Number(pagination_size)||fallbackPaginationSize,
        filters
      )

      responseOk(res,200,product,pagination)

      return
    }

    const products = await productService.getMany()
    
    responseOk(res,200,products)

  } catch (err) { 
    next(err)
  }
}

export default {
  getMany
}