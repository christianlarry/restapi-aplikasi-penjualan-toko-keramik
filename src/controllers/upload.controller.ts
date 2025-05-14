import { NextFunction, Request, Response } from "express"
import uploadService from "@/services/upload.service";
import { responseOk } from "@/utils/response";
import { ResponseError } from "@/errors/response.error";
import { validationsStrings } from "@/constants/validations.strings";

const uploadProductImage = (req:Request,res:Response,next:NextFunction)=>{
  try {
    const {productId} = req.body

    // Cek field ProductId
    if (!productId) throw new ResponseError(400,validationsStrings.product.idRequired)

    // Cek apakah ada file yang dikirim
    if (!req.file) throw new ResponseError(400,validationsStrings.product.imageFileRequired)

    const updatedProduct = uploadService.uploadProductImage(productId,req.file.path)

    responseOk(res,201,updatedProduct)

  } catch (err) {
    next(err)
  }
}

export default{
  uploadProductImage
}