import { Pagination } from "@/interfaces/pagination.interface"
import { Product, ProductFilters } from "@/interfaces/products.interface"
import {db} from "@application/database"

// VARIABEL
const strCollectionProduct:string = "products"
const getProductCollection = ()=>{
  return db.collection<Product>(strCollectionProduct)
}

const getMany = async ()=>{
  const product:Product[] = await getProductCollection().find().toArray()

  return product
}

const getPaginated = async (page:number,size:number,filters:ProductFilters)=>{

  const product:Product[] = await getProductCollection()
    .find({
      ...(filters.design && { design: filters.design }),
      ...(filters.texture && { texture: filters.texture }),
      ...(filters.color && { color: filters.color }),
      ...(filters.finishing && { finishing: filters.finishing }),
      ...(filters.size && { 
        "size.width": filters.size.width,
        "size.height": filters.size.height 
      })
    })
    .skip((page-1)*size)
    .limit(size)
    .toArray()

  const total = product.length
  const totalPages = Math.ceil(total/size) 

  const pagination:Pagination = {
    total,
    size: size,
    totalPages,
    current: page
  }

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