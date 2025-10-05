import { ObjectId } from "mongodb"
import { Product } from "@/interfaces/products.interface"
import { ResponseError } from "@/errors/response.error"
import { checkValidObjectId } from "@/utils/checkValidObjectId"
import { messages } from "@/constants/messages.strings"
import { deleteFile } from "@/utils/deleteFile"
import path from "path"
import fs from "fs"
import { productModel } from "@/models/product.model"

const uploadProductImage = async (
  productId:string,
  file:Express.Multer.File
)=>{
  // Cek apakah valid product Id
  checkValidObjectId(productId,messages.product.invalidId)

  const productObjectId = new ObjectId(productId)

  // Cek apakah product ada atau tidak!
  const product:Product|null = await productModel().findOne({
    _id: productObjectId
  })

  if(!product) throw new ResponseError(404,messages.product.notFound)

  // Hapus image sebelumnnya jika ada
  if(product.image) deleteFile("public\\"+product.image)

  // Ganti nama file
  const dateNow = new Date()

  const oldPath = file.path
  const newFileName = `${product.name.split(" ").join("-")}-${dateNow.getTime()}${path.extname(file.filename)}`.toLowerCase()
  const newPath = path.join(file.destination,newFileName)

  fs.rename(oldPath,newPath,(err)=>{
    if(err) throw new ResponseError(500, messages.product.errorFailedRenameUploadedImage)
  })

  // Update field image and meta updatedAt
  const result = await productModel().updateOne({
    _id: productObjectId
  },{
    $set:{
      image: newPath.replace(`public\\`,""),
      updatedAt: dateNow
    }
  })

  
  if (result.modifiedCount === 0) {
    throw new ResponseError(500, messages.product.errorProductNotUpdated);
  }

  // Kembalikan data produk baru
  const updatedProduct = await productModel().findOne({ _id: productObjectId });
  if (!updatedProduct) {
    throw new ResponseError(500, messages.product.errorProductNotFoundAfterUpdate);
  }

  return updatedProduct;
}

export default{
  uploadProductImage
}