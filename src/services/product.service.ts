import {db} from "@application/database"

// VARIABEL
const strCollectionProduct:string = "products"

const getMany = async ()=>{
  const products = await db.collection(strCollectionProduct).find().toArray()

  return products
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
  getMany,
  create,
  update,
  remove
}