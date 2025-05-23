import { ObjectId } from "mongodb"

export interface Product{
  _id?: ObjectId,
  name: string,
  description?: string,
  specification:{
    size: {
      width: number,
      height: number
    },
    application: string[],
    design: string,
    color: string[],
    finishing: string,
    texture: string,
    isWaterResistant:boolean,
    isSlipResistant:boolean,
  }
  brand: string,
  price: number,
  image?: string,
  recommended?: string[],
  createdAt: Date,
  updatedAt: Date
}

export interface ProductFilters{
  design?:string[],
  texture?:string[],
  finishing?:string[],
  color?:string[],
  application?:string[],
  size?:{
    width:string,
    height:string
  }[]
}

interface FilterOption{
  label:string,
  value:string
}

export interface ProductFilterOptions{
  _id: ObjectId,
  type:string,
  options:FilterOption[]
}

// export interface PostProduct{
//   name: string,
//   description?:string,
//   type: string,
//   design: string,
//   size_width: number,
//   size_height: number,
//   color: string,
//   finishing: string,
//   texture: string,
//   brand: string,
//   price: number,
//   is_water_resistant: boolean,
//   is_slip_resistant: boolean,
//   recommended?: string[]
// }

// export interface PutProduct extends PostProduct{}