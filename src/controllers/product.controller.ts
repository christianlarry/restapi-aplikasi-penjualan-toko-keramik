import { Request,Response,NextFunction } from "express"

import productService from "@/services/product.service"

const getMany = async (req:Request,res:Response,next:NextFunction)=>{
  try {
    const products = await productService.getMany()

    res.status(200).json({
      data: products
    }).end

  } catch (err) { 
    next(err)
  }
}

export default {
  getMany
}