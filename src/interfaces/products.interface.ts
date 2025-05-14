import { ObjectId } from "mongodb"

export interface Product{
  _id?: ObjectId,
  name: string,
  type: string,
  design: string,
  size: {
    width: number,
    height: number
  },
  color: string,
  finishing: string,
  texture: string,
  brand: string,
  price: number,
  image?: string | null,
  createdAt: Date,
  updatedAt: Date
}

export interface ProductFilters{
  design?:string,
  texture?:string,
  finishing?:string,
  color?:string,
  size?:{
    height:number,
    width:number
  }
}

export interface PostProduct{
  name: string,
  type: string,
  design: string,
  size_width: number,
  size_height: number,
  color: string,
  finishing: string,
  texture: string,
  brand: string,
  price: number
}

export interface PutProduct extends PostProduct{}