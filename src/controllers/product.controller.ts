import { Request,Response,NextFunction } from "express"

// VAR
const fallbackPaginationSize = 10
const fallbackPaginationPage = 1

import productService from "@/services/product.service"
import { responseOk } from "@/utils/response"

const getMany = async (req:Request,res:Response,next:NextFunction)=>{
  try {
    // IF NEED PAGINATION
    const {pagination_size,pagination_page} = req.query

    if(pagination_page || pagination_size){

      const {product,pagination} = await productService.getPaginated(
        Number(pagination_page)||fallbackPaginationPage,
        Number(pagination_size)||fallbackPaginationSize
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