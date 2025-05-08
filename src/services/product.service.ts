import { Pagination } from "@/interfaces/pagination.interface"
import { Product } from "@/interfaces/products.interface"
import {db} from "@application/database"
import { Collection } from "mongodb"

// VARIABEL
const strCollectionProduct:string = "products"
const getProductCollection = ()=>{
  return db.collection<Product>(strCollectionProduct)
}

const getMany = async ()=>{
  const product:Product[] = await getProductCollection().find().toArray()

  return product
}

const getPaginated = async (page:number,size:number)=>{
  const total = await getProductCollection().countDocuments()
  const totalPages = Math.ceil(total/size) 

  const pagination:Pagination = {
    total,
    size: size,
    totalPages,
    current: page
  }

  const product:Product[] = await getProductCollection()
    .find()
    .skip((page-1)*size)
    .limit(size)
    .toArray()

  return {
    product,
    pagination
  }
}

const get = (id:string)=>{

}

const create = ()=>{

}

const update = (id:string)=>{

}

const remove = (id:string)=>{

}

export default {
  get,
  getPaginated,
  getMany,
  create,
  update,
  remove
}