import { Pagination } from "@/interfaces/pagination.interface"
import { Product, ProductFilters } from "@/interfaces/products.interface"
import {db} from "@application/database"
import { ObjectId } from "mongodb"

// VARIABEL
const strCollectionProduct:string = "products"
const getProductCollection = ()=>{
  return db.collection<Product>(strCollectionProduct)
}
const getProductFilters = (filters:ProductFilters,searchQuery?:string)=>{
  return {
      ...(filters.design && { design: filters.design }),
      ...(filters.texture && { texture: filters.texture }),
      ...(filters.color && { color: filters.color }),
      ...(filters.finishing && { finishing: filters.finishing }),
      ...(filters.size && { 
        "size.width": filters.size.width,
        "size.height": filters.size.height 
      }),
      ...(searchQuery && {
      $or:[
        {design: {$regex: searchQuery,$options: "i"}},
        {texture: {$regex: searchQuery,$options: "i"}},
        {color: {$regex: searchQuery,$options: "i"}},
        {finishing: {$regex: searchQuery,$options: "i"}},
        {name: {$regex: searchQuery,$options: "i"}},
        {brand: {$regex: searchQuery,$options: "i"}}
      ]
    })
    }
}

const getMany = async (searchQuery:string|undefined,filters:ProductFilters)=>{
  const product:Product[] = await getProductCollection().find(getProductFilters(filters,searchQuery)).toArray()

  return product
}

const getPaginated = async (page:number,size:number,searchQuery:string|undefined,filters:ProductFilters)=>{

  const product:Product[] = await getProductCollection()
    .find(getProductFilters(filters,searchQuery))
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

const get = async (id:string)=>{
  const product:Product[] = await getProductCollection().find({
    _id: new ObjectId(id)
  }).toArray()

  return product[0]
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