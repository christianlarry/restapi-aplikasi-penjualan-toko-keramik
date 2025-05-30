import { db } from "@/application/database"
import { Product } from "@/interfaces/products.interface"

export const productModel = () => {
  return db.collection<Product>("products")
}