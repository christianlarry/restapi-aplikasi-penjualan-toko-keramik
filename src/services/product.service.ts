import { messages } from "@/constants/messages.strings"
import { ResponseError } from "@/errors/response.error"
import { Pagination } from "@/interfaces/pagination.interface"
import { Product, ProductFilters, ProductFilterOptions } from "@/interfaces/products.interface"
import { checkValidObjectId } from "@/utils/checkValidObjectId"
import { deleteFile } from "@/utils/deleteFile"
import { PostProduct, postProductValidation, PutProduct, putProductValidation } from "@/validations/product.validation"
import { validate } from "@/validations/validation"
import { db } from "@application/database"
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

const updateFilterOptionsFromProduct = async () => {
  const designOptions = await getProductCollection().distinct("design")
  const typeOptions = await getProductCollection().distinct("type")
  const textureOptions = await getProductCollection().distinct("texture")
  const finishingOptions = await getProductCollection().distinct("finishing")
  const colorOptions = await getProductCollection().distinct("color")
  const sizeOptions = await getProductCollection().distinct("size")

  const filtersToCheck = [
    { type: "design", options: designOptions },
    { type: "texture", options: textureOptions },
    { type: "color", options: colorOptions },
    { type: "finishing", options: finishingOptions },
    { type: "type", options: typeOptions },
    { type: "size", options: sizeOptions.map(val=>`${val.width}x${val.height}`)}
  ];

  for (const filter of filtersToCheck) {
    await getProductFilterOptionsCollection().updateOne(
      { type: filter.type }, // hanya update jika value belum ada
      {
        $set: {
          options: filter.options.map(val=>({label:val,value:val}))
        }
      }
    );
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
    ...(product.description && {description: product.description}),
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
    isSlipResistant: product.is_slip_resistant,
    isWaterResistant: product.is_water_resistant,
    ...(product.recommended && {recommended: product.recommended}),
    createdAt: new Date(),
    updatedAt: new Date()
  })

  if(result.acknowledged) await updateFilterOptionsFromProduct()

  return {
    _id: result.insertedId,
    ...product
  }
}

const update = async (id:string,body:PutProduct)=>{
  const product:PutProduct = validate(putProductValidation,body)

  // Cek apakah id valid
  checkValidObjectId(id,messages.product.invalidId)

  // Cek apakah produk ada
  const isProductExist = await getProductCollection().findOne({_id: new ObjectId(id)})
  if(!isProductExist) throw new ResponseError(404, messages.product.notFound)

  const result = await getProductCollection().updateOne(
    { _id: new ObjectId(id) },
    {
      $set:{
        name: product.name,
        ...(product.description && {description: product.description}),
        ...(product.recommended && {recommended: product.recommended}),
        isSlipResistant: product.is_slip_resistant,
        isWaterResistant: product.is_water_resistant,
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
    }
  )

  if(result.modifiedCount <= 0) throw new ResponseError(500,messages.product.errorProductNotUpdated)
  
  // Update isi dari Filter Options
  await updateFilterOptionsFromProduct()

  return {
    body
  }
}

const remove = async (id:string)=>{
  checkValidObjectId(id,messages.product.invalidId)

  const result = await getProductCollection().findOneAndDelete(
    {_id: new ObjectId(id)}
  )
  
  if(!result) throw new ResponseError(404,messages.product.notFound)

  if(result.image) deleteFile(result.image)
    
  // Update isi dari Filter Options
  await updateFilterOptionsFromProduct()

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