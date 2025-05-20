import { messages } from "@/constants/messages.strings"
import { ResponseError } from "@/errors/response.error"
import { Pagination } from "@/interfaces/pagination.interface"
import { Product, ProductFilters, PostProduct, ProductFilterOptions } from "@/interfaces/products.interface"
import { checkValidObjectId } from "@/utils/checkValidObjectId"
import { deleteFile } from "@/utils/deleteFile"
import { postProductValidation, putProductValidation } from "@/validations/product.validation"
import { validate } from "@/validations/validation"
import {db} from "@application/database"
import { ObjectId } from "mongodb"

// VARIABEL
const strCollectionProduct:string = "products"
export const getProductCollection = ()=>{
  return db.collection<Product>(strCollectionProduct)
}
export const getProductFilterOptionsCollection = ()=>{
  return db.collection<ProductFilterOptions>("product_filter_options")
}

const getProductFilters = (filters:ProductFilters,searchQuery?:string)=>{
  return {
      ...(filters.design && { design: filters.design }),
      ...(filters.texture && { texture: filters.texture }),
      ...(filters.color && { color: filters.color }),
      ...(filters.finishing && { finishing: filters.finishing }),
      ...(filters.type && {type: filters.type}),
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
const updateFilterOptionsFromProduct = async (product: Product) => {
  const collection = await getProductFilterOptionsCollection();

  const filtersToCheck = [
    { type: "design", value: product.design },
    { type: "texture", value: product.texture },
    { type: "color", value: product.color },
    { type: "finishing", value: product.finishing },
    { type: "type", value: product.type }
  ];

  for (const filter of filtersToCheck) {
    await collection.updateOne(
      { type: filter.type, "options.value": { $ne: filter.value } }, // hanya update jika value belum ada
      {
        $push: { options: { label: filter.value, value: filter.value } }
      }
    );
  }

  // Handle size as unique pair
  const sizeValue = `${product.size.width}x${product.size.height}`;
  await collection.updateOne(
    { type: "size", "options.value": { $ne: sizeValue } },
    {
      $push: { options: { label: sizeValue, value: sizeValue } }
    }
  );
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

  const total = (await getProductCollection().find(getProductFilters(filters,searchQuery)).toArray()).length
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

  // Cek valid object id
  checkValidObjectId(id,messages.product.invalidId)

  const product:Product|null = await getProductCollection().findOne({
    _id: new ObjectId(id)
  })

  
  if (!product) throw new ResponseError(404, messages.product.notFound);

  return product
}

const getProductFilterOptions = async ()=>{
  const productFilterOptions:ProductFilterOptions[] = await getProductFilterOptionsCollection().find().toArray()

  return productFilterOptions
}

const create = async (body:PostProduct)=>{
  const product = validate<PostProduct>(postProductValidation,body)

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
    updatedAt: new Date(),
    image: null
  })

  if(result.acknowledged){
    const newProduct = await getProductCollection().findOne({_id: result.insertedId})

    if(newProduct) await updateFilterOptionsFromProduct(newProduct)
  }

  return {
    _id: result.insertedId,
    ...product
  }
}

const update = async (id:string,body:PostProduct)=>{
  const product:PostProduct = validate(putProductValidation,body)

  // Cek apakah id valid
  checkValidObjectId(id,messages.product.invalidId)

  const result = await getProductCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set:{
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
        updatedAt: new Date()
      }
    },
    {
      returnDocument: "after"
    }
  )

  if(!result) throw new ResponseError(404, messages.product.notFound)
  
  await updateFilterOptionsFromProduct(result)

  return result
}

const remove = async (id:string)=>{
  checkValidObjectId(id,messages.product.invalidId)

  const result = await getProductCollection().findOneAndDelete(
    {_id: new ObjectId(id)}
  )
  
  if(!result) throw new ResponseError(404,messages.product.notFound)

  if(result.image) deleteFile(result.image)

  return result
}

export default {
  get,
  getPaginated,
  getMany,
  getProductFilterOptions,
  create,
  update,
  remove
}