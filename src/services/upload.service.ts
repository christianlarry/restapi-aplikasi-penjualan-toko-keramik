import { ObjectId } from "mongodb"
import { getProductCollection } from "./product.service"
import { Product } from "@/interfaces/products.interface"
import { ResponseError } from "@/errors/response.error"
import { checkValidObjectId } from "@/utils/checkValidObjectId"
import { messages } from "@/constants/messages.strings"

const uploadProductImage = async (
  productId:string,
  imagePath:string
)=>{
  const productObjectId = new ObjectId(productId)

  // Cek apakah valid Project Id
  checkValidObjectId(productId,messages.product.invalidId)

  // Cek apakah product ada atau tidak!
  const product:Product|null = await getProductCollection().findOne({
    _id: productObjectId
  })

  if(!product) throw new ResponseError(404,messages.product.notFound)

  // Update field image and meta updatedAt
  const result = await getProductCollection().updateOne({
    _id: productObjectId
  },{
    $set:{
      image: imagePath,
      updatedAt: new Date()
    }
  })

  
  if (result.modifiedCount === 0) {
    throw new ResponseError(500, messages.product.errorProductNotUpdated);
  }

  // Kembalikan data produk baru
  const updatedProduct = await getProductCollection().findOne({ _id: productObjectId });
  if (!updatedProduct) {
    throw new ResponseError(500, messages.product.errorProductNotFoundAfterUpdate);
  }

  return updatedProduct;
}

export default{
  uploadProductImage
}