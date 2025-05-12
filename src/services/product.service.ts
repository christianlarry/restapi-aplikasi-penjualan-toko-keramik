import { messages } from "@/constants/messages.strings"
import { ResponseError } from "@/errors/response.error"
import { Pagination } from "@/interfaces/pagination.interface"
import { Product, ProductFilters, ProductRequestBody } from "@/interfaces/products.interface"
import { postProductValidation } from "@/validations/product.validation"
import { validate } from "@/validations/validation"
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
const checkProductName = async (productName:string):Promise<boolean>=>{
    const existing = await getProductCollection().findOne({name: productName})
    
    return !!existing
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

const create = async (body:ProductRequestBody)=>{
  const product = validate<ProductRequestBody>(postProductValidation,body)

  // CEK APAKAH NAMA SUDAH DIGUNAKAN
  const isNameTaken:boolean = await checkProductName(product.name)
  if(isNameTaken) throw new ResponseError(400,messages.product.nameTaken)

  const result = await getProductCollection().insertOne({
    name: product.name,
    type: product.type,
    design: product.design,
    color: product.color,
    finishing: product.finishing,
    texture: product.texture,
    brand: product.brand,
    price: product.price,
    size:{
      height: product.size_height,
      width: product.size_width
    },
    createdAt: new Date(),
    updatedAt: new Date()
  })

  return {
    _id: result.insertedId,
    ...product
  }
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