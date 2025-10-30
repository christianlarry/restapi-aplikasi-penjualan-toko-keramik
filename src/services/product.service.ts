import { messages } from "@/constants/messages.strings"
import { validationsStrings } from "@/constants/validations.strings"
import { ResponseError } from "@/errors/response.error"
import { ValidationError } from "@/errors/validation.error"
import { Pagination } from "@/interfaces/pagination.interface"
import { Product, ProductFilters, ProductFilterOptions, ProductOrderBy, GetProductResponse } from "@/interfaces/products.interface"
import { productModel } from "@/models/product.model"
import { checkValidObjectId } from "@/utils/checkValidObjectId"
import { deleteFile } from "@/utils/deleteFile"
import { PostProduct, postProductValidation, promptValidation, PutProduct, putProductValidation } from "@/validations/product.validation"
import { validate } from "@/validations/validation"
import { db } from "@application/database"
import { Filter, FindCursor, ObjectId, WithId } from "mongodb"

import embeddingService from "@/services/embedding.service"
import { pineconeIndex } from "@/application/pinecone"
import { application } from "express"
import { genAI } from "@/application/gemini"

export const getProductFilterOptionsCollection = () => {
  return db.collection<ProductFilterOptions>("product_filter_options")
}

const getProductFilters = (filters: ProductFilters, searchQuery?: string): Filter<Product> => {

  let orArr: any[] = []

  if (filters.size && filters.size.length > 0) {
    orArr = orArr.concat(filters.size.map(size => ({
      "specification.size.width": size.width,
      "specification.size.height": size.height
    })))
  }

  if (searchQuery) {
    orArr = orArr.concat([
      { "specification.design": { $regex: searchQuery, $options: "i" } },
      { "specification.texture": { $regex: searchQuery, $options: "i" } },
      { "specification.color": { $regex: searchQuery, $options: "i" } },
      { "specification.finishing": { $regex: searchQuery, $options: "i" } },
      { name: { $regex: searchQuery, $options: "i" } },
      { brand: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
      { recommended: { $regex: searchQuery, $options: "i" } }
    ])
  }

  return {
    ...(filters.design && { "specification.design": { $in: filters.design } }),
    ...(filters.texture && { "specification.texture": { $in: filters.texture } }),
    ...(filters.color && { "specification.color": { $in: filters.color } }),
    ...(filters.finishing && { "specification.finishing": { $in: filters.finishing } }),
    ...(filters.application && { "specification.application": { $in: filters.application } }),
    ...(filters.discounted && { discount: { $gt: 0 } }),
    ...(filters.bestSeller && { isBestSeller: true }),
    ...(filters.newArrivals && { isNewArrivals: true }),
    ...(orArr.length > 0 && { $or: orArr })
  }
}

const checkProductName = async (productName: string): Promise<boolean> => {
  const existing = await productModel().findOne({ name: productName })

  return !!existing
}

const checkUpdatingProductName = async (productId: string, productName: string): Promise<boolean> => {
  const existing = await productModel().findOne({ name: productName, _id: { $ne: new ObjectId(productId) } })

  return !!existing
}

const updateFilterOptionsFromProduct = async () => {
  const designOptions = await productModel().distinct("specification.design")
  const applicationOptions = await productModel().distinct("specification.application")
  const textureOptions = await productModel().distinct("specification.texture")
  const finishingOptions = await productModel().distinct("specification.finishing")
  const colorOptions = await productModel().distinct("specification.color")
  const sizeOptions = await productModel().distinct("specification.size")

  const filtersToCheck = [
    { type: "design", options: designOptions },
    { type: "texture", options: textureOptions },
    { type: "color", options: colorOptions },
    { type: "finishing", options: finishingOptions },
    { type: "application", options: applicationOptions },
    { type: "size", options: sizeOptions.map(val => `${val.width}x${val.height}`) }
  ];

  for (const filter of filtersToCheck) {
    await getProductFilterOptionsCollection().updateOne(
      { type: filter.type }, // hanya update jika value belum ada
      {
        $set: {
          options: filter.options.map(val => ({ label: val, value: val }))
        }
      },
      {
        upsert: true
      }
    );
  }
}

const orderedProduct = (orderBy: ProductOrderBy | undefined, findCursor: FindCursor<WithId<Product>>) => {
  switch (orderBy) {
    case "price_htl":
      return findCursor.sort("price", "desc")
    case "price_lth":
      return findCursor.sort("price", "asc")
    case "name_atz":
      return findCursor.sort("name", "desc")
    default:
      return findCursor
  }
}

const convertProductToResponseObj = (product: Product): GetProductResponse => {
  return {
    ...product,
    finalPrice: product.discount ? product.price - (product.price * product.discount / 100) : product.price
  }
}

const getMany = async (
  searchQuery: string | undefined,
  filters: ProductFilters,
  orderBy?: ProductOrderBy
) => {

  const findProductResult = await productModel().find(getProductFilters(filters, searchQuery))

  // Urutkan Product berdasarkan Parameter OrderBy Jika ada
  const product: Product[] = await orderedProduct(
    orderBy,
    findProductResult
  ).toArray()

  return product.map(item => convertProductToResponseObj(item))
}

const getPaginated = async (
  page: number,
  size: number,
  searchQuery: string | undefined,
  filters: ProductFilters,
  orderBy?: ProductOrderBy
) => {

  const findProductResult = await productModel()
    .find(getProductFilters(filters, searchQuery))
    .skip((page - 1) * size)
    .limit(size)

  // Urutkan Product berdasarkan Parameter OrderBy Jika ada
  const product: Product[] = await orderedProduct(orderBy, findProductResult).toArray()

  const total = await productModel().countDocuments(getProductFilters(filters, searchQuery))
  const totalPages = Math.ceil(total / size)

  const pagination: Pagination = {
    total,
    size: size,
    totalPages,
    current: page
  }

  return {
    product: product.map(item => convertProductToResponseObj(item)),
    pagination
  }
}

const get = async (id: string) => {
  // Cek valid object id
  checkValidObjectId(id, messages.product.invalidId)

  const product: Product | null = await productModel().findOne({
    _id: new ObjectId(id)
  })


  if (!product) throw new ResponseError(404, messages.product.notFound);

  return convertProductToResponseObj(product)
}

const getProductFilterOptions = async () => {
  const productFilterOptions: ProductFilterOptions[] = await getProductFilterOptionsCollection().find().toArray()

  return productFilterOptions
}

const create = async (body: PostProduct) => {
  const product = validate<PostProduct>(postProductValidation, body)

  // CEK APAKAH NAMA SUDAH DIGUNAKAN
  const isNameTaken: boolean = await checkProductName(product.name)
  if (isNameTaken) throw new ValidationError([{ field: "name", message: messages.product.nameTaken }])

  const result = await productModel().insertOne({
    name: product.name,
    ...(product.description && { description: product.description }),
    specification: {
      application: product.application,
      color: product.color,
      design: product.design,
      finishing: product.finishing,
      texture: product.texture,
      size: {
        height: product.sizeHeight,
        width: product.sizeWidth
      },
      isSlipResistant: product.isSlipResistant,
      isWaterResistant: product.isWaterResistant
    },
    brand: product.brand,
    price: product.price,
    tilesPerBox: product.tilesPerBox,
    ...(product.discount && { discount: product.discount }),
    isBestSeller: product.isBestSeller || false,
    isNewArrivals: product.isNewArrivals || false,
    ...(product.recommended && { recommended: product.recommended }),
    createdAt: new Date(),
    updatedAt: new Date()
  })

  if (result.acknowledged) await updateFilterOptionsFromProduct()

  const newProduct = await productModel().findOne({ _id: result.insertedId })

  return {
    ...newProduct
  }
}

const update = async (id: string, body: PutProduct) => {
  const product: PutProduct = validate(putProductValidation, body)

  // Cek apakah id valid
  checkValidObjectId(id, messages.product.invalidId)
  
  // CEK APAKAH NAMA SUDAH DIGUNAKAN
  const isNameTaken: boolean = await checkUpdatingProductName(id,product.name)
  if (isNameTaken) throw new ValidationError([{ field: "name", message: messages.product.nameTaken }])

  // Cek apakah produk ada
  const isProductExist = await productModel().findOne({ _id: new ObjectId(id) })
  if (!isProductExist) throw new ResponseError(404, messages.product.notFound)

  const result = await productModel().findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        name: product.name,
        ...(product.description && { description: product.description }),
        ...(product.recommended && { recommended: product.recommended }),
        specification: {
          isSlipResistant: product.isSlipResistant,
          isWaterResistant: product.isWaterResistant,
          application: product.application,
          design: product.design,
          color: product.color,
          finishing: product.finishing,
          texture: product.texture,
          size: {
            height: product.sizeHeight,
            width: product.sizeWidth
          },
        },
        brand: product.brand,
        price: product.price,
        tilesPerBox: product.tilesPerBox,
        ...(product.discount && { discount: product.discount }),
        ...(typeof product.isBestSeller !== 'undefined' && { isBestSeller: product.isBestSeller }),
        ...(typeof product.isNewArrivals !== 'undefined' && { isNewArrivals: product.isNewArrivals }),
        updatedAt: new Date()
      }
    },
    {
      returnDocument: "after"
    }
  )

  if (!result) throw new ResponseError(500, messages.product.errorProductNotUpdated)

  // Update isi dari Filter Options
  await updateFilterOptionsFromProduct()

  return convertProductToResponseObj(result)
}

const updateProductFlags = async (
  productId: string,
  flags: { isBestSeller?: boolean; isNewArrivals?: boolean }
) => {
  checkValidObjectId(productId, messages.product.invalidId);

  // Hanya update field yang diberikan
  const updateFields: any = {};
  
  if (typeof flags.isBestSeller !== "undefined") {
    updateFields.isBestSeller = flags.isBestSeller;
  }
  if (typeof flags.isNewArrivals !== "undefined") {
    updateFields.isNewArrivals = flags.isNewArrivals;
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ValidationError([
      { field: "flags", message: "No valid flag fields provided" }
    ]);
  }

  const result = await productModel().findOneAndUpdate(
    { _id: new ObjectId(productId) },
    { $set: updateFields },
    { returnDocument: "after" }
  );

  if (!result) throw new ResponseError(404, messages.product.notFound);

  return convertProductToResponseObj(result);
}

const updateProductDiscount = async (productId: string, discount: number) => {
  checkValidObjectId(productId, messages.product.invalidId);

  if (discount < 0 || discount > 100) {
    throw new ValidationError([{ field: "discount", message: validationsStrings.product.discountMustBeBetween0And100 }]);
  }

  const result = await productModel().findOneAndUpdate(
    { _id: new ObjectId(productId) },
    { $set: { discount } },
    { returnDocument: "after" }
  );

  if(!result) throw new ResponseError(404, messages.product.notFound);

  return convertProductToResponseObj(result)
}

const remove = async (id: string) => {
  checkValidObjectId(id, messages.product.invalidId)

  const result = await productModel().findOneAndDelete(
    { _id: new ObjectId(id) }
  )

  if (!result) throw new ResponseError(404, messages.product.notFound)

  if (result.image) deleteFile("public\\"+result.image)

  // Update isi dari Filter Options
  await updateFilterOptionsFromProduct()

  return result
}

const generateProductEmbeddings = async ()=>{
  const products = await productModel().find().toArray()

  for(const product of products){
    const text = `${product.name}. ${product.description ?? ""}. Desain: ${product.specification.design}. Tekstur: ${product.specification.texture}. Warna: ${product.specification.color.join(", ")}. Finishing: ${product.specification.finishing}. Aplikasi: ${product.specification.application.join(", ")}. Merek: ${product.brand}. Harga: ${product.price}. Ukuran: ${product.specification.size.width}x${product.specification.size.height}. Cocok Untuk: ${product.recommended?.join(", ") ?? ""}`

    const embeddings = await embeddingService.getEmbeddingFromText(text)
    
    await pineconeIndex.upsert([
      {
        id: product._id.toString(),
        values: embeddings,
        metadata: {
          name: product.name,
          description: product.description ?? "",
          size: product.specification.size.width + "x" + product.specification.size.height,
          application: product.specification.application.join(", "),
          color: product.specification.color.join(", "),
          design: product.specification.design,
          texture: product.specification.texture,
          finishing: product.specification.finishing,
          brand: product.brand,
          price: product.price,
        }
      }
    ])

  }

  console.log("✅ Product embeddings uploaded to Pinecone!");
}

const getProductRecommendationsByAI = async (prompt:string)=>{

  validate(promptValidation,prompt)

  const promptVector = await embeddingService.getEmbeddingFromText(prompt)
  const results = await pineconeIndex.query({
    vector: promptVector,
    topK: 5,
    includeMetadata: true,
  })

  const context = results.matches
    .map(match =>
        `id: ${match.id}` +
        `Nama: ${match.metadata?.name}. ` +
        `Deskripsi: ${match.metadata?.description}. ` +
        `Ukuran: ${match.metadata?.size}. ` + 
        `Aplikasi: ${match.metadata?.application}. ` +
        `Warna: ${match.metadata?.color}. ` +
        `Desain: ${match.metadata?.design}. ` +
        `Tekstur: ${match.metadata?.texture}. ` +
        `Finishing: ${match.metadata?.finishing}. ` +
        `Brand: ${match.metadata?.brand}. ` +
        `Harga: ${match.metadata?.price}.`
    )
    .join('\n');

  const promptText = `Kamu adalah asisten toko keramik online. Berdasarkan deskripsi berikut: "${prompt}" dan produk yang tersedia: 
  ${context} 
  Berikan rekomendasi yang paling cocok, jelaskan alasan pemilihannya.
  Jika deskripsi yang diberikan kosong atau tidak jelas, jelaskan kalau prompt tidak jelas.`

  // AI Generate Response
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: promptText
  })
  const aiResponseText = response.text
  
  // Dapatkan Product Dari database untuk Suggestions
  const productIds = await results.matches.map(match => new ObjectId(match.id))

  const suggestions = await productModel().find({
    _id: {$in: productIds}
  }).toArray()

  return {
    message: aiResponseText,
    suggestions
  }
}

export default {
  get,
  getPaginated,
  getMany,
  getProductFilterOptions,
  create,
  update,
  updateProductFlags,
  updateProductDiscount,
  remove,
  generateProductEmbeddings,
  getProductRecommendationsByAI
}